package client_test

import (
	"encoding/json"
	"moondust/src/v2/agent/cursor/client"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetUsage(t *testing.T) {
	t.Parallel()

	t.Run("Unauthorized", func(t *testing.T) {
		t.Parallel()

		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusUnauthorized)
		}))
		t.Cleanup(server.Close)
		client, err := client.NewClient(client.WithAccessToken("test"), client.WithUsageEndpoint(server.URL))
		require.NoError(t, err)
		require.NotNil(t, client)
		usage, err := client.GetUsage(t.Context())
		require.ErrorContains(t, err, "cursor access token is invalid or expired")
		require.Nil(t, usage)
	})

	t.Run("OK", func(t *testing.T) {
		t.Parallel()

		autoPercentUsed := 40.0
		apiPercentUsed := 60.0
		totalPercentUsed := 50.0
		resp := client.Usage{
			PlanUsage: struct {
				AutoPercentUsed  *float64 `json:"autoPercentUsed"`
				APIPercentUsed   *float64 `json:"apiPercentUsed"`
				TotalPercentUsed *float64 `json:"totalPercentUsed"`
			}{
				AutoPercentUsed:  &autoPercentUsed,
				APIPercentUsed:   &apiPercentUsed,
				TotalPercentUsed: &totalPercentUsed,
			},
		}
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(resp)
		}))
		t.Cleanup(server.Close)
		client, err := client.NewClient(client.WithAccessToken("test"), client.WithUsageEndpoint(server.URL))
		require.NoError(t, err)
		require.NotNil(t, client)
		usage, err := client.GetUsage(t.Context())
		require.NoError(t, err)
		require.NotNil(t, usage)

		require.NotNil(t, usage.PlanUsage.AutoPercentUsed)
		assert.Equal(t, autoPercentUsed, *usage.PlanUsage.AutoPercentUsed)
		require.NotNil(t, usage.PlanUsage.APIPercentUsed)
		assert.Equal(t, apiPercentUsed, *usage.PlanUsage.APIPercentUsed)
		require.NotNil(t, usage.PlanUsage.TotalPercentUsed)
		assert.Equal(t, totalPercentUsed, *usage.PlanUsage.TotalPercentUsed)
	})
}
