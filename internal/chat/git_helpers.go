package chat

import (
	"context"
	"fmt"
	"os/exec"
	"strings"
)

const maxDiffBytes = 60_000

// StagedDiff runs `git diff --cached` in dir and returns the patch text.
func StagedDiff(dir string) (string, error) {
	cmd := exec.Command("git", "diff", "--cached", "--no-color")
	cmd.Dir = dir
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
func BranchDiff(dir string) (string, error) {
	base, err := defaultBranch(dir)
	if err != nil {
		return "", err
	}
	mb, err := mergeBase(dir, base)
	if err != nil {
		return "", fmt.Errorf("merge-base: %w", err)
	}
	cmd := exec.Command("git", "diff", "--no-color", mb+"...HEAD")
	cmd.Dir = dir
	out, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("git diff merge-base: %w", err)
	}
	s := string(out)
	if len(s) > maxDiffBytes {
		s = s[:maxDiffBytes] + "\n… (diff truncated)"
	}
	return s, nil
}

func defaultBranch(dir string) (string, error) {
	for _, ref := range []string{"refs/remotes/origin/main", "refs/remotes/origin/master"} {
		cmd := exec.Command("git", "rev-parse", "--verify", ref)
		cmd.Dir = dir
		if err := cmd.Run(); err == nil {
			return strings.TrimPrefix(ref, "refs/remotes/origin/"), nil
		}
	}
	return "main", nil
}

func mergeBase(dir, branch string) (string, error) {
	cmd := exec.Command("git", "merge-base", "origin/"+branch, "HEAD")
	cmd.Dir = dir
	out, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(out)), nil
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

// UtilityGenerate is a function that takes a system prompt and user message and returns the generated text.
// It abstracts away the LLM provider.
type UtilityGenerate func(ctx context.Context, system, user string) (string, error)
