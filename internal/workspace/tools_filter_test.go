package workspace_test

import (
	"encoding/json"
	"testing"

	"moondust/internal/workspace"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestFilterToolDefinitions(t *testing.T) {
	raw := workspace.ToolSchemas()
	require.NotEmpty(t, raw)
	first := raw[0].Function.Name

	t.Run("nil enabled passes all", func(t *testing.T) {
		out := workspace.FilterToolDefinitions(raw, nil)
		assert.Len(t, out, len(raw))
	})

	t.Run("disable one", func(t *testing.T) {
		enabled := map[string]bool{first: false}
		out := workspace.FilterToolDefinitions(raw, enabled)
		for _, d := range out {
			assert.NotEqual(t, first, d.Function.Name)
		}
	})

}

func TestToolSchemasJSONRoundTrip(t *testing.T) {
	def := workspace.ToolSchemas()[0]
	b, err := json.Marshal(def.Function.Parameters)
	require.NoError(t, err)
	assert.NotEmpty(t, b)
}
