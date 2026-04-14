package app

import (
	"context"
	"encoding/json"
	"fmt"
	"moondust/internal/notify"
	"moondust/internal/store"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) CreateThread(projectID string, useWorktree bool) (*store.Thread, error) {
	return a.service.CreateThread(a.Ctx, projectID, useWorktree)
}

// ForkThreadAtMessage copies chat history through the given message into a new thread (see service.ForkThreadAtMessage).
func (a *App) ForkThreadAtMessage(sourceThreadID, upToMessageID string) (*store.Thread, error) {
	return a.service.ForkThreadAtMessage(a.Ctx, sourceThreadID, upToMessageID)
}

func (a *App) GetThread(id string) (*store.Thread, error) {
	return a.service.GetThread(a.Ctx, id)
}

func (a *App) RenameThread(id, title string) error {
	return a.service.RenameThread(a.Ctx, id, title)
}

// DeleteThread removes a thread and its chat history. When removeWorktree is true, removes the thread's git worktree if present.
func (a *App) DeleteThread(threadID string, removeWorktree bool) error {
	return a.service.DeleteThread(a.Ctx, threadID, removeWorktree)
}

// SetThreadChatProvider saves which chat provider this thread uses (see store.Thread.ChatProvider).
func (a *App) SetThreadChatProvider(threadID, provider string) error {
	return a.service.SetThreadChatProvider(a.Ctx, threadID, provider)
}

// SetThreadChatModel saves the chat model id for this thread (see store.Thread.ChatModel).
func (a *App) SetThreadChatModel(threadID, model string) error {
	return a.service.SetThreadChatModel(a.Ctx, threadID, model)
}

func (a *App) ListThreads() ([]*store.Thread, error) {
	return a.service.ListThreads(a.Ctx)
}

func (a *App) ListThreadMessages(threadID string) ([]*store.ChatMessage, error) {
	return a.service.ListThreadMessages(a.Ctx, threadID)
}

func (a *App) SendThreadMessage(threadID, content string) ([]*store.ChatMessage, error) {
	msgs, err := a.service.SendThreadMessage(a.Ctx, threadID, content)
	if err != nil {
		return nil, err
	}

	emitCtx := a.Ctx
	streamCtx := context.Background()
	go func() {
		runtime.EventsEmit(emitCtx, "chat:stream_start", map[string]string{"thread_id": threadID})
		err := a.service.StreamAssistantReply(streamCtx, threadID, func(delta string) error {
			runtime.EventsEmit(emitCtx, "chat:stream", map[string]string{
				"thread_id": threadID,
				"delta":     delta,
			})
			return nil
		}, func(reasoningDelta string) error {
			if reasoningDelta == "" {
				return nil
			}
			runtime.EventsEmit(emitCtx, "chat:stream", map[string]string{
				"thread_id":       threadID,
				"reasoning_delta": reasoningDelta,
			})
			return nil
		}, func(round []store.OpenRouterToolCallRecord) error {
			b, err := json.Marshal(round)
			if err != nil {
				return err
			}
			runtime.EventsEmit(emitCtx, "chat:stream_tool", map[string]string{
				"thread_id":  threadID,
				"tools_json": string(b),
			})
			return nil
		})
		if err != nil {
			runtime.EventsEmit(emitCtx, "chat:stream_error", map[string]string{
				"thread_id": threadID,
				"error":     err.Error(),
			})
			return
		}
		runtime.EventsEmit(emitCtx, "chat:stream_done", map[string]string{"thread_id": threadID})

		title := "New reply"
		body := "You have a new message in your thread."
		link := ""
		if thread, errTh := a.service.GetThread(a.Ctx, threadID); errTh == nil && thread != nil {
			threadLabel := strings.TrimSpace(thread.Title)
			if threadLabel == "" {
				threadLabel = "New thread"
			}
			projName := "Project"
			if proj, errP := a.service.GetProject(a.Ctx, thread.ProjectID); errP == nil && proj != nil {
				projName = proj.Name
			}
			body = fmt.Sprintf("%s | %s", projName, threadLabel)
			link = fmt.Sprintf("/project/%s/thread/%s", thread.ProjectID, threadID)
		}
		a.notify.Emit(notify.EventChatMessageReceived, title, body, link)
	}()

	return msgs, nil
}
