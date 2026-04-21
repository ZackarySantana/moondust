package cursor

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"

	"moondust/src/v2/agent/cursor/cursorchat"
	"moondust/src/v2/chat"
)

func (a *Agent) Ask(ctx context.Context, workDir, model string, history []chat.Event, prompt string) (<-chan chat.Event, error) {
	args := []string{
		"--print",
		"--output-format", "stream-json",
		"--stream-partial-output",
		"--trust", "--force",
		"--workspace", workDir,
		"--model", model,
	}
	for _, event := range history {
		cursorEvent, err := cursorchat.FromCanonical(event)
		if err != nil {
			return nil, fmt.Errorf("converting history event to cursor: %w", err)
		}
		data, err := json.Marshal(cursorEvent)
		if err != nil {
			return nil, fmt.Errorf("marshalling history event to cursor: %w", err)
		}
		args = append(args, string(data))
	}
	args = append(args, prompt)

	stdout, _, err := a.opts.executor.Run(
		ctx,
		args...,
	)
	if err != nil {
		return nil, fmt.Errorf("running cursor agent: %w", err)
	}

	sc := bufio.NewScanner(stdout)
	sc.Buffer(make([]byte, 0, 64*1024), 1024*1024)

	events := make(chan chat.Event)

	go func() {
		defer close(events)

		for sc.Scan() {
			line := sc.Bytes()
			if len(line) == 0 {
				continue
			}
			var rawEvent cursorchat.RawEvent
			if err := json.Unmarshal(line, &rawEvent); err != nil {
				// TODO-v2: log error? New event type?
				continue
			}
			event, err := rawEvent.Get()
			if err != nil {
				// TODO-v2: log error? New event type?
				continue
			}
			if event == nil {
				// Nil events are skipped on purpose.
				continue
			}
			transformed, err := event.ToCanonical()
			if err != nil {
				// TODO-v2: log error? New event type?
				return
			}
			if transformed == nil {
				// A nil transformed event means there's no generic event that fits.
				continue
			}
			select {
			case <-ctx.Done():
				return
			case events <- transformed:
			}
		}
	}()

	return events, nil
}
