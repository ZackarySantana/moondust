package client

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type Usage struct {
	PlanUsage struct {
		AutoPercentUsed  *float64 `json:"autoPercentUsed"`
		APIPercentUsed   *float64 `json:"apiPercentUsed"`
		TotalPercentUsed *float64 `json:"totalPercentUsed"`
	} `json:"planUsage"`
	DisplayMessage                   string `json:"displayMessage"`
	AutoModelSelectedDisplayMessage  string `json:"autoModelSelectedDisplayMessage"`
	NamedModelSelectedDisplayMessage string `json:"namedModelSelectedDisplayMessage"`
}

func (c *Client) GetUsage(ctx context.Context) (*Usage, error) {
	body := bytes.NewReader([]byte("{}"))
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.opts.usageEndpoint, body)
	if err != nil {
		return nil, fmt.Errorf("creating usage request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.opts.accessToken)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Connect-Protocol-Version", "1")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("getting usage: %w", err)
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("reading usage response: %w", err)
	}
	if resp.StatusCode == http.StatusUnauthorized {
		return nil, fmt.Errorf("cursor access token is invalid or expired")
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("usage request failed: %s", string(raw))
	}
	var usage Usage
	if err := json.Unmarshal(raw, &usage); err != nil {
		return nil, fmt.Errorf("unmarshalling usage response: %w", err)
	}
	return &usage, nil
}
