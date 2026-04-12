import { A } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import { createSignal, Show, type Component } from "solid-js";
import { RenameThread } from "@wails/go/app/App";
import { queryKeys } from "@/lib/query-client";
import { cn } from "@/lib/utils";

export const ProjectThread: Component<{
    projectID: string;
    threadID: string;
    name: string;
    time?: string;
    active?: boolean;
    shortcutHint?: string;
}> = (props) => {
    const queryClient = useQueryClient();
    const [editing, setEditing] = createSignal(false);
    const [draft, setDraft] = createSignal("");
    let inputRef!: HTMLInputElement;

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
            await RenameThread(props.threadID, trimmed);
            await queryClient.invalidateQueries({
                queryKey: queryKeys.threads.all,
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.threads.detail(props.threadID),
            });
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

    return (
        <A
            href={`/project/${props.projectID}/thread/${props.threadID}`}
            class={cn(
                "group/thread flex w-full items-baseline gap-1 rounded-md px-2 py-1.5 text-left text-xs transition-colors duration-100",
                props.active
                    ? "bg-slate-800/55 text-slate-200"
                    : "text-slate-500 hover:bg-slate-800/40 hover:text-slate-300",
            )}
            onDblClick={startEditing}
        >
            <Show
                when={editing()}
                fallback={
                    <div class="flex min-w-0 flex-1 items-baseline gap-1.5">
                        <span class="min-w-0 truncate">{props.name}</span>
                        {props.shortcutHint && (
                            <kbd class="pointer-events-none shrink-0 rounded border border-slate-700/50 bg-slate-800/40 px-1 py-0.5 font-mono text-[9px] leading-none text-slate-500 opacity-0 transition-opacity group-hover/thread:opacity-100">
                                {props.shortcutHint}
                            </kbd>
                        )}
                    </div>
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
                    class="min-w-0 flex-1 truncate rounded bg-transparent px-0.5 text-xs text-slate-200 outline-none ring-1 ring-emerald-500/40"
                />
            </Show>
            {!editing() && props.time && (
                <span class="shrink-0 text-[10px] tabular-nums text-slate-600">
                    {props.time}
                </span>
            )}
        </A>
    );
};
