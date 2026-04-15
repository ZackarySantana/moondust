package claudecli

import (
	"context"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestScanJSONLFileSampleAssistantLine(t *testing.T) {
	t.Parallel()
	const line = `{"type":"assistant","message":{"usage":{"input_tokens":3,"output_tokens":71,"cache_read_input_tokens":11961,"cache_creation_input_tokens":5936}}}`
	dir := t.TempDir()
	p := filepath.Join(dir, "s.jsonl")
	require.NoError(t, os.WriteFile(p, []byte(line+"\n"), 0o600))

	acc, matched, err := scanJSONLFile(context.Background(), p)
	require.NoError(t, err)
	assert.Equal(t, int64(1), matched)
	assert.Equal(t, int64(3), acc.input)
	assert.Equal(t, int64(71), acc.output)
	assert.Equal(t, int64(11961), acc.cacheRead)
	assert.Equal(t, int64(5936), acc.cacheWrite)
}

func TestScanLocalUsageSkipsOldFiles(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	sub := filepath.Join(dir, ".claude", "projects", "proj", "sess.jsonl")
	require.NoError(t, os.MkdirAll(filepath.Dir(sub), 0o755))
	require.NoError(t, os.WriteFile(sub, []byte(`{"type":"assistant","message":{"usage":{"input_tokens":3,"output_tokens":71,"cache_read_input_tokens":11961,"cache_creation_input_tokens":5936}}}`+"\n"), 0o600))
	old := time.Now().AddDate(0, 0, -30)
	require.NoError(t, os.Chtimes(sub, old, old))

	out, err := ScanLocalUsage(context.Background(), dir, 7, time.Now().AddDate(0, 0, -7))
	require.NoError(t, err)
	require.NotNil(t, out)
	assert.Equal(t, int64(0), out.TotalTokens)
}

func TestScanLocalUsageRecentFile(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	sub := filepath.Join(dir, ".claude", "projects", "p", "sess.jsonl")
	require.NoError(t, os.MkdirAll(filepath.Dir(sub), 0o755))
	require.NoError(t, os.WriteFile(sub, []byte(`{"type":"assistant","message":{"usage":{"input_tokens":3,"output_tokens":71,"cache_read_input_tokens":11961,"cache_creation_input_tokens":5936}}}`+"\n"), 0o600))

	out, err := ScanLocalUsage(context.Background(), dir, 7, time.Now().AddDate(0, 0, -7))
	require.NoError(t, err)
	require.NotNil(t, out)
	assert.Equal(t, 1, out.FilesScanned)
	assert.Greater(t, out.TotalTokens, int64(0))
	assert.NotNil(t, out.InputPercentUsed)
}
