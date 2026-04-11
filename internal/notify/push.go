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

func (c *PushChannel) Send(ctx context.Context, event Event) (retErr error) {
	defer func() {
		if r := recover(); r != nil {
			slog.DebugContext(ctx, "notification send panicked", "panic", r)
		}
	}()
	if !runtime.IsNotificationAvailable(ctx) {
		return nil
	}
	pushEvent, ok := event.(*pushEvent)
	if !ok {
		return nil
	}
	err := runtime.SendNotification(ctx, *pushEvent.options)
	if err != nil {
		slog.DebugContext(ctx, "send notification", "error", err)
	}
	return nil
}

func (c *PushChannel) Setup(ctx context.Context) {
	defer func() {
		if r := recover(); r != nil {
			slog.WarnContext(ctx, "notification setup panicked; desktop notifications disabled", "panic", r)
		}
	}()
	if err := runtime.InitializeNotifications(ctx); err != nil {
		slog.WarnContext(ctx, "notification service init failed; desktop notifications may be unavailable", "error", err)
		return
	}
	if _, err := runtime.RequestNotificationAuthorization(ctx); err != nil {
		slog.DebugContext(ctx, "notification authorization", "error", err)
	}
	applyWindowsToastDisplayName()
}

func (c *PushChannel) Shutdown(ctx context.Context) {
	defer func() {
		if r := recover(); r != nil {
			slog.DebugContext(ctx, "notification cleanup panicked", "panic", r)
		}
	}()
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
