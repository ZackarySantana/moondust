package cursorcli

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"moondust/internal/store"
	"net/http"
	"strings"
	"time"
)

const usageFetchTimeout = 15 * time.Second

// Undocumented Connect-RPC endpoint; aligns with Auto vs API buckets in the Cursor app.
const cursorUsageEndpoint = "https://api2.cursor.sh/aiserver.v1.DashboardService/GetCurrentPeriodUsage"

// DashboardUsageJSON matches the JSON shape from GetCurrentPeriodUsage (for tests and decoding).
type DashboardUsageJSON struct {
	PlanUsage struct {
		AutoPercentUsed  *float64 `json:"autoPercentUsed"`
		APIPercentUsed   *float64 `json:"apiPercentUsed"`
		TotalPercentUsed *float64 `json:"totalPercentUsed"`
	} `json:"planUsage"`
	DisplayMessage                   string `json:"displayMessage"`
	AutoModelSelectedDisplayMessage  string `json:"autoModelSelectedDisplayMessage"`
	NamedModelSelectedDisplayMessage string `json:"namedModelSelectedDisplayMessage"`
}

// FetchCurrentPeriodUsage returns the same dashboard snapshot as the sidebar (requires Cursor login).
func FetchCurrentPeriodUsage(ctx context.Context) (*store.CursorUsageSnapshot, error) {
	tok, err := readCursorAccessToken()
	if err != nil {
		return nil, err
	}
	return fetchCurrentPeriodUsage(ctx, tok)
}

func fetchCurrentPeriodUsage(ctx context.Context, accessToken string) (*store.CursorUsageSnapshot, error) {
	cctx, cancel := context.WithTimeout(ctx, usageFetchTimeout)
	defer cancel()

	body := bytes.NewReader([]byte("{}"))
	req, err := http.NewRequestWithContext(cctx, http.MethodPost, cursorUsageEndpoint, body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Connect-Protocol-Version", "1")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	raw, err := io.ReadAll(io.LimitReader(resp.Body, 2<<20))
	if err != nil {
		return nil, err
	}
	if resp.StatusCode == http.StatusUnauthorized {
		return nil, fmt.Errorf("Cursor session expired or invalid. Run `agent login` or sign in again in the Cursor app")
	}
	if resp.StatusCode != http.StatusOK {
		msg := strings.TrimSpace(string(raw))
		if len(msg) > 200 {
			msg = msg[:200] + "…"
		}
		if msg == "" {
			msg = resp.Status
		}
		return nil, fmt.Errorf("usage HTTP %d: %s", resp.StatusCode, msg)
	}

	var d DashboardUsageJSON
	if err := json.Unmarshal(raw, &d); err != nil {
		return nil, err
	}
	out := &store.CursorUsageSnapshot{
		AutoPercentUsed:  d.PlanUsage.AutoPercentUsed,
		APIPercentUsed:   d.PlanUsage.APIPercentUsed,
		TotalPercentUsed: d.PlanUsage.TotalPercentUsed,
		DisplayMessage:   d.DisplayMessage,
		AutoUsageMessage: d.AutoModelSelectedDisplayMessage,
		APIUsageMessage:  d.NamedModelSelectedDisplayMessage,
	}
	return out, nil
}
