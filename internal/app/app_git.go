package app

import "moondust/internal/store"

func (a *App) GetThreadGitStatus(threadID string) (*store.GitStatus, error) {
	return a.service.GetThreadGitStatus(a.Ctx, threadID)
}

func (a *App) GetThreadGitReview(threadID string) (*store.GitReview, error) {
	return a.service.GetThreadGitReview(a.Ctx, threadID)
}

func (a *App) GitStageUnstaged(threadID string) error {
	return a.service.GitStageUnstaged(a.Ctx, threadID)
}

func (a *App) GitDiscardUnstaged(threadID string) error {
	return a.service.GitDiscardUnstaged(a.Ctx, threadID)
}

func (a *App) GitUnstageAll(threadID string) error {
	return a.service.GitUnstageAll(a.Ctx, threadID)
}

func (a *App) GitCommit(threadID, message string) error {
	return a.service.GitCommit(a.Ctx, threadID, message)
}

func (a *App) GitCheckoutNewBranchAndCommit(threadID, branch, message string) error {
	return a.service.GitCheckoutNewBranchAndCommit(a.Ctx, threadID, branch, message)
}

func (a *App) GetFileDiff(threadID, filePath, status string) (*store.FileDiff, error) {
	return a.service.GetFileDiff(a.Ctx, threadID, filePath, status)
}
