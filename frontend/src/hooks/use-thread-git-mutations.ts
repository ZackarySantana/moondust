import { useMutation, useQueryClient } from "@tanstack/solid-query";
import {
    GitCheckoutNewBranchAndCommit,
    GitCommit,
    GitDiscardUnstaged,
    GitStageUnstaged,
    GitUnstageAll,
} from "@wails/go/app/App";
import { queryKeys } from "@/lib/query-client";

/**
 * Git mutations for the thread review sidebar (stage / discard / commit).
 * Call from a page container (e.g. thread.tsx), not from presentational components.
 */
export function useThreadGitMutations(threadId: string) {
    const queryClient = useQueryClient();

    const invalidateGit = () =>
        queryClient.invalidateQueries({
            queryKey: queryKeys.threads.gitStatus(threadId),
        });

    const stageMutation = useMutation(() => ({
        mutationFn: () => GitStageUnstaged(threadId),
        onSuccess: async () => {
            await invalidateGit();
        },
    }));

    const discardMutation = useMutation(() => ({
        mutationFn: () => GitDiscardUnstaged(threadId),
        onSuccess: async () => {
            await invalidateGit();
        },
    }));

    const unstageMutation = useMutation(() => ({
        mutationFn: () => GitUnstageAll(threadId),
        onSuccess: async () => {
            await invalidateGit();
        },
    }));

    const commitMutation = useMutation(() => ({
        mutationFn: (message: string) => GitCommit(threadId, message),
        onSuccess: async () => {
            await invalidateGit();
        },
    }));

    const branchCommitMutation = useMutation(() => ({
        mutationFn: (vars: { branch: string; message: string }) =>
            GitCheckoutNewBranchAndCommit(threadId, vars.branch, vars.message),
        onSuccess: async () => {
            await invalidateGit();
        },
    }));

    const gitBusy = () =>
        stageMutation.isPending ||
        discardMutation.isPending ||
        unstageMutation.isPending ||
        commitMutation.isPending ||
        branchCommitMutation.isPending;

    return {
        stageMutation,
        discardMutation,
        unstageMutation,
        commitMutation,
        branchCommitMutation,
        gitBusy,
    };
}

export type ThreadGitMutations = ReturnType<typeof useThreadGitMutations>;
