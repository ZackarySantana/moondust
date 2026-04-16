package agentstream

// StreamUsage is token usage from a successful `result` line in stream-json output.
type StreamUsage struct {
	InputTokens      int `json:"inputTokens"`
	OutputTokens     int `json:"outputTokens"`
	CacheReadTokens  int `json:"cacheReadTokens"`
	CacheWriteTokens int `json:"cacheWriteTokens"`
	RequestID        string
}
