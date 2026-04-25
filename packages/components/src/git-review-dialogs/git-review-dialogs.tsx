import Loader2 from "lucide-solid/icons/loader-2";
import Sparkles from "lucide-solid/icons/sparkles";
import {
    createEffect,
    createSignal,
    onCleanup,
    Show,
    type Component,
    type JSX,
} from "solid-js";
import { Button } from "../button/button";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTitle,
} from "../dialog/dialog";

export interface GitActionDialogProps {
    open: boolean;
    title: string;
    pending: boolean;
    error: string;
    confirmLabel: string;
    confirmVariant?: "default" | "destructive";
    confirmMinWidth?: string;
    /** When true, Enter inserts a newline; Cmd/Ctrl+Enter confirms. */
    hasTextarea?: boolean;
    onClose: () => void;
    onConfirm: () => void;
    children?: JSX.Element;
}

export const GitActionDialog: Component<GitActionDialogProps> = (props) => {
    createEffect(() => {
        if (!props.open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Enter") return;
            if (props.pending) return;
            if (props.hasTextarea && !(e.metaKey || e.ctrlKey)) return;
            e.preventDefault();
            props.onConfirm();
        };
        document.addEventListener("keydown", onKey);
        onCleanup(() => document.removeEventListener("keydown", onKey));
    });

    const platformHint = () => {
        if (typeof navigator === "undefined") return "Ctrl";
        return navigator.platform?.includes("Mac") ? "⌘" : "Ctrl";
    };

    return (
        <Dialog
            open={props.open}
            onEscapeKeyDown={() => {
                if (!props.pending) props.onClose();
            }}
        >
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
                <DialogTitle>{props.title}</DialogTitle>
                {props.children}
                <Show when={props.error}>
                    <p class="mb-4 rounded-none border border-flare-600/40 bg-flare-700/10 px-3 py-2 text-xs text-flare-300">
                        {props.error}
                    </p>
                </Show>
                <div class="flex items-center justify-between gap-2">
                    <Show when={props.hasTextarea}>
                        <p class="font-mono text-[10px] text-void-500">
                            {platformHint()}+Enter to confirm
                        </p>
                    </Show>
                    <div class="ml-auto flex gap-2">
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
                            variant={props.confirmVariant ?? "default"}
                            class={`inline-flex items-center justify-center gap-2 ${props.confirmMinWidth ?? "min-w-28"}`}
                            disabled={props.pending}
                            onClick={() => props.onConfirm()}
                        >
                            <Show
                                when={props.pending}
                                fallback={props.confirmLabel}
                            >
                                <Loader2
                                    class="size-4 shrink-0 animate-spin"
                                    stroke-width={2}
                                    aria-hidden
                                />
                            </Show>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export interface DiscardFileGitDialogProps {
    open: boolean;
    filePath: string;
    pending: boolean;
    error: string;
    onClose: () => void;
    onConfirm: () => void;
}

export const DiscardFileGitDialog: Component<DiscardFileGitDialogProps> = (
    props,
) => (
    <GitActionDialog
        open={props.open}
        title="Discard changes to file?"
        pending={props.pending}
        error={props.error}
        confirmLabel="Discard"
        confirmVariant="destructive"
        onClose={props.onClose}
        onConfirm={props.onConfirm}
    >
        <p class="mb-1 text-sm text-void-300">
            Working tree edits will be reverted for:
        </p>
        <p class="mb-4 break-all border border-void-700 bg-void-950 px-2.5 py-1.5 font-mono text-xs text-void-100 select-all">
            {props.filePath}
        </p>
    </GitActionDialog>
);

export interface DiscardUnstagedGitDialogProps {
    open: boolean;
    pending: boolean;
    error: string;
    onClose: () => void;
    onConfirm: () => void;
}

export const DiscardUnstagedGitDialog: Component<
    DiscardUnstagedGitDialogProps
> = (props) => (
    <GitActionDialog
        open={props.open}
        title="Discard unstaged changes?"
        pending={props.pending}
        error={props.error}
        confirmLabel="Discard"
        confirmVariant="destructive"
        onClose={props.onClose}
        onConfirm={props.onConfirm}
    >
        <p class="mb-4 text-sm text-void-300">
            Working tree edits for unstaged files will be reverted to match the
            index or HEAD. Staged changes are not affected.
        </p>
    </GitActionDialog>
);

export interface CommitStagedGitDialogProps {
    open: boolean;
    message: string;
    pending: boolean;
    error: string;
    onMessage: (v: string) => void;
    onClose: () => void;
    onConfirm: () => void;
    onGenerate?: () => Promise<string>;
}

export const CommitStagedGitDialog: Component<CommitStagedGitDialogProps> = (
    props,
) => {
    const [generating, setGenerating] = createSignal(false);
    const [genError, setGenError] = createSignal("");

    async function generate() {
        if (!props.onGenerate || generating()) return;
        setGenerating(true);
        setGenError("");
        try {
            const msg = await props.onGenerate();
            props.onMessage(msg);
        } catch (e) {
            setGenError(e instanceof Error ? e.message : String(e));
        } finally {
            setGenerating(false);
        }
    }

    return (
        <GitActionDialog
            open={props.open}
            title="Commit staged changes"
            pending={props.pending}
            error={props.error || genError()}
            confirmLabel="Commit"
            hasTextarea
            onClose={props.onClose}
            onConfirm={props.onConfirm}
        >
            <div class="mb-1.5 flex items-center justify-between">
                <label class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-400">
                    Message
                </label>
                <Show when={props.onGenerate}>
                    <button
                        type="button"
                        disabled={generating() || props.pending}
                        onClick={() => void generate()}
                        class="inline-flex cursor-pointer items-center gap-1 rounded-none px-2 py-0.5 text-[11px] text-void-400 transition-colors duration-100 hover:bg-void-800 hover:text-starlight-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Show
                            when={!generating()}
                            fallback={
                                <Loader2
                                    class="size-3 animate-spin"
                                    stroke-width={2}
                                />
                            }
                        >
                            <Sparkles
                                class="size-3"
                                stroke-width={2}
                            />
                        </Show>
                        {generating() ? "Generating…" : "Generate"}
                    </button>
                </Show>
            </div>
            <textarea
                class="mb-4 min-h-24 w-full resize-y rounded-none border border-void-700 bg-void-950 px-3 py-2 font-mono text-sm text-void-100 placeholder:text-void-500 focus-visible:border-starlight-400 focus-visible:outline-none"
                placeholder="Commit message"
                rows={4}
                value={props.message}
                disabled={props.pending || generating()}
                onInput={(e) => props.onMessage(e.currentTarget.value)}
            />
        </GitActionDialog>
    );
};

export interface BranchCommitGitDialogProps {
    open: boolean;
    branchName: string;
    commitMessage: string;
    pending: boolean;
    error: string;
    onBranchName: (v: string) => void;
    onCommitMessage: (v: string) => void;
    onClose: () => void;
    onConfirm: () => void;
    onGenerate?: () => Promise<string>;
}

export const BranchCommitGitDialog: Component<BranchCommitGitDialogProps> = (
    props,
) => {
    const [generating, setGenerating] = createSignal(false);
    const [genError, setGenError] = createSignal("");

    async function generate() {
        if (!props.onGenerate || generating()) return;
        setGenerating(true);
        setGenError("");
        try {
            const msg = await props.onGenerate();
            props.onCommitMessage(msg);
        } catch (e) {
            setGenError(e instanceof Error ? e.message : String(e));
        } finally {
            setGenerating(false);
        }
    }

    return (
        <GitActionDialog
            open={props.open}
            title="New branch and commit"
            pending={props.pending}
            error={props.error || genError()}
            confirmLabel="Create branch & commit"
            confirmMinWidth="min-w-36"
            hasTextarea
            onClose={props.onClose}
            onConfirm={props.onConfirm}
        >
            <div class="mb-3 space-y-1.5">
                <label
                    for="review-branch-name"
                    class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-400"
                >
                    Branch name
                </label>
                <input
                    id="review-branch-name"
                    type="text"
                    class="w-full rounded-none border border-void-700 bg-void-950 px-3 py-2 font-mono text-sm text-void-100 placeholder:text-void-500 focus-visible:border-starlight-400 focus-visible:outline-none"
                    placeholder="feature/my-change"
                    value={props.branchName}
                    disabled={props.pending}
                    onInput={(e) => props.onBranchName(e.currentTarget.value)}
                />
            </div>
            <div class="mb-1.5 flex items-center justify-between">
                <label class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-400">
                    Commit message
                </label>
                <Show when={props.onGenerate}>
                    <button
                        type="button"
                        disabled={generating() || props.pending}
                        onClick={() => void generate()}
                        class="inline-flex cursor-pointer items-center gap-1 rounded-none px-2 py-0.5 text-[11px] text-void-400 transition-colors duration-100 hover:bg-void-800 hover:text-starlight-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Show
                            when={!generating()}
                            fallback={
                                <Loader2
                                    class="size-3 animate-spin"
                                    stroke-width={2}
                                />
                            }
                        >
                            <Sparkles
                                class="size-3"
                                stroke-width={2}
                            />
                        </Show>
                        {generating() ? "Generating…" : "Generate"}
                    </button>
                </Show>
            </div>
            <textarea
                class="mb-4 min-h-24 w-full resize-y rounded-none border border-void-700 bg-void-950 px-3 py-2 font-mono text-sm text-void-100 placeholder:text-void-500 focus-visible:border-starlight-400 focus-visible:outline-none"
                placeholder="Commit message"
                rows={4}
                value={props.commitMessage}
                disabled={props.pending || generating()}
                onInput={(e) => props.onCommitMessage(e.currentTarget.value)}
            />
        </GitActionDialog>
    );
};
