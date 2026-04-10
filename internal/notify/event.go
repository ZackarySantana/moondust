package notify

type Kind string
type Level string

const (
	KindAll     Kind = "all"
	KindPush    Kind = "push"
	KindEmail   Kind = "email"
	KindSMS     Kind = "sms"
	KindSlack   Kind = "slack"
	KindWebhook Kind = "webhook"

	LevelInfo    Level = "info"
	LevelWarning Level = "warning"
	LevelError   Level = "error"
)

type Event struct {
	Title string
	Body  string

	Kind  Kind
	Level Level
}

func newEvent(title, body string, level Level, kind Kind) Event {
	return Event{
		Title: title,
		Body:  body,
		Level: level,
		Kind:  kind,
	}
}

func NewEvent(title, body string, level Level) Event {
	return newEvent(title, body, level, KindAll)
}

func NewPushEvent(title, body string, level Level) Event {
	return newEvent(title, body, level, KindPush)
}

func NewEmailEvent(title, body string, level Level) Event {
	return newEvent(title, body, level, KindEmail)
}

func NewSMSEvent(title, body string, level Level) Event {
	return newEvent(title, body, level, KindSMS)
}

func NewSlackEvent(title, body string, level Level) Event {
	return newEvent(title, body, level, KindSlack)
}

func NewWebhookEvent(title, body string, level Level) Event {
	return newEvent(title, body, level, KindWebhook)
}
