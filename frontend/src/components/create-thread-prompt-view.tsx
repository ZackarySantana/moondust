import GitBranch from "lucide-solid/icons/git-branch";
import Loader2 from "lucide-solid/icons/loader-2";
import { Show, type Component } from "solid-js";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTitle,
} from "@/components/ui/dialog";

export type CreateThreadPhase = "prompt" | "creating";

export interface CreateThreadPromptViewProps {
    open: boolean;
    phase: CreateThreadPhase;
    useWorktree: boolean;
    error: string;
    pending: boolean;
    onWorktreeChange: (v: boolean) => void;
    onConfirm: () => void;
    onCancel: () => void;
    onOverlayClick: () => void;
    /** Escape closes when allowed (e.g. prompt phase, not while creating). */
    onEscapeKeyDown?: () => void;
}

export const CreateThreadPromptView: Component<CreateThreadPromptViewProps> = (
    props,
) => {
    return (
        <Dialog open={props.open} onEscapeKeyDown={props.onEscapeKeyDown}>
            <DialogOverlay
                aria-label="Close dialog"
                onClick={() => props.onOverlayClick()}
            />
            <DialogContent
                role="dialog"
                aria-modal="true"
            >
                <Show
                    when={props.phase === "prompt"}
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
                                <Show when={props.useWorktree}>
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
                                checked={props.useWorktree}
                                disabled={props.pending}
                                onChange={(e) =>
                                    props.onWorktreeChange(
                                        e.currentTarget.checked,
                                    )
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
                                onClick={() => props.onCancel()}
                            >
                                Settings &rarr; Git
                            </a>
                            .
                        </p>

                        <Show when={props.error}>
                            <p class="rounded-lg border border-red-900/30 bg-red-950/15 px-3 py-2 text-xs text-red-400">
                                {props.error}
                            </p>
                        </Show>

                        <div class="flex justify-end gap-2 pt-1">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => props.onCancel()}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                class="min-w-28"
                                disabled={props.pending}
                                onClick={() => props.onConfirm()}
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
