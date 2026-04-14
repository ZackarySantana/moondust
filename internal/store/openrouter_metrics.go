package store

import (
	"sort"
	"strings"
	"time"
)

// OpenRouterModelUsage is per-model aggregates from stored assistant messages.
type OpenRouterModelUsage struct {
	ModelID      string    `json:"model_id"`
	LastUsedAt   time.Time `json:"last_used_at"`
	UseCount     int       `json:"use_count"`
	TotalCostUSD float64   `json:"total_cost_usd"`
	// AverageCostUSD is total billed cost divided by assistant turn count for this model (same as $10 / 10 turns = $1).
	AverageCostUSD        float64 `json:"average_cost_usd"`
	TotalPromptTokens     int64   `json:"total_prompt_tokens"`
	TotalCompletionTokens int64   `json:"total_completion_tokens"`
}

// OpenRouterUsageMetrics summarizes OpenRouter chat usage across all threads.
type OpenRouterUsageMetrics struct {
	TotalAssistantMessages int     `json:"total_assistant_messages"`
	DistinctModels         int     `json:"distinct_models"`
	TotalCostUSD           float64 `json:"total_cost_usd"`
	// AverageCostPerAssistantTurnUSD is total_cost_usd / total_assistant_messages (all models).
	AverageCostPerAssistantTurnUSD float64                `json:"average_cost_per_assistant_turn_usd"`
	TotalPromptTokens              int64                  `json:"total_prompt_tokens"`
	TotalCompletionTokens          int64                  `json:"total_completion_tokens"`
	RecentlyUsed                   []OpenRouterModelUsage `json:"recently_used"`
	MostUsed                       []OpenRouterModelUsage `json:"most_used"`
	// MostExpensive is sorted by AverageCostUSD descending (typical cost per turn for that model).
	MostExpensive []OpenRouterModelUsage `json:"most_expensive"`
}

type openRouterAgg struct {
	lastUsed         time.Time
	count            int
	cost             float64
	promptTokens     int64
	completionTokens int64
}

// AggregateOpenRouterUsageMetrics builds metrics from assistant messages (any threads).
// Only assistant messages with chat_provider openrouter and non-empty chat_model are counted.
func AggregateOpenRouterUsageMetrics(messages []*ChatMessage) *OpenRouterUsageMetrics {
	byModel := make(map[string]*openRouterAgg)
	var totalMsgs int
	var totalCost float64
	var totalPrompt, totalCompletion int64

	for _, msg := range messages {
		if msg == nil || msg.Role != "assistant" {
			continue
		}
		if strings.TrimSpace(msg.ChatProvider) != "openrouter" {
			continue
		}
		model := strings.TrimSpace(msg.ChatModel)
		if model == "" {
			continue
		}

		totalMsgs++
		a := byModel[model]
		if a == nil {
			a = &openRouterAgg{lastUsed: msg.CreatedAt}
			byModel[model] = a
		}
		if msg.CreatedAt.After(a.lastUsed) {
			a.lastUsed = msg.CreatedAt
		}
		a.count++

		if msg.Metadata != nil && msg.Metadata.OpenRouter != nil {
			or := msg.Metadata.OpenRouter
			if or.CostUSD != nil {
				c := *or.CostUSD
				a.cost += c
				totalCost += c
			}
			if or.PromptTokens != nil {
				v := int64(*or.PromptTokens)
				a.promptTokens += v
				totalPrompt += v
			}
			if or.CompletionTokens != nil {
				v := int64(*or.CompletionTokens)
				a.completionTokens += v
				totalCompletion += v
			}
		}
	}

	rows := make([]OpenRouterModelUsage, 0, len(byModel))
	for id, a := range byModel {
		avg := 0.0
		if a.count > 0 {
			avg = a.cost / float64(a.count)
		}
		rows = append(rows, OpenRouterModelUsage{
			ModelID:               id,
			LastUsedAt:            a.lastUsed,
			UseCount:              a.count,
			TotalCostUSD:          a.cost,
			AverageCostUSD:        avg,
			TotalPromptTokens:     a.promptTokens,
			TotalCompletionTokens: a.completionTokens,
		})
	}

	recent := cloneModelUsage(rows)
	sort.Slice(recent, func(i, j int) bool {
		if recent[i].LastUsedAt.Equal(recent[j].LastUsedAt) {
			return recent[i].ModelID < recent[j].ModelID
		}
		return recent[i].LastUsedAt.After(recent[j].LastUsedAt)
	})

	mostUsed := cloneModelUsage(rows)
	sort.Slice(mostUsed, func(i, j int) bool {
		if mostUsed[i].UseCount != mostUsed[j].UseCount {
			return mostUsed[i].UseCount > mostUsed[j].UseCount
		}
		if !mostUsed[i].LastUsedAt.Equal(mostUsed[j].LastUsedAt) {
			return mostUsed[i].LastUsedAt.After(mostUsed[j].LastUsedAt)
		}
		return mostUsed[i].ModelID < mostUsed[j].ModelID
	})

	mostExp := cloneModelUsage(rows)
	sort.Slice(mostExp, func(i, j int) bool {
		if mostExp[i].AverageCostUSD != mostExp[j].AverageCostUSD {
			return mostExp[i].AverageCostUSD > mostExp[j].AverageCostUSD
		}
		if mostExp[i].TotalCostUSD != mostExp[j].TotalCostUSD {
			return mostExp[i].TotalCostUSD > mostExp[j].TotalCostUSD
		}
		return mostExp[i].ModelID < mostExp[j].ModelID
	})

	avgAll := 0.0
	if totalMsgs > 0 {
		avgAll = totalCost / float64(totalMsgs)
	}

	return &OpenRouterUsageMetrics{
		TotalAssistantMessages:         totalMsgs,
		DistinctModels:                 len(byModel),
		TotalCostUSD:                   totalCost,
		AverageCostPerAssistantTurnUSD: avgAll,
		TotalPromptTokens:              totalPrompt,
		TotalCompletionTokens:          totalCompletion,
		RecentlyUsed:                   recent,
		MostUsed:                       mostUsed,
		MostExpensive:                  mostExp,
	}
}

func cloneModelUsage(src []OpenRouterModelUsage) []OpenRouterModelUsage {
	out := make([]OpenRouterModelUsage, len(src))
	copy(out, src)
	return out
}
