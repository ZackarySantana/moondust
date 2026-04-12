package openrouter

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFilterChatModels(t *testing.T) {
	var embed, good, noTools apiModel
	embed.ID = "a/embed"
	embed.Name = "Embed"
	embed.SupportedParameters = []string{"tools"}
	embed.Architecture.InputModalities = []string{"text"}
	embed.Architecture.OutputModalities = []string{"embedding"}

	good.ID = "vendor/good"
	good.Name = "Good"
	good.Created = 100
	good.SupportedParameters = []string{"tools", "temperature"}
	good.Architecture.InputModalities = []string{"text"}
	good.Architecture.OutputModalities = []string{"text"}

	noTools.ID = "vendor/no-tools"
	noTools.SupportedParameters = []string{"temperature"}
	noTools.Architecture.InputModalities = []string{"text"}
	noTools.Architecture.OutputModalities = []string{"text"}

	got := filterChatModels([]apiModel{embed, good, noTools})
	assert.Len(t, got, 1)
	assert.Equal(t, "vendor/good", got[0].ID)
}
