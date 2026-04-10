package notify

import (
	"context"
	"log/slog"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var _ Channel = (*PushChannel)(nil)
var _ ChannelSetup = (*PushChannel)(nil)
var _ ChannelShutdown = (*PushChannel)(nil)
var _ Event = (*pushEvent)(nil)

func NewPushChannel() *PushChannel {
	return &PushChannel{}
}

type PushChannel struct{}

func (c *PushChannel) Kind() Kind {
	return KindPush
}

func (c *PushChannel) Send(ctx context.Context, event Event) error {
	if !runtime.IsNotificationAvailable(ctx) {
		return nil
	}
	pushEvent, ok := event.(*pushEvent)
	if !ok {
		return nil
	}
	err := runtime.SendNotification(ctx, *pushEvent.options)
	if err != nil {
		slog.DebugContext(ctx, "send project created notification", "error", err)
	}
	return nil
}

func (c *PushChannel) Setup(ctx context.Context) {
	if err := runtime.InitializeNotifications(ctx); err != nil {
		slog.WarnContext(ctx, "notification service init failed; desktop notifications may be unavailable", "error", err)
	}
	if _, err := runtime.RequestNotificationAuthorization(ctx); err != nil {
		slog.DebugContext(ctx, "notification authorization", "error", err)
	}
	applyWindowsToastDisplayName()
}

func (c *PushChannel) Shutdown(ctx context.Context) {
	runtime.CleanupNotifications(ctx)
}

type pushEvent struct {
	options *runtime.NotificationOptions
	level   Level
}

func NewPushNotification(level Level, options *runtime.NotificationOptions) Event {
	return &pushEvent{
		options: options,
		level:   level,
	}
}

func (e *pushEvent) Level() Level {
	return e.level
}

func (e *pushEvent) Kind() Kind {
	return KindPush
}
