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

type Event interface {
	Level() Level
	Kind() Kind
}
