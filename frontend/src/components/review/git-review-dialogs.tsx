import Loader2 from "lucide-solid/icons/loader-2";
import { Show, type Component } from "solid-js";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTitle,
} from "@/components/ui/dialog";

export const DiscardUnstagedGitDialog: Component<{
    open: boolean;
    pending: boolean;
    error: string;
    onClose: () => void;
    onConfirm: () => void;
}> = (props) => {
    return (
        <Dialog open={props.open}>
            <DialogOverlay
                aria-label="Close dialog"
                onClick={() => {
                    if (!props.pending) props.onClose();
                }}
            />
            <DialogContent
                role="dialog"
                aria-modal="true"
            >
                <DialogTitle>Discard unstaged changes?</DialogTitle>
                <p class="mb-4 text-sm text-slate-400">
                    Working tree edits for unstaged files will be reverted to
                    match the index or HEAD. Staged changes are not affected.
                </p>
                <Show when={props.error}>
                    <p class="mb-4 rounded-lg border border-red-900/30 bg-red-950/15 px-3 py-2 text-xs text-red-400">
                        {props.error}
                    </p>
                </Show>
                <div class="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={props.pending}
                        onClick={() => props.onClose()}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        class="inline-flex min-w-28 items-center justify-center gap-2"
                        disabled={props.pending}
                        onClick={() => props.onConfirm()}
                    >
                        <Show
                            when={props.pending}
                            fallback="Discard"
                        >
                            <Loader2
                                class="size-4 shrink-0 animate-spin"
                                stroke-width={2}
                                aria-hidden
                            />
                        </Show>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const CommitStagedGitDialog: Component<{
    open: boolean;
    message: string;
    pending: boolean;
    error: string;
    onMessage: (v: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}> = (props) => {
    return (
        <Dialog open={props.open}>
            <DialogOverlay
                aria-label="Close dialog"
                onClick={() => {
                    if (!props.pending) props.onClose();
                }}
            />
            <DialogContent
                role="dialog"
                aria-modal="true"
            >
                <DialogTitle>Commit staged changes</DialogTitle>
                <textarea
                    class="mb-4 min-h-24 w-full resize-y rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-slate-600 focus:outline-none"
                    placeholder="Commit message"
                    rows={4}
                    value={props.message}
                    disabled={props.pending}
                    onInput={(e) => props.onMessage(e.currentTarget.value)}
                />
                <Show when={props.error}>
                    <p class="mb-4 rounded-lg border border-red-900/30 bg-red-950/15 px-3 py-2 text-xs text-red-400">
                        {props.error}
                    </p>
                </Show>
                <div class="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={props.pending}
                        onClick={() => props.onClose()}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        class="inline-flex min-w-28 items-center justify-center gap-2"
                        disabled={props.pending}
                        onClick={() => props.onConfirm()}
                    >
                        <Show
                            when={props.pending}
                            fallback="Commit"
                        >
                            <Loader2
                                class="size-4 shrink-0 animate-spin"
                                stroke-width={2}
                                aria-hidden
                            />
                        </Show>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const BranchCommitGitDialog: Component<{
    open: boolean;
    branchName: string;
    commitMessage: string;
    pending: boolean;
    error: string;
    onBranchName: (v: string) => void;
    onCommitMessage: (v: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}> = (props) => {
    return (
        <Dialog open={props.open}>
            <DialogOverlay
                aria-label="Close dialog"
                onClick={() => {
                    if (!props.pending) props.onClose();
                }}
            />
            <DialogContent
                role="dialog"
                aria-modal="true"
            >
                <DialogTitle>New branch and commit</DialogTitle>
                <div class="mb-3 space-y-1.5">
                    <label
                        for="review-branch-name"
                        class="text-xs text-slate-500"
                    >
                        Branch name
                    </label>
                    <input
                        id="review-branch-name"
                        type="text"
                        class="w-full rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 py-2 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:border-slate-600 focus:outline-none"
                        placeholder="feature/my-change"
                        value={props.branchName}
                        disabled={props.pending}
                        onInput={(e) =>
                            props.onBranchName(e.currentTarget.value)
                        }
                    />
                </div>
                <textarea
                    class="mb-4 min-h-24 w-full resize-y rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-slate-600 focus:outline-none"
                    placeholder="Commit message"
                    rows={4}
                    value={props.commitMessage}
                    disabled={props.pending}
                    onInput={(e) =>
                        props.onCommitMessage(e.currentTarget.value)
                    }
                />
                <Show when={props.error}>
                    <p class="mb-4 rounded-lg border border-red-900/30 bg-red-950/15 px-3 py-2 text-xs text-red-400">
                        {props.error}
                    </p>
                </Show>
                <div class="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={props.pending}
                        onClick={() => props.onClose()}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        class="inline-flex min-w-36 items-center justify-center gap-2"
                        disabled={props.pending}
                        onClick={() => props.onConfirm()}
                    >
                        <Show
                            when={props.pending}
                            fallback="Create branch & commit"
                        >
                            <Loader2
                                class="size-4 shrink-0 animate-spin"
                                stroke-width={2}
                                aria-hidden
                            />
                        </Show>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
