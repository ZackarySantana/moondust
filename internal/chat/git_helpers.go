package chat

import (
	"context"
	"fmt"
	"moondust/internal/openrouter"
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

const commitMsgSystemPrompt = `You generate concise git commit messages. Given a diff, produce a conventional commit message with:
- Line 1: type(scope): short description (max 72 chars)
- Line 2: blank
- Lines 3+: bullet-point summary of changes (2-5 lines)

Use types: feat, fix, refactor, docs, style, test, chore, perf, ci, build.
Be specific about what changed and why. Output ONLY the commit message, no markdown fences or explanation.`

// GenerateCommitMessage calls OpenRouter to produce a commit message from a diff.
func GenerateCommitMessage(ctx context.Context, apiKey, diff string) (string, error) {
	messages := []openrouter.APIMessage{
		{Role: "system", Content: ptrStr(commitMsgSystemPrompt)},
		{Role: "user", Content: ptrStr("Generate a commit message for this diff:\n\n" + diff)},
	}
	var buf strings.Builder
	_, _, _, err := openrouter.StreamCompletionRound(ctx, apiKey, "openai/gpt-4o-mini", messages, nil, func(delta string) error {
		buf.WriteString(delta)
		return nil
	}, nil)
	if err != nil {
		return "", fmt.Errorf("generate commit message: %w", err)
	}
	return strings.TrimSpace(buf.String()), nil
}

const reviewSystemPrompt = `You are a senior code reviewer. Review the following diff and provide structured feedback.

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

// ReviewDiff calls OpenRouter to produce a structured code review.
func ReviewDiff(ctx context.Context, apiKey, diff string) (string, error) {
	messages := []openrouter.APIMessage{
		{Role: "system", Content: ptrStr(reviewSystemPrompt)},
		{Role: "user", Content: ptrStr("Review this diff:\n\n" + diff)},
	}
	var buf strings.Builder
	_, _, _, err := openrouter.StreamCompletionRound(ctx, apiKey, "openai/gpt-4o-mini", messages, nil, func(delta string) error {
		buf.WriteString(delta)
		return nil
	}, nil)
	if err != nil {
		return "", fmt.Errorf("review diff: %w", err)
	}
	return strings.TrimSpace(buf.String()), nil
}

func ptrStr(s string) *string { return &s }
