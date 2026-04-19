package cursor_test

import (
	"encoding/json"
	"io"
	"moondust/src/v2/chat"
	"moondust/src/v2/provider/cursor"
	"moondust/src/v2/provider/cursor/cursorchat"
	"moondust/src/v2/run/runtest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestAsk(t *testing.T) {
	t.Parallel()

	mock := &runtest.MockExecutor{}
	cli := cursor.New(cursor.WithCommandRunner(mock))

	data, err := os.ReadFile("cursorchat/testdata/example_small.ndjson")
	require.NoError(t, err)

	// Send over all the history as history and as Run output.
	// This unit test is testing that the history are processed correctly.
	history := make([]chat.Event, 15)
	eventsJSON := make([]string, 15)
	for i, line := range strings.Split(string(data), "\n") {
		if line == "" {
			continue
		}
		var rawEvent cursorchat.RawEvent
		require.NoError(t, json.Unmarshal([]byte(line), &rawEvent))
		event, err := rawEvent.Get()
		require.NoError(t, err)

		str, err := json.Marshal(event)
		require.NoError(t, err)
		eventsJSON[i] = string(str)

		canonicalEvent, err := event.ToCanonical()
		require.NoError(t, err)
		history[i] = canonicalEvent

	}

	require.Len(t, history, 15)

	workDir := t.TempDir()
	model := "test"
	prompt := "how many questions have I asked you"

	mock.RunOutputs = [][]io.ReadCloser{
		{
			io.NopCloser(strings.NewReader(strings.Join(eventsJSON, "\n"))),
			io.NopCloser(strings.NewReader("")),
		},
	}

	eventsChan, err := cli.Ask(t.Context(), workDir, model, history, prompt)
	require.NoError(t, err)

	receivedEvents := 0

loop:
	for {
		select {
		case _, ok := <-eventsChan:
			if !ok {
				break loop
			}
			receivedEvents++
		case <-time.After(1 * time.Second):
			t.Fatal("timed out")
		}
	}

	require.Equal(t, len(history), receivedEvents)
}
