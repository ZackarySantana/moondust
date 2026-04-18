package service

import (
	"context"
	"fmt"
	"log/slog"
	"moondust/internal/v1/store"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func (s *Service) GetThreadGitStatus(ctx context.Context, threadID string) (*store.GitStatus, error) {
	thread, project, err := s.resolveThreadProject(ctx, threadID)
	if err != nil {
		return nil, err
	}

	dir := project.Directory
	if thread.WorktreeDir != "" {
		dir = thread.WorktreeDir
	}

	statusOut, err := runGit(ctx, dir, "status", "--short", "--branch")
	if err != nil {
		return nil, err
	}

	lines := strings.Split(strings.TrimSpace(statusOut), "\n")
	status := &store.GitStatus{}
	for i, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		if i == 0 && strings.HasPrefix(line, "## ") {
			status.Branch = strings.TrimPrefix(line, "## ")
			continue
		}
		status.Entries = append(status.Entries, line)
	}
	return status, nil
}

func (s *Service) GetThreadGitReview(ctx context.Context, threadID string) (*store.GitReview, error) {
	thread, project, err := s.resolveThreadProject(ctx, threadID)
	if err != nil {
		return nil, err
	}

	dir := project.Directory
	if thread.WorktreeDir != "" {
		dir = thread.WorktreeDir
	}

	s.maybeBackgroundFetch(ctx, dir)

	defaultBranch := strings.TrimSpace(project.DefaultBranch)
	if defaultBranch == "" {
		defaultBranch = "origin/main"
	}

	review := &store.GitReview{
		RemoteURL:     project.RemoteURL,
		DefaultBranch: defaultBranch,
	}

	statusOut, err := runGit(ctx, dir, "status", "--porcelain=v1", "--branch")
	if err != nil {
		return nil, err
	}
	parseGitStatus(review, statusOut)

	localOut, err := runGit(ctx, dir, "log", "--no-color",
		"--pretty=format:%h\t%s\t%an\t%ar\t%aI", defaultBranch+"..HEAD", "-n", "20")
	if err == nil {
		review.LocalCommits = parseCommitsWithDate(localOut)
	}

	mainOut, err := runGit(ctx, dir, "log", "--no-color",
		"--pretty=format:%h\t%s\t%an\t%ar\t%aI", defaultBranch, "-n", "8")
	if err == nil {
		review.MainCommits = parseCommitsWithDate(mainOut)
	}

	stashOut, err := runGit(ctx, dir, "stash", "list")
	if err == nil {
		stashOut = strings.TrimSpace(stashOut)
		if stashOut != "" {
			review.StashCount = len(strings.Split(stashOut, "\n"))
		}
	}

	remoteOut, err := runGit(ctx, dir, "remote")
	if err == nil && strings.TrimSpace(remoteOut) != "" {
		review.HasRemote = true
	}

	diffStatOut, err := runGit(ctx, dir, "diff", "--stat")
	if err == nil {
		review.DiffStat = strings.TrimSpace(diffStatOut)
	}

	patchOut, err := runGit(ctx, dir, "diff", "--no-color", "--", ".")
	if err == nil {
		patch := strings.TrimSpace(patchOut)
		if patch == "" {
			cachedOut, cachedErr := runGit(ctx, dir, "diff", "--cached", "--no-color", "--", ".")
			if cachedErr == nil {
				patch = strings.TrimSpace(cachedOut)
			}
		}
		if len(patch) > 8000 {
			patch = patch[:8000] + "\n\n... (truncated)"
		}
		review.PatchPreview = patch
	}

	return review, nil
}

func (s *Service) GetFileDiff(ctx context.Context, threadID, filePath, status string) (*store.FileDiff, error) {
	thread, project, err := s.resolveThreadProject(ctx, threadID)
	if err != nil {
		return nil, err
	}

	dir := project.Directory
	if thread.WorktreeDir != "" {
		dir = thread.WorktreeDir
	}

	result := &store.FileDiff{
		Path:     filePath,
		Language: langFromExt(filePath),
	}

	fullPath := filepath.Join(dir, filePath)

	switch status {
	case "untracked":
		content, err := os.ReadFile(fullPath)
		if err != nil {
			return nil, fmt.Errorf("read file: %w", err)
		}
		result.Modified = string(content)
		return result, nil

	case "A":
		// Staged new file: show from index
		indexed, err := runGit(ctx, dir, "show", ":"+filePath)
		if err != nil {
			// Fall back to reading from disk
			content, readErr := os.ReadFile(fullPath)
			if readErr != nil {
				return nil, fmt.Errorf("read file: %w", readErr)
			}
			result.Modified = string(content)
			return result, nil
		}
		result.Modified = indexed
		return result, nil

	case "D":
		original, err := runGit(ctx, dir, "show", "HEAD:"+filePath)
		if err != nil {
			return nil, fmt.Errorf("get original: %w", err)
		}
		result.Original = original
		return result, nil

	default:
		// M, R, C or any other status: show HEAD vs working copy (or index)
		original, err := runGit(ctx, dir, "show", "HEAD:"+filePath)
		if err != nil {
			original = ""
		}
		result.Original = original

		content, err := os.ReadFile(fullPath)
		if err != nil {
			// Might be staged only - try from index
			indexed, idxErr := runGit(ctx, dir, "show", ":"+filePath)
			if idxErr != nil {
				return nil, fmt.Errorf("read file: %w", err)
			}
			result.Modified = indexed
		} else {
			result.Modified = string(content)
		}
		return result, nil
	}
}

func langFromExt(path string) string {
	ext := strings.ToLower(filepath.Ext(path))
	switch ext {
	case ".go":
		return "go"
	case ".ts", ".tsx":
		return "typescript"
	case ".js", ".jsx", ".mjs", ".cjs":
		return "javascript"
	case ".py":
		return "python"
	case ".rs":
		return "rust"
	case ".java":
		return "java"
	case ".rb":
		return "ruby"
	case ".css":
		return "css"
	case ".html", ".htm":
		return "html"
	case ".json":
		return "json"
	case ".yaml", ".yml":
		return "yaml"
	case ".toml":
		return "toml"
	case ".md", ".markdown":
		return "markdown"
	case ".sh", ".bash", ".zsh":
		return "shell"
	case ".sql":
		return "sql"
	case ".xml":
		return "xml"
	case ".c", ".h":
		return "c"
	case ".cpp", ".hpp", ".cc":
		return "cpp"
	case ".swift":
		return "swift"
	case ".kt", ".kts":
		return "kotlin"
	case ".lua":
		return "lua"
	case ".dockerfile":
		return "dockerfile"
	default:
		if strings.HasSuffix(strings.ToLower(filepath.Base(path)), "dockerfile") {
			return "dockerfile"
		}
		if strings.HasSuffix(strings.ToLower(filepath.Base(path)), "makefile") {
			return "makefile"
		}
		return "plaintext"
	}
}

const fetchThrottle = 60 * time.Second

func (s *Service) maybeBackgroundFetch(ctx context.Context, dir string) {
	s.lastFetchMu.Lock()
	last, ok := s.lastFetchByDir[dir]
	if ok && time.Since(last) < fetchThrottle {
		s.lastFetchMu.Unlock()
		return
	}
	s.lastFetchByDir[dir] = time.Now()
	s.lastFetchMu.Unlock()

	if _, err := runGit(ctx, dir, "fetch", "origin", "--quiet"); err != nil {
		slog.WarnContext(ctx, "background git fetch failed", "dir", dir, "error", err)
	}
}
