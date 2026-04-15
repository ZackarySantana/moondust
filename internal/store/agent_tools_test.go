package store_test

import (
	"testing"

	"moondust/internal/store"

	"github.com/stretchr/testify/assert"
)

func TestNormalizeAgentToolsEnabled(t *testing.T) {
	nilMap := store.NormalizeAgentToolsEnabled(nil)
	assert.True(t, nilMap[store.AgentToolReadWorkspaceFile])
	assert.True(t, nilMap[store.AgentToolWebSearch])

	partial := map[string]bool{store.AgentToolWebSearch: false}
	out := store.NormalizeAgentToolsEnabled(partial)
	assert.False(t, out[store.AgentToolWebSearch])
	assert.True(t, out[store.AgentToolReadWorkspaceFile])
}
