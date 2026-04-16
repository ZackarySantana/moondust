package service

import (
	"context"
	"fmt"
	"moondust/internal/chat"
	"moondust/internal/openrouter"
	"moondust/internal/store"
	"os"
	"path/filepath"
	"strings"
	"unicode/utf8"
)

const maxConflictFileBytes = 200_000

func stripMarkdownCodeFence(s string) string {
	s = strings.TrimSpace(s)
	if !strings.HasPrefix(s, "```") {
		return s
	}
	rest := s[3:]
	if nl := strings.IndexByte(rest, '\n'); nl >= 0 {
		rest = rest[nl+1:]
	} else {
		return strings.TrimSpace(rest)
	}
	if i := strings.LastIndex(rest, "```"); i >= 0 {
		rest = rest[:i]
	}
	return strings.TrimSpace(rest)
}

func looksBinarySample(data []byte) bool {
	end := len(data)
	if end > 8192 {
		end = 8192
	}
	return strings.IndexByte(string(data[:end]), 0) >= 0
}

// resolveGitConflictsCore implements conflict resolution. If onDelta is non-nil, streams
// from the utility model per file; otherwise uses a single-shot generate per file.
func (s *Service) resolveGitConflictsCore(ctx context.Context, threadID string, onDelta func(string) error) (string, error) {
	st, err := s.settingsStore.Get(ctx)
	if err != nil {
		return "", fmt.Errorf("load settings: %w", err)
	}
	if st == nil {
		st = &store.Settings{}
	}

	dir, err := s.gitDirForThread(ctx, threadID)
	if err != nil {
		return "", err
	}

	state, err := s.GitConflictState(ctx, threadID)
	if err != nil {
		return "", err
	}
	if !state.InMerge && !state.InRebase {
		return "", fmt.Errorf("no merge or rebase in progress")
	}
	paths := state.ConflictFiles
	if len(paths) == 0 {
		return "", fmt.Errorf("no conflicted files to resolve")
	}

	var log strings.Builder
	for _, rel := range paths {
		rel = filepath.ToSlash(strings.TrimSpace(rel))
		if rel == "" {
			continue
		}
		if onDelta != nil {
			if err := onDelta(fmt.Sprintf("\n── %s ──\n", rel)); err != nil {
				return "", err
			}
		}
		full := filepath.Join(dir, filepath.FromSlash(rel))
		data, err := os.ReadFile(full)
		if err != nil {
			return "", fmt.Errorf("read %s: %w", rel, err)
		}
		if len(data) > maxConflictFileBytes {
			return "", fmt.Errorf("file too large for auto-resolve (%s); max %d bytes", rel, maxConflictFileBytes)
		}
		if len(data) > 0 && looksBinarySample(data) {
			return "", fmt.Errorf("binary file cannot be auto-resolved: %s", rel)
		}
		if !utf8.ValidString(string(data)) {
			return "", fmt.Errorf("invalid UTF-8 in %s", rel)
		}
		text := string(data)

		var resolved string
		if onDelta != nil {
			user := chat.ConflictResolveUserPrompt(rel, text)
			apiMessages := []openrouter.APIMessage{
				{Role: "system", Content: ptrString(chat.ConflictResolveSystemPrompt)},
				{Role: "user", Content: ptrString(user)},
			}
			resolved, err = s.utilityStream(ctx, st, dir, chat.ConflictResolveSystemPrompt, apiMessages, onDelta)
		} else {
			resolved, err = s.utilityGenerate(ctx, st, dir, chat.ConflictResolveSystemPrompt, chat.ConflictResolveUserPrompt(rel, text))
		}
		if err != nil {
			return "", fmt.Errorf("%s: %w", rel, err)
		}

		out := stripMarkdownCodeFence(resolved)
		if strings.Contains(out, "<<<<<<<") || strings.Contains(out, "=======") || strings.Contains(out, ">>>>>>>") {
			return log.String(), fmt.Errorf("utility model left conflict markers in %s; try again or resolve manually", rel)
		}
		mode := os.FileMode(0o644)
		if info, statErr := os.Stat(full); statErr == nil {
			mode = info.Mode().Perm()
		}
		if err := os.WriteFile(full, []byte(out), mode); err != nil {
			return "", fmt.Errorf("write %s: %w", rel, err)
		}
		fmt.Fprintf(&log, "Resolved %s\n", rel)
		if onDelta != nil {
			if err := onDelta(fmt.Sprintf("\n✓ Staged %s\n", rel)); err != nil {
				return "", err
			}
		}
		if _, err := runGit(ctx, dir, "add", "--", rel); err != nil {
			return "", fmt.Errorf("git add %s: %w", rel, err)
		}
	}

	if state.InRebase {
		cont, err := runGitWithEnv(ctx, dir, []string{"GIT_EDITOR=true", "GIT_SEQUENCE_EDITOR=true"}, "rebase", "--continue")
		if err != nil {
			return log.String(), err
		}
		log.WriteString(cont)
		return log.String(), nil
	}
	cont, err := runGitWithEnv(ctx, dir, []string{"GIT_EDITOR=true"}, "merge", "--continue")
	if err != nil {
		return log.String(), err
	}
	log.WriteString(cont)
	return log.String(), nil
}

// ResolveGitConflictsWithUtilityAgent uses the configured utility LLM to fix each
// conflicted file, stages them, then runs merge --continue or rebase --continue.
func (s *Service) ResolveGitConflictsWithUtilityAgent(ctx context.Context, threadID string) (string, error) {
	return s.resolveGitConflictsCore(ctx, threadID, nil)
}

// StreamResolveGitConflictsWithUtilityAgent is like ResolveGitConflictsWithUtilityAgent but
// streams model output through onDelta for each file.
func (s *Service) StreamResolveGitConflictsWithUtilityAgent(ctx context.Context, threadID string, onDelta func(string) error) (string, error) {
	if onDelta == nil {
		return "", fmt.Errorf("onDelta is required")
	}
	return s.resolveGitConflictsCore(ctx, threadID, onDelta)
}
