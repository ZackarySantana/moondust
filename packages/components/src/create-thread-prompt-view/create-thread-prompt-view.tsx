import GitBranch from "lucide-solid/icons/git-branch";
import Loader2 from "lucide-solid/icons/loader-2";
import { Show, type Component, type JSX } from "solid-js";
import { Button } from "../button/button";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTitle,
} from "../dialog/dialog";

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
    /**
     * Optional helper line below the worktree toggle, e.g. a settings link.
     * Slot in your own router-aware element here.
     */
    helperHint?: JSX.Element;
}

export const CreateThreadPromptView: Component<CreateThreadPromptViewProps> = (
    props,
) => {
    return (
        <Dialog
            open={props.open}
            onEscapeKeyDown={props.onEscapeKeyDown}
        >
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
                                class="size-8 animate-spin text-starlight-400"
                                stroke-width={1.5}
                                aria-hidden
                            />
                            <div class="text-center">
                                <p class="text-sm font-medium text-void-50">
                                    Creating thread…
                                </p>
                                <Show when={props.useWorktree}>
                                    <p class="mt-1 text-xs text-void-400">
                                        Setting up Git worktree and branch
                                    </p>
                                </Show>
                            </div>
                        </div>
                    }
                >
                    <DialogTitle>New thread</DialogTitle>
                    <div class="space-y-4">
                        <p class="text-sm text-void-300">
                            Would you like to create a Git worktree for this
                            thread? This gives the thread its own branch and
                            working copy.
                        </p>

                        <label class="flex cursor-pointer items-center gap-2.5 rounded-none border border-void-700 bg-void-850 px-3 py-2.5 transition-colors duration-100 hover:border-void-600">
                            <input
                                type="checkbox"
                                class="size-4 shrink-0 cursor-pointer rounded-none border-void-600 bg-void-900 accent-starlight-400"
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
                                    class="size-3.5 text-nebula-300"
                                    stroke-width={2}
                                />
                                <span class="text-sm text-void-100">
                                    Use a Git worktree
                                </span>
                            </div>
                        </label>

                        <Show when={props.helperHint}>
                            <p class="text-[11px] text-void-500">
                                {props.helperHint}
                            </p>
                        </Show>

                        <Show when={props.error}>
                            <p class="rounded-none border border-flare-600/40 bg-flare-700/10 px-3 py-2 text-xs text-flare-300">
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
