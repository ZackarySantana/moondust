package claudecli

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"time"

	"moondust/internal/v1/store"
)

const (
	localUsageMaxFileBytes = 48 << 20 // per-file read cap
	localUsageScanTimeout  = 4 * time.Second
)

// ClaudeProjectsRoots returns directories that hold session *.jsonl transcripts.
func ClaudeProjectsRoots(home string) []string {
	if home == "" {
		return nil
	}
	seen := make(map[string]struct{})
	var out []string
	add := func(p string) {
		if p == "" {
			return
		}
		if st, err := os.Stat(p); err != nil || !st.IsDir() {
			return
		}
		if _, ok := seen[p]; ok {
			return
		}
		seen[p] = struct{}{}
		out = append(out, p)
	}
	add(filepath.Join(home, ".claude", "projects"))
	add(filepath.Join(home, ".config", "claude", "projects"))
	if cfg := strings.TrimSpace(os.Getenv("CLAUDE_CONFIG_DIR")); cfg != "" {
		add(filepath.Join(cfg, "projects"))
	}
	return out
}

// jsonlLineUsage matches assistant transcript lines that include message.usage (snake_case).
type jsonlLineUsage struct {
	Type    string `json:"type"`
	Message *struct {
		Usage *struct {
			InputTokens              int `json:"input_tokens"`
			OutputTokens             int `json:"output_tokens"`
			CacheReadInputTokens     int `json:"cache_read_input_tokens"`
			CacheCreationInputTokens int `json:"cache_creation_input_tokens"`
		} `json:"usage"`
	} `json:"message"`
}

// ScanLocalUsage walks Claude Code local JSONL transcripts and sums token fields.
// Only files modified on or after cutoff are read (approximates recent sessions).
// WindowDays is the number of days represented by cutoff vs now (for UI labels).
func ScanLocalUsage(ctx context.Context, home string, windowDays int, cutoff time.Time) (*store.ClaudeLocalUsage, error) {
	cctx, cancel := context.WithTimeout(ctx, localUsageScanTimeout)
	defer cancel()

	roots := ClaudeProjectsRoots(home)
	out := &store.ClaudeLocalUsage{
		WindowDays: windowDays,
	}
	if len(roots) == 0 {
		return out, nil
	}

	for _, root := range roots {
		err := filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
			if err != nil {
				return nil
			}
			if cctx.Err() != nil {
				return fs.SkipAll
			}
			if d.IsDir() {
				return nil
			}
			if !strings.HasSuffix(strings.ToLower(path), ".jsonl") {
				return nil
			}
			fi, err := d.Info()
			if err != nil {
				return nil
			}
			if fi.ModTime().Before(cutoff) {
				return nil
			}
			if fi.Size() > localUsageMaxFileBytes {
				return nil
			}
			n, matched, rerr := scanJSONLFile(cctx, path)
			out.FilesScanned++
			out.LinesMatched += matched
			out.InputTokens += n.input
			out.OutputTokens += n.output
			out.CacheReadTokens += n.cacheRead
			out.CacheWriteTokens += n.cacheWrite
			if rerr != nil && out.ScanError == "" {
				out.ScanError = rerr.Error()
			}
			return nil
		})
		if err != nil {
			if out.ScanError == "" {
				out.ScanError = err.Error()
			}
		}
	}

	out.TotalTokens = out.InputTokens + out.OutputTokens + out.CacheReadTokens + out.CacheWriteTokens
	fillLocalUsagePercents(out)
	return out, nil
}

type usageAcc struct {
	input, output, cacheRead, cacheWrite int64
}

func scanJSONLFile(ctx context.Context, path string) (usageAcc, int64, error) {
	f, err := os.Open(path)
	if err != nil {
		return usageAcc{}, 0, err
	}
	defer f.Close()

	var acc usageAcc
	var matched int64
	sc := bufio.NewScanner(f)
	const maxLine = 12 << 20
	buf := make([]byte, 0, 64*1024)
	sc.Buffer(buf, maxLine)

	for sc.Scan() {
		if ctx.Err() != nil {
			return acc, matched, ctx.Err()
		}
		line := strings.TrimSpace(sc.Text())
		if line == "" {
			continue
		}
		var row jsonlLineUsage
		if err := json.Unmarshal([]byte(line), &row); err != nil {
			continue
		}
		if !strings.EqualFold(row.Type, "assistant") {
			continue
		}
		if row.Message == nil || row.Message.Usage == nil {
			continue
		}
		u := row.Message.Usage
		acc.input += int64(u.InputTokens)
		acc.output += int64(u.OutputTokens)
		acc.cacheRead += int64(u.CacheReadInputTokens)
		acc.cacheWrite += int64(u.CacheCreationInputTokens)
		matched++
	}
	if err := sc.Err(); err != nil && !errors.Is(err, io.EOF) {
		return acc, matched, err
	}
	return acc, matched, nil
}

func fillLocalUsagePercents(u *store.ClaudeLocalUsage) {
	t := u.TotalTokens
	if t <= 0 {
		return
	}
	pct := func(part int64) float64 {
		return 100.0 * float64(part) / float64(t)
	}
	in := pct(u.InputTokens)
	out := pct(u.OutputTokens)
	ca := pct(u.CacheReadTokens + u.CacheWriteTokens)
	u.InputPercentUsed = &in
	u.OutputPercentUsed = &out
	u.CachePercentUsed = &ca
}
