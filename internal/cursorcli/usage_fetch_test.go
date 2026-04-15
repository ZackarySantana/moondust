package cursorcli_test

import (
	"encoding/json"
	"testing"

	"moondust/internal/cursorcli"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestDashboardUsageJSONUnmarshal(t *testing.T) {
	t.Parallel()

	const sample = `{
  "planUsage": {
    "autoPercentUsed": 21.5,
    "apiPercentUsed": 100,
    "totalPercentUsed": 38.6
  },
  "displayMessage": "Summary",
  "autoModelSelectedDisplayMessage": "Auto line",
  "namedModelSelectedDisplayMessage": "API line"
}`
	var d cursorcli.DashboardUsageJSON
	require.NoError(t, json.Unmarshal([]byte(sample), &d))
	assert.Equal(t, 21.5, *d.PlanUsage.AutoPercentUsed)
	assert.Equal(t, 100.0, *d.PlanUsage.APIPercentUsed)
	assert.Equal(t, 38.6, *d.PlanUsage.TotalPercentUsed)
	assert.Equal(t, "Summary", d.DisplayMessage)
	assert.Equal(t, "Auto line", d.AutoModelSelectedDisplayMessage)
	assert.Equal(t, "API line", d.NamedModelSelectedDisplayMessage)
}
