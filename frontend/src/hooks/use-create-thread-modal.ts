import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal, on, onCleanup } from "solid-js";
import { CreateThread } from "@wails/go/app/App";
import type { CreateThreadPhase } from "@/components/create-thread-prompt-view";
import type { DefaultWorktreePref } from "@/lib/default-worktree";
import { invalidateThreadList } from "@/lib/query-client";

export interface UseCreateThreadModalOptions {
    open: () => boolean;
    projectID: () => string;
    defaultWorktreePref: () => DefaultWorktreePref;
    onOpenChange: (open: boolean) => void;
}

/**
 * New-thread dialog: phase machine, {@link CreateThread} mutation, and keyboard handling.
 */
export function useCreateThreadModal(opts: UseCreateThreadModalOptions) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [useWorktree, setUseWorktree] = createSignal(false);
    const [phase, setPhase] = createSignal<CreateThreadPhase>("prompt");
    const [error, setError] = createSignal("");

    const createMutation = useMutation(() => ({
        mutationFn: (worktree: boolean) =>
            CreateThread(opts.projectID(), worktree),
        onSuccess: async (thread) => {
            await invalidateThreadList(queryClient);
            opts.onOpenChange(false);
            navigate(`/project/${thread.project_id}/thread/${thread.id}`);
        },
        onError: (e) => {
            setError(e instanceof Error ? e.message : String(e));
            setPhase("prompt");
        },
    }));

    function submit(worktree: boolean) {
        setError("");
        setPhase("creating");
        createMutation.mutate(worktree);
    }

    createEffect(
        on(
            () => opts.open(),
            (isOpen) => {
                if (!isOpen) return;
                setError("");
                const pref = opts.defaultWorktreePref();
                if (pref === "on") {
                    setUseWorktree(true);
                    setPhase("creating");
                    submit(true);
                } else if (pref === "off") {
                    setUseWorktree(false);
                    setPhase("creating");
                    submit(false);
                } else {
                    setUseWorktree(false);
                    setPhase("prompt");
                }
            },
        ),
    );

    createEffect(() => {
        if (!opts.open()) return;
        if (phase() !== "prompt") return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                submit(useWorktree());
            }
        };
        document.addEventListener("keydown", onKey);
        onCleanup(() => document.removeEventListener("keydown", onKey));
    });

    function canClose() {
        return phase() === "prompt" && !createMutation.isPending;
    }

    return {
        phase,
        useWorktree,
        setUseWorktree,
        error,
        createMutation,
        submit,
        canClose,
    };
}
