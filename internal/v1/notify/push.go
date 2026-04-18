package notify

import (
	"context"
	"log/slog"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// PushAvailable reports whether push notifications are available on this platform.
func PushAvailable() bool {
	return pushAvailable
}

func setupPush(ctx context.Context) {
	if !pushAvailable {
		slog.InfoContext(ctx, "push notifications disabled on this platform")
		return
	}
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

func shutdownPush(ctx context.Context) {
	if !pushAvailable {
		return
	}
	defer func() {
		if r := recover(); r != nil {
			slog.DebugContext(ctx, "notification cleanup panicked", "panic", r)
		}
	}()
	runtime.CleanupNotifications(ctx)
}
