package app

import "moondust/internal/v1/store"

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

func (a *App) GitStageUntracked(threadID string) error {
	return a.service.GitStageUntracked(a.Ctx, threadID)
}

func (a *App) GitPush(threadID string) error {
	return a.service.GitPush(a.Ctx, threadID)
}

func (a *App) GitPull(threadID string) error {
	return a.service.GitPull(a.Ctx, threadID)
}

func (a *App) GitStageFile(threadID, filePath string) error {
	return a.service.GitStageFile(a.Ctx, threadID, filePath)
}

func (a *App) GitUnstageFile(threadID, filePath string) error {
	return a.service.GitUnstageFile(a.Ctx, threadID, filePath)
}

func (a *App) GitDiscardFile(threadID, filePath string) error {
	return a.service.GitDiscardFile(a.Ctx, threadID, filePath)
}

func (a *App) GitStash(threadID string) error {
	return a.service.GitStash(a.Ctx, threadID)
}

func (a *App) GitStashPop(threadID string) error {
	return a.service.GitStashPop(a.Ctx, threadID)
}

func (a *App) GitRenameBranch(threadID, newName string) error {
	return a.service.GitRenameBranch(a.Ctx, threadID, newName)
}

func (a *App) GetFileDiff(threadID, filePath, status string) (*store.FileDiff, error) {
	return a.service.GetFileDiff(a.Ctx, threadID, filePath, status)
}
