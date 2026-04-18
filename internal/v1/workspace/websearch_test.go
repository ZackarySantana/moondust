package workspace

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFormatDuckDuckGoInstantAnswer(t *testing.T) {
	p := &ddgInstantAnswer{
		Answer:       "The capital of France is Paris.",
		Heading:      "France",
		AbstractText: "Country in Europe.",
		AbstractURL:  "https://example.com/france",
		RelatedTopics: []ddgTopic{
			{Text: "Paris", FirstURL: "https://example.com/paris"},
		},
	}
	s := formatDuckDuckGoInstantAnswer(p)
	assert.Contains(t, s, "capital of France")
	assert.Contains(t, s, "Country in Europe")
	assert.Contains(t, s, "Related:")
	assert.Contains(t, s, "Paris")
}

func TestFormatDuckDuckGoInstantAnswer_NestedTopics(t *testing.T) {
	p := &ddgInstantAnswer{
		RelatedTopics: []ddgTopic{
			{
				Topics: []ddgTopic{
					{Text: "Nested item", FirstURL: "https://n.example"},
				},
			},
		},
	}
	s := formatDuckDuckGoInstantAnswer(p)
	assert.Contains(t, s, "Nested item")
}
