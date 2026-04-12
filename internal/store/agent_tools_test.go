package store

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNormalizeAgentToolsEnabled(t *testing.T) {
	nilMap := NormalizeAgentToolsEnabled(nil)
	assert.True(t, nilMap[AgentToolReadWorkspaceFile])
	assert.True(t, nilMap[AgentToolWebSearch])

	partial := map[string]bool{AgentToolWebSearch: false}
	out := NormalizeAgentToolsEnabled(partial)
	assert.False(t, out[AgentToolWebSearch])
	assert.True(t, out[AgentToolReadWorkspaceFile])
}
