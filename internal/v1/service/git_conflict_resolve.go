package service

import (
	"context"
	"fmt"
	"moondust/internal/v1/chat"
	"moondust/internal/v1/store"
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

const maxConflictRounds = 30

// resolveGitConflictsCore implements conflict resolution, looping through every
// commit in a rebase that may conflict. Each round: resolve files → stage → continue.
// If the next commit also conflicts, loop again (up to maxConflictRounds).
func (s *Service) resolveGitConflictsCore(ctx context.Context, threadID string, onStatus func(string)) (string, error) {
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

	var log strings.Builder

	for round := 0; round < maxConflictRounds; round++ {
		state, err := s.GitConflictState(ctx, threadID)
		if err != nil {
			return log.String(), err
		}
		if !state.InMerge && !state.InRebase {
			if round == 0 {
				return "", fmt.Errorf("no merge or rebase in progress")
			}
			break
		}
		paths := state.ConflictFiles
		if len(paths) == 0 {
			if round == 0 {
				return "", fmt.Errorf("no conflicted files to resolve")
			}
			break
		}

		for _, rel := range paths {
			rel = filepath.ToSlash(strings.TrimSpace(rel))
			if rel == "" {
				continue
			}
			if onStatus != nil {
				onStatus(fmt.Sprintf("Resolving %s…", rel))
			}
			full := filepath.Join(dir, filepath.FromSlash(rel))
			data, err := os.ReadFile(full)
			if err != nil {
				return log.String(), fmt.Errorf("read %s: %w", rel, err)
			}
			if len(data) > maxConflictFileBytes {
				return log.String(), fmt.Errorf("file too large for auto-resolve (%s); max %d bytes", rel, maxConflictFileBytes)
			}
			if len(data) > 0 && looksBinarySample(data) {
				return log.String(), fmt.Errorf("binary file cannot be auto-resolved: %s", rel)
			}
			if !utf8.ValidString(string(data)) {
				return log.String(), fmt.Errorf("invalid UTF-8 in %s", rel)
			}

			resolved, err := s.utilityGenerate(ctx, st, dir, chat.ConflictResolveSystemPrompt, chat.ConflictResolveUserPrompt(rel, string(data)))
			if err != nil {
				return log.String(), fmt.Errorf("%s: %w", rel, err)
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
				return log.String(), fmt.Errorf("write %s: %w", rel, err)
			}
			fmt.Fprintf(&log, "Resolved %s\n", rel)
			if _, err := runGit(ctx, dir, "add", "--", rel); err != nil {
				return log.String(), fmt.Errorf("git add %s: %w", rel, err)
			}
		}

		if onStatus != nil {
			onStatus("Continuing…")
		}

		if state.InRebase {
			_, contErr := runGitWithEnv(ctx, dir, []string{"GIT_EDITOR=true", "GIT_SEQUENCE_EDITOR=true"}, "rebase", "--continue")
			if contErr != nil {
				next, _ := s.GitConflictState(ctx, threadID)
				if next != nil && next.InRebase && len(next.ConflictFiles) > 0 {
					continue
				}
				return log.String(), contErr
			}
		} else {
			cont, contErr := runGitWithEnv(ctx, dir, []string{"GIT_EDITOR=true"}, "merge", "--continue")
			if contErr != nil {
				return log.String(), contErr
			}
			log.WriteString(cont)
		}

		post, _ := s.GitConflictState(ctx, threadID)
		if post == nil || (!post.InMerge && !post.InRebase) {
			break
		}
		if len(post.ConflictFiles) == 0 {
			break
		}
	}

	return log.String(), nil
}

// ResolveGitConflictsWithUtilityAgent uses the configured utility LLM to fix each
// conflicted file, stages them, then runs merge/rebase --continue. Loops through
// every commit in a multi-commit rebase that produces conflicts.
func (s *Service) ResolveGitConflictsWithUtilityAgent(ctx context.Context, threadID string, onStatus func(string)) (string, error) {
	return s.resolveGitConflictsCore(ctx, threadID, onStatus)
}
