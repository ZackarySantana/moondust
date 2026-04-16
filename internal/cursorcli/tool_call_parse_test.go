package cursorcli

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestParseCompletedCursorToolCall_readToolCall(t *testing.T) {
	t.Parallel()
	line := `{"readToolCall":{"args":{"path":"README.md"},"result":{"success":{"content":"# Hi","totalLines":1}}}}`
	var raw json.RawMessage
	require.NoError(t, json.Unmarshal([]byte(line), &raw))
	rec, ok := ParseCompletedCursorToolCall("call-1", raw)
	require.True(t, ok)
	assert.Equal(t, "call-1", rec.ID)
	assert.Equal(t, "read", rec.Name)
	assert.Contains(t, rec.Arguments, "README.md")
	assert.Contains(t, rec.Output, "success")
}

func TestParseCompletedCursorToolCall_function(t *testing.T) {
	t.Parallel()
	line := `{"function":{"name":"my_tool","arguments":"{}","result":{"ok":true}}}`
	var raw json.RawMessage
	require.NoError(t, json.Unmarshal([]byte(line), &raw))
	rec, ok := ParseCompletedCursorToolCall("fn-1", raw)
	require.True(t, ok)
	assert.Equal(t, "my_tool", rec.Name)
}
