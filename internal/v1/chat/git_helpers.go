package chat

import (
	"context"
	"fmt"
	"os/exec"
	"strings"

	"moondust/internal/v1/oschild"
)

const maxDiffBytes = 60_000

// StagedDiff runs `git diff --cached` in dir and returns the patch text.
func StagedDiff(dir string) (string, error) {
	cmd := exec.Command("git", "diff", "--cached", "--no-color")
	cmd.Dir = dir
	oschild.HideConsole(cmd)
	out, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("git diff --cached: %w", err)
	}
	s := string(out)
	if len(s) > maxDiffBytes {
		s = s[:maxDiffBytes] + "\n… (diff truncated)"
	}
	return s, nil
}

// BranchDiff returns the diff of the current branch vs its merge-base with the default branch.
// defaultBranch should be the full remote ref (e.g. "origin/main").
func BranchDiff(dir, defaultBranch string) (string, error) {
	cmd := exec.Command("git", "merge-base", defaultBranch, "HEAD")
	cmd.Dir = dir
	oschild.HideConsole(cmd)
	mbOut, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("merge-base %s HEAD: %w", defaultBranch, err)
	}
	mb := strings.TrimSpace(string(mbOut))

	diffCmd := exec.Command("git", "diff", "--no-color", mb+"...HEAD")
	diffCmd.Dir = dir
	oschild.HideConsole(diffCmd)
	out, err := diffCmd.Output()
	if err != nil {
		return "", fmt.Errorf("git diff merge-base: %w", err)
	}
	s := string(out)
	if len(s) > maxDiffBytes {
		s = s[:maxDiffBytes] + "\n… (diff truncated)"
	}
	return s, nil
}

// CommitMsgSystemPrompt is the system prompt for commit message generation.
const CommitMsgSystemPrompt = `You generate concise git commit messages. Given a diff, produce a conventional commit message with:
- Line 1: type(scope): short description (max 72 chars)
- Line 2: blank
- Lines 3+: bullet-point summary of changes (2-5 lines)

Use types: feat, fix, refactor, docs, style, test, chore, perf, ci, build.
Be specific about what changed and why. Output ONLY the commit message, no markdown fences or explanation.`

// CommitMsgUserPrompt builds the user message for commit message generation.
func CommitMsgUserPrompt(diff string) string {
	return "Generate a commit message for this diff:\n\n" + diff
}

// ReviewSystemPrompt is the system prompt for code review.
const ReviewSystemPrompt = `You are a senior code reviewer. Review the following diff and provide structured feedback.

Format your review as:
## Summary
One paragraph overview of the changes.

## Issues
For each issue found, use this format:
- **[severity]** file:line — description and suggestion

Severities: critical, warning, suggestion, nit

## Verdict
One line: APPROVE, REQUEST_CHANGES, or COMMENT with brief justification.

Be constructive, specific, and concise. Focus on bugs, security, performance, and maintainability. Skip trivial style nits unless they affect readability significantly.`

// ReviewUserPrompt builds the user message for code review.
func ReviewUserPrompt(diff string) string {
	return "Review this diff:\n\n" + diff
}

// ConflictResolveSystemPrompt is the system prompt for LLM merge-conflict resolution.
const ConflictResolveSystemPrompt = `You resolve git merge conflicts in a single source file. Output ONLY the complete merged file contents.

Rules:
- No markdown fences, no code blocks, no backticks, no commentary before or after the file.
- Remove every conflict marker: <<<<<<<, =======, >>>>>>> (and any branch labels on those lines).
- Combine both sides sensibly: merge imports, delete duplicates, keep non-overlapping edits from both sides.
- Preserve the project's style (indentation, quotes) from the surrounding code.
- If one side is clearly wrong or obsolete, prefer the correct side; otherwise integrate both.`

// ConflictResolveUserPrompt builds the user message for conflict resolution.
func ConflictResolveUserPrompt(relPath, fileContent string) string {
	return fmt.Sprintf("File path: %s\n\nResolve this merge conflict. Output the full file only:\n\n%s", relPath, fileContent)
}

// UtilityGenerate is a function that takes a system prompt and user message and returns the generated text.
// It abstracts away the LLM provider.
type UtilityGenerate func(ctx context.Context, system, user string) (string, error)
