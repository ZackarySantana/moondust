package cursorchat

import "encoding/json"

type EventContent interface {
	content()
}

type RawEventContent struct {
	Type string `json:"type"`

	Raw json.RawMessage `json:"-"`
}

func (e *RawEventContent) UnmarshalJSON(data []byte) error {
	// Use an alias to avoid infinite recursion.
	type Alias RawEventContent
	if err := json.Unmarshal(data, (*Alias)(e)); err != nil {
		return err
	}
	// Copy the data to its own memory, we cannot use data directly.
	e.Raw = append(json.RawMessage(nil), data...)
	return nil
}

type EventContentText struct {
	Text string `json:"text"`
}

func (e *EventContentText) content() {}
