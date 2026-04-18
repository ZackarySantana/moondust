//go:build integration

package client_test

import (
	"moondust/src/v2/provider/cursor/client"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestGetUsage_Integration(t *testing.T) {
	t.Parallel()

	c, err := client.NewClient()
	require.NoError(t, err)
	require.NotNil(t, c)

	usage, err := c.GetUsage(t.Context())
	require.NoError(t, err)
	require.NotNil(t, usage)

	require.NotNil(t, usage.PlanUsage.AutoPercentUsed)
	require.NotNil(t, usage.PlanUsage.APIPercentUsed)
	require.NotNil(t, usage.PlanUsage.TotalPercentUsed)
}
