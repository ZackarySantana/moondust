package service

import (
	"regexp"
	"strconv"
	"strings"

	"moondust/internal/v1/store"
)

var aheadBehindRe = regexp.MustCompile(`ahead (\d+)|behind (\d+)`)

func parseGitStatus(review *store.GitReview, raw string) {
	lines := strings.Split(strings.TrimSpace(raw), "\n")
	for _, line := range lines {
		if line == "" {
			continue
		}
		if strings.HasPrefix(line, "## ") {
			branchLine := strings.TrimPrefix(line, "## ")
			review.Branch = branchLine
			for _, m := range aheadBehindRe.FindAllStringSubmatch(branchLine, -1) {
				if m[1] != "" {
					if v, err := strconv.Atoi(m[1]); err == nil {
						review.Ahead = v
					}
				}
				if m[2] != "" {
					if v, err := strconv.Atoi(m[2]); err == nil {
						review.Behind = v
					}
				}
			}
			continue
		}
		if strings.HasPrefix(line, "?? ") {
			path := strings.TrimSpace(strings.TrimPrefix(line, "?? "))
			review.Untracked = append(review.Untracked, store.GitFileChange{
				Path:   path,
				Status: "untracked",
			})
			continue
		}
		if len(line) < 4 {
			continue
		}
		x := line[0]
		y := line[1]
		path := strings.TrimSpace(line[3:])
		if x != ' ' {
			review.Staged = append(review.Staged, store.GitFileChange{
				Path:   path,
				Status: string(x),
			})
		}
		if y != ' ' {
			review.Unstaged = append(review.Unstaged, store.GitFileChange{
				Path:   path,
				Status: string(y),
			})
		}
	}
}

func parseCommitsWithDate(raw string) []store.GitCommitSummary {
	var commits []store.GitCommitSummary
	for _, line := range strings.Split(strings.TrimSpace(raw), "\n") {
		if line == "" {
			continue
		}
		parts := strings.Split(line, "\t")
		if len(parts) < 4 {
			continue
		}
		c := store.GitCommitSummary{
			Hash:    parts[0],
			Subject: parts[1],
			Author:  parts[2],
			When:    parts[3],
		}
		if len(parts) >= 5 {
			c.ExactDate = parts[4]
		}
		commits = append(commits, c)
	}
	return commits
}
