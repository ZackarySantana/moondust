import { useMutation, useQueryClient } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import {
    GitCheckoutNewBranchAndCommit,
    GitCommit,
    GitDiscardFile,
    GitDiscardUnstaged,
    GitPull,
    GitPush,
    GitRenameBranch,
    GitStageFile,
    GitStageUnstaged,
    GitStageUntracked,
    GitStash,
    GitStashPop,
    GitUnstageAll,
    GitUnstageFile,
} from "@wails/go/app/App";
import { queryKeys } from "@/lib/query-client";

/**
 * Git mutations for the thread review sidebar.
 * Call from a page container (e.g. thread.tsx), not from presentational components.
 */
export function useThreadGitMutations(threadId: Accessor<string>) {
    const queryClient = useQueryClient();

    const invalidateGit = () =>
        queryClient.invalidateQueries({
            queryKey: queryKeys.threads.gitStatus(threadId()),
        });

    const stageMutation = useMutation(() => ({
        mutationFn: () => GitStageUnstaged(threadId()),
        onSuccess: async () => {
            await invalidateGit();
        },
    }));

    const discardMutation = useMutation(() => ({
        mutationFn: () => GitDiscardUnstaged(threadId()),
        onSuccess: async () => {
            await invalidateGit();
        },
    }));

    const unstageMutation = useMutation(() => ({
        mutationFn: () => GitUnstageAll(threadId()),
        onSuccess: async () => {
            await invalidateGit();
        },
    }));

    const commitMutation = useMutation(() => ({
        mutationFn: (message: string) => GitCommit(threadId(), message),
        onSuccess: async () => {
            await invalidateGit();
        },
    }));

    const branchCommitMutation = useMutation(() => ({
        mutationFn: (vars: { branch: string; message: string }) =>
            GitCheckoutNewBranchAndCommit(
                threadId(),
                vars.branch,
                vars.message,
            ),
        onSuccess: async () => {
            await invalidateGit();
        },
    }));

    const pushMutation = useMutation(() => ({
        mutationFn: () => GitPush(threadId()),
        onSuccess: async () => {
            await invalidateGit();
        },
    }));

    const pullMutation = useMutation(() => ({
        mutationFn: () => GitPull(threadId()),
        onSuccess: async () => {
            await invalidateGit();
        },
    }));

    const stageFileMutation = useMutation(() => ({
        mutationFn: (filePath: string) => GitStageFile(threadId(), filePath),
        onSuccess: async () => {
            await invalidateGit();
        },
    }));

    const unstageFileMutation = useMutation(() => ({
        mutationFn: (filePath: string) => GitUnstageFile(threadId(), filePath),
        onSuccess: async () => {
            await invalidateGit();
        },
    }));

    const discardFileMutation = useMutation(() => ({
        mutationFn: (filePath: string) => GitDiscardFile(threadId(), filePath),
        onSuccess: async () => {
            await invalidateGit();
        },
    }));

    const stageUntrackedMutation = useMutation(() => ({
        mutationFn: () => GitStageUntracked(threadId()),
        onSuccess: async () => {
            await invalidateGit();
        },
    }));

    const stashMutation = useMutation(() => ({
        mutationFn: () => GitStash(threadId()),
        onSuccess: async () => {
            await invalidateGit();
        },
    }));

    const stashPopMutation = useMutation(() => ({
        mutationFn: () => GitStashPop(threadId()),
        onSuccess: async () => {
            await invalidateGit();
        },
    }));

    const renameBranchMutation = useMutation(() => ({
        mutationFn: (newName: string) => GitRenameBranch(threadId(), newName),
        onSuccess: async () => {
            await invalidateGit();
        },
    }));

    const gitBusy = () =>
        stageMutation.isPending ||
        discardMutation.isPending ||
        unstageMutation.isPending ||
        commitMutation.isPending ||
        branchCommitMutation.isPending ||
        pushMutation.isPending ||
        pullMutation.isPending ||
        stageFileMutation.isPending ||
        stageUntrackedMutation.isPending ||
        unstageFileMutation.isPending ||
        discardFileMutation.isPending ||
        stashMutation.isPending ||
        stashPopMutation.isPending ||
        renameBranchMutation.isPending;

    return {
        stageMutation,
        discardMutation,
        unstageMutation,
        commitMutation,
        branchCommitMutation,
        pushMutation,
        pullMutation,
        stageFileMutation,
        stageUntrackedMutation,
        unstageFileMutation,
        discardFileMutation,
        stashMutation,
        stashPopMutation,
        renameBranchMutation,
        gitBusy,
    };
}

export type ThreadGitMutations = ReturnType<typeof useThreadGitMutations>;
