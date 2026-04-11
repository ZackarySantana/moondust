import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { useNavigate } from "@solidjs/router";
import GitBranch from "lucide-solid/icons/git-branch";
import Loader2 from "lucide-solid/icons/loader-2";
import {
    createEffect,
    createSignal,
    on,
    onCleanup,
    Show,
    type Component,
} from "solid-js";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTitle,
} from "@/components/ui/dialog";
import { queryKeys } from "@/lib/query-client";
import { CreateThread, GetSettings } from "@wails/go/app/App";

export interface CreateThreadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectID: string;
}

type Phase = "prompt" | "creating";

export const CreateThreadModal: Component<CreateThreadModalProps> = (props) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const settingsQuery = useQuery(() => ({
        queryKey: queryKeys.settings,
        queryFn: GetSettings,
    }));

    const [useWorktree, setUseWorktree] = createSignal(false);
    const [phase, setPhase] = createSignal<Phase>("prompt");
    const [error, setError] = createSignal("");

    const defaultPref = () => settingsQuery.data?.default_worktree || "ask";

    createEffect(
        on(
            () => props.open,
            (isOpen) => {
                if (!isOpen) return;
                setError("");
                const pref = defaultPref();
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
        if (!props.open) return;
        if (phase() !== "prompt") return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") props.onOpenChange(false);
        };
        document.addEventListener("keydown", onKey);
        onCleanup(() => document.removeEventListener("keydown", onKey));
    });

    const createMutation = useMutation(() => ({
        mutationFn: (worktree: boolean) =>
            CreateThread(props.projectID, worktree),
        onSuccess: async (thread) => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.threads.all,
            });
            props.onOpenChange(false);
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

    function canClose() {
        return phase() === "prompt" && !createMutation.isPending;
    }

    return (
        <Dialog open={props.open}>
            <DialogOverlay
                aria-label="Close dialog"
                onClick={() => {
                    if (canClose()) props.onOpenChange(false);
                }}
            />
            <DialogContent
                role="dialog"
                aria-modal="true"
            >
                <Show
                    when={phase() === "prompt"}
                    fallback={
                        <div class="flex flex-col items-center gap-4 py-6">
                            <Loader2
                                class="size-8 animate-spin text-emerald-500"
                                stroke-width={1.5}
                                aria-hidden
                            />
                            <div class="text-center">
                                <p class="text-sm font-medium text-slate-200">
                                    Creating thread…
                                </p>
                                <Show when={useWorktree()}>
                                    <p class="mt-1 text-xs text-slate-500">
                                        Setting up Git worktree and branch
                                    </p>
                                </Show>
                            </div>
                        </div>
                    }
                >
                    <DialogTitle>New thread</DialogTitle>
                    <div class="space-y-4">
                        <p class="text-sm text-slate-400">
                            Would you like to create a Git worktree for this
                            thread? This gives the thread its own branch and
                            working copy.
                        </p>

                        <label class="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-800/40 px-3 py-2.5">
                            <input
                                type="checkbox"
                                class="size-4 shrink-0 cursor-pointer rounded border-slate-700 bg-slate-950/40 text-emerald-500 accent-emerald-500"
                                checked={useWorktree()}
                                onChange={(e) =>
                                    setUseWorktree(e.currentTarget.checked)
                                }
                            />
                            <div class="flex items-center gap-1.5">
                                <GitBranch
                                    class="size-3.5 text-slate-400"
                                    stroke-width={2}
                                />
                                <span class="text-sm text-slate-300">
                                    Use a Git worktree
                                </span>
                            </div>
                        </label>

                        <p class="text-[11px] text-slate-600">
                            You can set a default in{" "}
                            <a
                                href="/settings/git"
                                class="text-emerald-500 hover:underline"
                                onClick={() => props.onOpenChange(false)}
                            >
                                Settings &rarr; Git
                            </a>
                            .
                        </p>

                        <Show when={error()}>
                            <p class="rounded-lg border border-red-900/30 bg-red-950/15 px-3 py-2 text-xs text-red-400">
                                {error()}
                            </p>
                        </Show>

                        <div class="flex justify-end gap-2 pt-1">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => props.onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                class="min-w-28"
                                onClick={() => submit(useWorktree())}
                            >
                                Create thread
                            </Button>
                        </div>
                    </div>
                </Show>
            </DialogContent>
        </Dialog>
    );
};
