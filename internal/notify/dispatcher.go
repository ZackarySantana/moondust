package notify

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/json"
	"log/slog"
	"moondust/internal/store"
	"net/http"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const (
	EventProjectCreated      = "project_created"
	EventChatMessageReceived = "chat_message_received"
)

type Dispatcher struct {
	settings store.SettingsStore
	ctx      context.Context
}

func NewDispatcher(settings store.SettingsStore) *Dispatcher {
	return &Dispatcher{settings: settings}
}

func (d *Dispatcher) Setup(ctx context.Context) {
	d.ctx = ctx
	setupPush(ctx)
}

func (d *Dispatcher) Shutdown(ctx context.Context) {
	shutdownPush(ctx)
}

// Emit fires notifications for the given event type. It is fully
// fire-and-forget: each enabled channel runs in its own goroutine
// with panic recovery and errors are logged, never returned.
func (d *Dispatcher) Emit(eventType, title, body string) {
	cfg := d.configFor(eventType)

	if cfg.Push && pushAvailable {
		go d.sendPush(title, body)
	}
	if cfg.InApp {
		go d.sendInApp(title, body)
	}
	if cfg.Slack && cfg.SlackWebhookURL != "" {
		go d.sendSlack(cfg.SlackWebhookURL, title, body)
	}
	if cfg.Email {
		slog.Debug("email notifications not yet implemented", "event", eventType)
	}
}

func (d *Dispatcher) configFor(eventType string) store.NotificationChannelConfig {
	defaults := store.NotificationChannelConfig{
		Push:  pushAvailable,
		InApp: true,
	}
	if d.settings == nil {
		return defaults
	}
	settings, err := d.settings.Get(context.Background())
	if err != nil {
		slog.Debug("failed to load notification settings", "error", err)
		return defaults
	}
	if settings.Notifications == nil {
		return defaults
	}
	cfg, ok := settings.Notifications[eventType]
	if !ok || cfg == nil {
		return defaults
	}
	return *cfg
}

// sendPush sends a desktop push notification via the Wails runtime.
// Runs with panic recovery because macOS's UNUserNotificationCenter can
// crash with an unrecoverable cgo/Objective-C signal when the app is
// unsigned or lacks a bundle identifier.
func (d *Dispatcher) sendPush(title, body string) {
	defer func() {
		if r := recover(); r != nil {
			slog.Debug("push notification panicked", "panic", r)
		}
	}()
	ctx := d.ctx
	if ctx == nil {
		return
	}
	if !runtime.IsNotificationAvailable(ctx) {
		return
	}
	if err := runtime.SendNotification(ctx, runtime.NotificationOptions{
		ID:    rand.Text(),
		Title: title,
		Body:  body,
	}); err != nil {
		slog.Debug("push notification failed", "error", err)
	}
}

func (d *Dispatcher) sendInApp(title, body string) {
	defer func() {
		if r := recover(); r != nil {
			slog.Debug("in-app notification panicked", "panic", r)
		}
	}()
	ctx := d.ctx
	if ctx == nil {
		return
	}
	runtime.EventsEmit(ctx, "notification", map[string]string{
		"title": title,
		"body":  body,
	})
}

func (d *Dispatcher) sendSlack(webhookURL, title, body string) {
	defer func() {
		if r := recover(); r != nil {
			slog.Debug("slack notification panicked", "panic", r)
		}
	}()
	payload, err := json.Marshal(map[string]string{
		"text": "*" + title + "*\n" + body,
	})
	if err != nil {
		slog.Debug("slack notification marshal failed", "error", err)
		return
	}
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post(webhookURL, "application/json", bytes.NewReader(payload))
	if err != nil {
		slog.Debug("slack notification failed", "error", err)
		return
	}
	resp.Body.Close()
	if resp.StatusCode >= 300 {
		slog.Debug("slack notification non-ok status", "status", resp.StatusCode)
	}
}
