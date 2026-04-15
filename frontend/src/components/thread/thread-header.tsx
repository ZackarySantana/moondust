import FolderOpen from "lucide-solid/icons/folder-open";
import PanelBottom from "lucide-solid/icons/panel-bottom";
import PanelBottomDashed from "lucide-solid/icons/panel-bottom-dashed";
import PanelRight from "lucide-solid/icons/panel-right";
import PanelRightDashed from "lucide-solid/icons/panel-right-dashed";
import Settings from "lucide-solid/icons/settings";
import Trash2 from "lucide-solid/icons/trash-2";
import { A } from "@solidjs/router";
import type { Component } from "solid-js";
import { createEffect, createSignal, on, onCleanup, Show } from "solid-js";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/kbd";

export const ThreadHeader: Component<{
    editingTitle: () => boolean;
    titleDraft: () => string;
    setTitleDraft: (v: string) => void;
    threadTitle: () => string | undefined;
    projectName: () => string | undefined;
    workingDir: () => string;
    titleInputRef: (el: HTMLInputElement) => void;
    onStartEditTitle: () => void;
    onCommitTitle: () => void | Promise<void>;
    onCancelEditTitle: () => void;
    terminalOpen: () => boolean;
    onToggleTerminal: () => void;
    sidebarOpen: () => boolean;
    onToggleSidebar: () => void;
    formatKey: (id: string) => string;
    hasWorktree: () => boolean;
    /** Route to thread settings (read-only details). */
    threadSettingsHref: string;
    onDeleteThread: (removeWorktree: boolean) => Promise<void>;
}> = (props) => {
    const [deleteOpen, setDeleteOpen] = createSignal(false);
    const [removeWorktree, setRemoveWorktree] = createSignal(true);
    const [deleting, setDeleting] = createSignal(false);
    const [deleteError, setDeleteError] = createSignal("");

    let confirmButtonEl!: HTMLButtonElement;

    createEffect(
        on(
            () => deleteOpen(),
            (open) => {
                if (open) {
                    setRemoveWorktree(true);
                    setDeleteError("");
                    requestAnimationFrame(() => confirmButtonEl?.focus());
                }
            },
        ),
    );

    createEffect(() => {
        if (!deleteOpen()) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Enter" || e.shiftKey || deleting()) return;
            e.preventDefault();
            void confirmDelete();
        };
        document.addEventListener("keydown", onKey);
        onCleanup(() => document.removeEventListener("keydown", onKey));
    });

    function closeDeleteModal() {
        if (deleting()) return;
        setDeleteOpen(false);
    }

    async function confirmDelete() {
        if (deleting()) return;
        setDeleteError("");
        setDeleting(true);
        try {
            await props.onDeleteThread(removeWorktree());
            setDeleteOpen(false);
        } catch (err) {
            const msg =
                err instanceof Error
                    ? err.message
                    : typeof err === "string"
                      ? err
                      : "Failed to delete thread";
            setDeleteError(msg);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <header class="flex items-center gap-3 border-b border-slate-800/40 px-4 py-2.5">
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                        <Show
                            when={props.editingTitle()}
                            fallback={
                                <h1
                                    class="cursor-pointer truncate text-sm font-medium text-slate-100 hover:text-white"
                                    onClick={props.onStartEditTitle}
                                    title="Click to rename"
                                >
                                    {props.threadTitle() || "Untitled thread"}
                                </h1>
                            }
                        >
                            <input
                                ref={props.titleInputRef}
                                type="text"
                                value={props.titleDraft()}
                                onInput={(e) =>
                                    props.setTitleDraft(e.currentTarget.value)
                                }
                                onBlur={() => void props.onCommitTitle()}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        void props.onCommitTitle();
                                    } else if (e.key === "Escape") {
                                        e.preventDefault();
                                        props.onCancelEditTitle();
                                    }
                                }}
                                class="min-w-0 truncate rounded bg-transparent px-0.5 text-sm font-medium text-slate-100 outline-none ring-1 ring-emerald-500/40"
                            />
                        </Show>
                        <span class="shrink-0 text-[10px] text-slate-600">
                            in
                        </span>
                        <span class="truncate text-[11px] font-medium text-slate-400">
                            {props.projectName() ?? "Project"}
                        </span>
                    </div>
                    <Show when={props.workingDir()}>
                        <div class="mt-0.5 flex items-center gap-1.5">
                            <FolderOpen
                                class="size-3 shrink-0 text-slate-600"
                                stroke-width={1.5}
                                aria-hidden
                            />
                            <span class="min-w-0 truncate font-mono text-[10px] text-slate-600">
                                {props.workingDir()}
                            </span>
                        </div>
                    </Show>
                </div>
                <div class="flex shrink-0 items-center gap-1">
                    <button
                        type="button"
                        class="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-slate-500 transition-colors hover:bg-slate-800/40 hover:text-slate-300"
                        onClick={props.onToggleTerminal}
                    >
                        <Show
                            when={props.terminalOpen()}
                            fallback={
                                <PanelBottomDashed
                                    class="size-3.5"
                                    stroke-width={1.5}
                                    aria-hidden
                                />
                            }
                        >
                            <PanelBottom
                                class="size-3.5"
                                stroke-width={1.5}
                                aria-hidden
                            />
                        </Show>
                        Terminal
                        <Kbd combo={props.formatKey("toggle_terminal")} />
                    </button>
                    <button
                        type="button"
                        class="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-slate-500 transition-colors hover:bg-slate-800/40 hover:text-slate-300"
                        onClick={props.onToggleSidebar}
                    >
                        <Show
                            when={props.sidebarOpen()}
                            fallback={
                                <PanelRightDashed
                                    class="size-3.5"
                                    stroke-width={1.5}
                                    aria-hidden
                                />
                            }
                        >
                            <PanelRight
                                class="size-3.5"
                                stroke-width={1.5}
                                aria-hidden
                            />
                        </Show>
                        Git
                        <Kbd combo={props.formatKey("toggle_sidebar")} />
                    </button>
                    <A
                        href={props.threadSettingsHref}
                        class="inline-flex cursor-pointer items-center rounded-md px-2 py-1 text-slate-500 transition-colors hover:bg-slate-800/40 hover:text-slate-300"
                        title="Thread settings"
                        aria-label="Thread settings"
                    >
                        <Settings
                            class="size-3.5"
                            stroke-width={2}
                            aria-hidden
                        />
                    </A>
                    <button
                        type="button"
                        class="inline-flex cursor-pointer items-center rounded-md px-2 py-1 text-slate-500 transition-colors hover:bg-red-950/35 hover:text-red-300"
                        onClick={() => setDeleteOpen(true)}
                        title="Delete thread"
                        aria-label="Delete thread"
                    >
                        <Trash2
                            class="size-3.5"
                            stroke-width={2}
                            aria-hidden
                        />
                    </button>
                </div>
            </header>

            <Dialog open={deleteOpen()} onEscapeKeyDown={closeDeleteModal}>
                <DialogOverlay onClick={closeDeleteModal} />
                <DialogContent
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-thread-title"
                >
                    <DialogTitle id="delete-thread-title">
                        Delete this thread?
                    </DialogTitle>
                    <p class="mb-4 text-sm text-slate-400">
                        This removes the thread and its messages from Moondust.
                        This cannot be undone.
                    </p>
                    <Show when={props.hasWorktree()}>
                        <label class="mb-4 flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-800/50 bg-slate-900/35 px-3 py-2.5">
                            <input
                                type="checkbox"
                                class="mt-0.5 size-3.5 shrink-0 rounded border-slate-600 bg-slate-900 accent-red-600"
                                checked={removeWorktree()}
                                onChange={(e) =>
                                    setRemoveWorktree(e.currentTarget.checked)
                                }
                            />
                            <span class="text-xs leading-snug text-slate-300">
                                <span class="font-medium text-slate-200">
                                    Delete git worktree
                                </span>
                                <span class="mt-0.5 block text-slate-500">
                                    Remove the linked worktree directory from
                                    disk (recommended).
                                </span>
                            </span>
                        </label>
                    </Show>
                    <Show when={deleteError()}>
                        <p class="mb-3 text-xs text-red-400">{deleteError()}</p>
                    </Show>
                    <div class="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={deleting()}
                            onClick={closeDeleteModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            ref={(el) => {
                                confirmButtonEl = el;
                            }}
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={deleting()}
                            onClick={() => void confirmDelete()}
                        >
                            {deleting() ? "Deleting…" : "Delete thread"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
