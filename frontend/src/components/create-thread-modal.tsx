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

export const CreateThreadModal: Component<CreateThreadModalProps> = (props) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const settingsQuery = useQuery(() => ({
        queryKey: queryKeys.settings,
        queryFn: GetSettings,
    }));

    const [useWorktree, setUseWorktree] = createSignal(false);

    const defaultPref = () => settingsQuery.data?.default_worktree || "ask";
    const needsPrompt = () => defaultPref() === "ask";

    createEffect(
        on(
            () => props.open,
            (isOpen) => {
                if (!isOpen) return;
                const pref = defaultPref();
                if (pref === "on") {
                    setUseWorktree(true);
                    submit(true);
                } else if (pref === "off") {
                    setUseWorktree(false);
                    submit(false);
                } else {
                    setUseWorktree(false);
                }
            },
        ),
    );

    createEffect(() => {
        if (!props.open || !needsPrompt()) return;
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
            alert(e instanceof Error ? e.message : String(e));
        },
    }));

    function submit(worktree: boolean) {
        createMutation.mutate(worktree);
    }

    return (
        <Show when={needsPrompt()}>
            <Dialog open={props.open && needsPrompt()}>
                <DialogOverlay
                    aria-label="Close dialog"
                    onClick={() => {
                        if (!createMutation.isPending)
                            props.onOpenChange(false);
                    }}
                />
                <DialogContent
                    role="dialog"
                    aria-modal="true"
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
                                disabled={createMutation.isPending}
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

                        <div class="flex justify-end gap-2 pt-1">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => props.onOpenChange(false)}
                                disabled={createMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                class="inline-flex min-w-28 items-center justify-center gap-2"
                                disabled={createMutation.isPending}
                                onClick={() => submit(useWorktree())}
                            >
                                <Show
                                    when={createMutation.isPending}
                                    fallback="Create thread"
                                >
                                    <Loader2
                                        class="size-4 shrink-0 animate-spin"
                                        stroke-width={2}
                                        aria-hidden
                                    />
                                    <span>Creating…</span>
                                </Show>
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Show>
    );
};
