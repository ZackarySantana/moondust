import { A } from "@solidjs/router";
import { createMemo, createSignal, Show, type Component } from "solid-js";
import type { SidebarStreamSnapshot } from "@/lib/chat-stream-sidebar-store";
import {
    sidebarStreams,
    truncateSidebarPreview,
} from "@/lib/chat-stream-sidebar-store";
import { cn } from "@/lib/utils";

function streamDotClass(s: SidebarStreamSnapshot | undefined): string {
    if (!s) return "";
    switch (s.phase) {
        case "thinking":
            return "bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.45)] animate-pulse";
        case "responding":
            return "bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.4)] animate-pulse";
        case "done":
            return "bg-emerald-500/90 shadow-[0_0_5px_rgba(16,185,129,0.35)]";
        default:
            return "";
    }
}

function streamDotTitle(s: SidebarStreamSnapshot | undefined): string {
    if (!s) return "";
    switch (s.phase) {
        case "thinking":
            return "Thinking";
        case "responding":
            return "Streaming reply";
        case "done":
            return "Reply ready";
        default:
            return "";
    }
}

export const ProjectThread: Component<{
    projectID: string;
    threadID: string;
    onRenameThread: (threadId: string, title: string) => void | Promise<void>;
    name: string;
    time?: string;
    active?: boolean;
    shortcutHint?: string;
}> = (props) => {
    const [editing, setEditing] = createSignal(false);
    const [draft, setDraft] = createSignal("");
    let inputRef!: HTMLInputElement;

    const streamSnap = createMemo(() => {
        return sidebarStreams[props.threadID] as
            | SidebarStreamSnapshot
            | undefined;
    });

    function startEditing(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        setDraft(props.name);
        setEditing(true);
        requestAnimationFrame(() => {
            inputRef?.focus();
            inputRef?.select();
        });
    }

    async function commit() {
        const trimmed = draft().trim();
        setEditing(false);
        if (trimmed && trimmed !== props.name) {
            await props.onRenameThread(props.threadID, trimmed);
        }
    }

    function onKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            void commit();
        } else if (e.key === "Escape") {
            e.preventDefault();
            setEditing(false);
        }
    }

    const showStreamPreview = createMemo(() => {
        const s = streamSnap();
        if (!s || s.phase === "done") return false;
        const hasTool = (s.responseChunks ?? []).some((c) => c.kind === "tool");
        return (
            s.reasoningFull.length > 0 || s.responseFull.length > 0 || hasTool
        );
    });

    /** Boolean must be passed to `<Show when={…}>` (not a Memo function), or `when` is always truthy and crashes. */
    const hasStreamIndicator = createMemo(() => streamSnap() != null);

    return (
        <A
            href={`/project/${props.projectID}/thread/${props.threadID}`}
            class={cn(
                "group/thread flex w-full flex-col rounded-md px-2 py-1.5 text-left text-xs transition-colors duration-100",
                props.active
                    ? "bg-slate-800/55 text-slate-200"
                    : "text-slate-500 hover:bg-slate-800/40 hover:text-slate-300",
            )}
            onDblClick={startEditing}
        >
            <div class="flex items-start gap-2">
                <Show when={hasStreamIndicator()}>
                    <span
                        class={cn(
                            "mt-1.5 size-1.5 shrink-0 rounded-full",
                            streamDotClass(streamSnap()),
                        )}
                        title={streamDotTitle(streamSnap())}
                        aria-hidden
                    />
                </Show>
                <div class="min-w-0 flex-1">
                    <Show
                        when={editing()}
                        fallback={
                            <>
                                <div class="flex min-w-0 items-baseline justify-between gap-2">
                                    <div class="flex min-w-0 items-baseline gap-1.5">
                                        <span class="min-w-0 truncate">
                                            {props.name}
                                        </span>
                                        {props.shortcutHint && (
                                            <kbd class="pointer-events-none shrink-0 rounded border border-slate-700/50 bg-slate-800/40 px-1 py-0.5 font-mono text-[9px] leading-none text-slate-500 opacity-0 transition-opacity group-hover/thread:opacity-100">
                                                {props.shortcutHint}
                                            </kbd>
                                        )}
                                    </div>
                                    {props.time && (
                                        <span class="shrink-0 text-[10px] tabular-nums text-slate-600">
                                            {props.time}
                                        </span>
                                    )}
                                </div>
                                <Show when={showStreamPreview()}>
                                    <div
                                        class="mt-0.5 space-y-0.5 border-l border-slate-700/20 pl-2"
                                        aria-live="polite"
                                    >
                                        <Show
                                            when={
                                                (streamSnap()?.reasoningFull
                                                    ?.length ?? 0) > 0
                                            }
                                        >
                                            <p class="line-clamp-1 text-[9px] leading-snug text-slate-500/85">
                                                {truncateSidebarPreview(
                                                    streamSnap()!.reasoningFull,
                                                )}
                                            </p>
                                        </Show>
                                        <Show
                                            when={
                                                (streamSnap()?.responseFull
                                                    ?.length ?? 0) > 0
                                            }
                                        >
                                            <p class="line-clamp-1 text-[9px] leading-snug text-slate-500/85">
                                                {truncateSidebarPreview(
                                                    streamSnap()!.responseFull,
                                                )}
                                            </p>
                                        </Show>
                                    </div>
                                </Show>
                            </>
                        }
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={draft()}
                            onInput={(e) => setDraft(e.currentTarget.value)}
                            onBlur={() => void commit()}
                            onKeyDown={onKeyDown}
                            onClick={(e) => e.preventDefault()}
                            class="w-full truncate rounded bg-transparent px-0.5 text-xs text-slate-200 outline-none ring-1 ring-emerald-500/40"
                        />
                    </Show>
                </div>
            </div>
        </A>
    );
};
