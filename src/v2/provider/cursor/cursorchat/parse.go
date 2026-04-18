package cursorchat

import (
	"fmt"
	"moondust/src/v2/chat"
)

func toCanonicalMessageList(contents []EventContent) ([]chat.Message, error) {
	msgs := make([]chat.Message, len(contents))
	for i, content := range contents {
		msg, err := toCanonicalMessage(content)
		if err != nil {
			return nil, fmt.Errorf("parsing event content %d: %w", i, err)
		}
		msgs[i] = msg
	}
	return msgs, nil
}

func toCanonicalMessage(content EventContent) (chat.Message, error) {
	switch content := content.(type) {
	case *EventContentText:
		return &chat.TextMessage{
			Text: content.Text,
		}, nil
	}
	return nil, fmt.Errorf("unknown content type: %T", content)
}

func fromCanonicalMessageList(messages []chat.Message) ([]EventContent, error) {
	contents := make([]EventContent, len(messages))
	for i, message := range messages {
		content, err := fromCanonicalMessage(message)
		if err != nil {
			return nil, fmt.Errorf("parsing event content %d: %w", i, err)
		}
		contents[i] = content
	}
	return contents, nil
}

func fromCanonicalMessage(message chat.Message) (EventContent, error) {
	switch message := message.(type) {
	case *chat.TextMessage:
		return &EventContentText{
			Text: message.Text,
		}, nil
	}
	return nil, fmt.Errorf("unknown message type: %T", message)
}
