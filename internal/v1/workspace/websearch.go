package workspace

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const (
	maxWebSearchQueryRunes = 500
	webSearchHTTPTimeout   = 18 * time.Second
)

// runWebSearch queries DuckDuckGo’s instant-answer JSON API (no API key). Results vary by query;
// some queries return little or nothing—callers should treat empty output as “no instant answer”.
func runWebSearch(query string) (string, error) {
	query = strings.TrimSpace(query)
	if query == "" {
		return "", fmt.Errorf("query is required")
	}
	if len([]rune(query)) > maxWebSearchQueryRunes {
		return "", fmt.Errorf("query too long (max %d characters)", maxWebSearchQueryRunes)
	}

	u, err := url.Parse("https://api.duckduckgo.com/")
	if err != nil {
		return "", err
	}
	q := u.Query()
	q.Set("q", query)
	q.Set("format", "json")
	q.Set("no_html", "1")
	q.Set("skip_disambig", "1")
	u.RawQuery = q.Encode()

	ctx, cancel := context.WithTimeout(context.Background(), webSearchHTTPTimeout)
	defer cancel()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "Moondust/1.0 (web_search tool)")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("web search request: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 2048))
		return "", fmt.Errorf("web search: HTTP %s: %s", resp.Status, strings.TrimSpace(string(body)))
	}
	body, err := io.ReadAll(io.LimitReader(resp.Body, 2<<20))
	if err != nil {
		return "", fmt.Errorf("read response: %w", err)
	}

	var payload ddgInstantAnswer
	if err := json.Unmarshal(body, &payload); err != nil {
		return "", fmt.Errorf("decode search response: %w", err)
	}
	out := formatDuckDuckGoInstantAnswer(&payload)
	out = strings.TrimSpace(out)
	if out == "" {
		return "No instant answer from DuckDuckGo for this query. Try rephrasing or a more specific question.", nil
	}
	return truncateToolOutput(out), nil
}

type ddgInstantAnswer struct {
	Abstract       string       `json:"Abstract"`
	AbstractText   string       `json:"AbstractText"`
	AbstractURL    string       `json:"AbstractURL"`
	AbstractSource string       `json:"AbstractSource"`
	Heading        string       `json:"Heading"`
	Answer         string       `json:"Answer"`
	Definition     string       `json:"Definition"`
	DefinitionURL  string       `json:"DefinitionURL"`
	RelatedTopics  []ddgTopic   `json:"RelatedTopics"`
	Results        []ddgRelated `json:"Results"`
}

type ddgTopic struct {
	Text     string     `json:"Text"`
	FirstURL string     `json:"FirstURL"`
	Topics   []ddgTopic `json:"Topics"`
}

type ddgRelated struct {
	Text     string `json:"Text"`
	FirstURL string `json:"FirstURL"`
}

func formatDuckDuckGoInstantAnswer(p *ddgInstantAnswer) string {
	var b strings.Builder
	if p.Answer != "" {
		b.WriteString(p.Answer)
		b.WriteString("\n\n")
	}
	if p.Definition != "" {
		b.WriteString("Definition: ")
		b.WriteString(p.Definition)
		if p.DefinitionURL != "" {
			b.WriteString(" — ")
			b.WriteString(p.DefinitionURL)
		}
		b.WriteString("\n\n")
	}
	title := strings.TrimSpace(p.Heading)
	if title == "" {
		title = strings.TrimSpace(p.AbstractSource)
	}
	text := strings.TrimSpace(p.AbstractText)
	if text == "" {
		text = strings.TrimSpace(p.Abstract)
	}
	if text != "" {
		if title != "" {
			b.WriteString(title)
			b.WriteString("\n")
		}
		b.WriteString(text)
		if p.AbstractURL != "" {
			b.WriteString("\nSource: ")
			b.WriteString(p.AbstractURL)
		}
		b.WriteString("\n\n")
	}
	var relLines []string
	flattenRelatedTopics(p.RelatedTopics, &relLines, 12)
	for _, r := range p.Results {
		if len(relLines) >= 12 {
			break
		}
		line := strings.TrimSpace(r.Text)
		if line != "" {
			if r.FirstURL != "" {
				line = line + " — " + r.FirstURL
			}
			relLines = append(relLines, line)
		}
	}
	if len(relLines) > 0 {
		b.WriteString("Related:\n")
		for _, line := range relLines {
			b.WriteString("- ")
			b.WriteString(line)
			b.WriteString("\n")
		}
	}
	return strings.TrimSpace(b.String())
}

func flattenRelatedTopics(topics []ddgTopic, out *[]string, max int) {
	for _, t := range topics {
		if len(*out) >= max {
			return
		}
		if len(t.Topics) > 0 {
			flattenRelatedTopics(t.Topics, out, max)
			continue
		}
		line := strings.TrimSpace(t.Text)
		if line == "" {
			continue
		}
		if t.FirstURL != "" {
			line = line + " — " + t.FirstURL
		}
		*out = append(*out, line)
	}
}
