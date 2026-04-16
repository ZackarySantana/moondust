package app

import (
	"context"
	"encoding/json"
	"moondust/internal/store"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// SendLaneMessage persists a user message into a named lane, then starts a
// quick-question stream for non-main lanes.
func (a *App) SendLaneMessage(threadID, laneID, content string) (*store.ChatMessage, error) {
	msg, err := a.service.SendLaneMessage(a.Ctx, threadID, laneID, content)
	if err != nil {
		return nil, err
	}

	if laneID != "" && laneID != string(store.LaneMain) {
		emitCtx := a.Ctx
		streamCtx := context.Background()
		go func() {
			runtime.EventsEmit(emitCtx, "quick:stream_start", map[string]string{
				"thread_id": threadID,
				"lane_id":   laneID,
			})
			err := a.service.StreamQuickQuestion(streamCtx, threadID, laneID, func(delta string) error {
				runtime.EventsEmit(emitCtx, "quick:stream", map[string]string{
					"thread_id": threadID,
					"lane_id":   laneID,
					"delta":     delta,
				})
				return nil
			})
			if err != nil {
				runtime.EventsEmit(emitCtx, "quick:stream_error", map[string]string{
					"thread_id": threadID,
					"lane_id":   laneID,
					"error":     err.Error(),
				})
				return
			}
			runtime.EventsEmit(emitCtx, "quick:stream_done", map[string]string{
				"thread_id": threadID,
				"lane_id":   laneID,
			})
		}()
	}
	return msg, nil
}

// ListLaneMessages returns messages for a specific lane within a thread.
func (a *App) ListLaneMessages(threadID, laneID string) ([]*store.ChatMessage, error) {
	all, err := a.service.ListThreadMessages(a.Ctx, threadID)
	if err != nil {
		return nil, err
	}
	return store.FilterMessagesByLane(all, laneID), nil
}

// SuggestCommitMessage generates a commit title + summary from staged changes.
func (a *App) SuggestCommitMessage(threadID string) (string, error) {
	return a.service.SuggestCommitMessage(a.Ctx, threadID)
}

// ReviewBranchDiff produces a structured code review of the branch vs default.
func (a *App) ReviewBranchDiff(threadID string) (string, error) {
	return a.service.ReviewBranchDiff(a.Ctx, threadID)
}

// --- Git wizard operations ---

// GitFetch runs `git fetch` in the thread's working directory.
func (a *App) GitFetch(threadID string) error {
	return a.service.GitFetch(a.Ctx, threadID)
}

// GitMerge merges the specified branch into the current branch.
func (a *App) GitMerge(threadID, branch string) (string, error) {
	return a.service.GitMerge(a.Ctx, threadID, branch)
}

// GitRebaseOnto rebases the current branch onto the specified branch.
func (a *App) GitRebaseOnto(threadID, onto string) (string, error) {
	return a.service.GitRebaseOnto(a.Ctx, threadID, onto)
}

// GitRebaseAbort aborts an in-progress rebase.
func (a *App) GitRebaseAbort(threadID string) error {
	return a.service.GitRebaseAbort(a.Ctx, threadID)
}

// GitRebaseContinue continues a rebase after resolving conflicts.
func (a *App) GitRebaseContinue(threadID string) (string, error) {
	return a.service.GitRebaseContinue(a.Ctx, threadID)
}

// GitConflictState returns the current merge/rebase conflict state.
func (a *App) GitConflictState(threadID string) (*store.GitConflictState, error) {
	return a.service.GitConflictState(a.Ctx, threadID)
}

// GitListBranches returns local branch names for the thread's repo.
func (a *App) GitListBranches(threadID string) ([]string, error) {
	return a.service.GitListBranches(a.Ctx, threadID)
}

// StreamReviewBranchDiff streams a review and emits events (review:stream*).
func (a *App) StreamReviewBranchDiff(threadID string) error {
	emitCtx := a.Ctx
	go func() {
		runtime.EventsEmit(emitCtx, "review:stream_start", map[string]string{
			"thread_id": threadID,
		})
		review, err := a.service.ReviewBranchDiff(context.Background(), threadID)
		if err != nil {
			runtime.EventsEmit(emitCtx, "review:stream_error", map[string]string{
				"thread_id": threadID,
				"error":     err.Error(),
			})
			return
		}
		b, _ := json.Marshal(review)
		runtime.EventsEmit(emitCtx, "review:stream_done", map[string]string{
			"thread_id": threadID,
			"review":    string(b),
		})
	}()
	return nil
}
