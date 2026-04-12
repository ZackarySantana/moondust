import { A, useLocation } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import ChevronRight from "lucide-solid/icons/chevron-right";
import Plus from "lucide-solid/icons/plus";
import SettingsIcon from "lucide-solid/icons/settings";
import {
    createMemo,
    createSignal,
    For,
    onCleanup,
    Show,
    type Component,
} from "solid-js";
import { RenameThread } from "@wails/go/app/App";
import { Kbd } from "@/components/kbd";
import { Separator } from "@/components/ui/separator";
import { queryKeys } from "@/lib/query-client";
import { useShortcuts } from "@/lib/shortcut-context";
import { relativeTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { store } from "@wails/go/models";

export interface AppSidebarProps {
    onNewProject: () => void;
    onNewThread: (projectID: string) => void;
    projects: store.Project[];
    threads: store.Thread[];
    class?: string;
}

function threadTimestamp(t: store.Thread): number {
    const ua = t.updated_at;
    if (ua) {
        const d = typeof ua === "string" ? new Date(ua) : ua;
        if (d instanceof Date && !isNaN(d.getTime())) return d.getTime();
    }
    const ca = t.created_at;
    if (ca) {
        const d = typeof ca === "string" ? new Date(ca) : ca;
        if (d instanceof Date && !isNaN(d.getTime())) return d.getTime();
    }
    return 0;
}

export const AppSidebar: Component<AppSidebarProps> = (props) => {
    const location = useLocation();
    const { formatKey } = useShortcuts();

    const [tick, setTick] = createSignal(0);
    const timer = setInterval(() => setTick((t) => t + 1), 60_000);
    onCleanup(() => clearInterval(timer));

    const sortedProjects = createMemo(() => {
        const threads = props.threads;
        const latestByProject = new Map<string, number>();
        for (const t of threads) {
            const ts = threadTimestamp(t);
            const prev = latestByProject.get(t.project_id) ?? 0;
            if (ts > prev) latestByProject.set(t.project_id, ts);
        }
        return [...props.projects].sort((a, b) => {
            const ta = latestByProject.get(a.id) ?? 0;
            const tb = latestByProject.get(b.id) ?? 0;
            return tb - ta;
        });
    });

    function sortedThreadsFor(projectId: string): store.Thread[] {
        return props.threads
            .filter((t) => t.project_id === projectId)
            .sort((a, b) => threadTimestamp(b) - threadTimestamp(a));
    }

    return (
        <aside
            class={cn(
                "flex w-60 shrink-0 flex-col border-r border-slate-800/40 bg-app-panel",
                props.class,
            )}
        >
            {/* ── Header ── */}
            <header class="flex items-center justify-between px-3.5 py-3">
                <A
                    href="/"
                    end
                    class="text-sm font-semibold tracking-tight text-slate-200 hover:text-slate-100 transition-colors duration-100"
                >
                    Moondust
                </A>
                <div />
            </header>

            <div class="px-5 py-2">
                <Separator class="bg-slate-800/35" />
            </div>

            {/* ── Project list ── */}
            <div class="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-2">
                <div class="group/projects mb-1 flex items-center justify-between px-2.5">
                    <span class="text-[11px] font-semibold uppercase tracking-widest text-slate-600">
                        Projects
                    </span>
                    <div class="relative shrink-0">
                        <kbd class="pointer-events-none absolute right-full top-1/2 mr-1 -translate-y-1/2 rounded border border-slate-700/50 bg-slate-800/40 px-1 py-0.5 font-mono text-[9px] leading-none text-slate-500 opacity-0 transition-opacity group-hover/projects:opacity-100">
                            {formatKey("new_project")}
                        </kbd>
                        <button
                            type="button"
                            class="cursor-pointer rounded-md p-0.5 text-slate-600 transition-colors duration-100 hover:bg-slate-800/50 hover:text-slate-300"
                            aria-label="New project"
                            onClick={() => props.onNewProject()}
                        >
                            <Plus
                                class="size-3.5"
                                stroke-width={2}
                                aria-hidden
                            />
                        </button>
                    </div>
                </div>
                <div class="flex flex-col gap-1">
                    <For each={sortedProjects()}>
                        {(p) => (
                            <ProjectGroup
                                id={p.id}
                                name={p.name}
                                title={p.directory}
                                shortcutHint={formatKey("new_thread")}
                                onNewThread={() => props.onNewThread(p.id)}
                            >
                                <For each={sortedThreadsFor(p.id)}>
                                    {(thread, index) => (
                                        <ProjectThread
                                            projectID={p.id}
                                            threadID={thread.id}
                                            name={thread.title || "New thread"}
                                            time={
                                                (tick(),
                                                relativeTime(
                                                    thread.updated_at ||
                                                        thread.created_at,
                                                ))
                                            }
                                            active={
                                                location.pathname ===
                                                `/project/${p.id}/thread/${thread.id}`
                                            }
                                            shortcutHint={
                                                index() < 6
                                                    ? formatKey(
                                                          `go_thread_${index() + 1}`,
                                                      )
                                                    : undefined
                                            }
                                        />
                                    )}
                                </For>
                            </ProjectGroup>
                        )}
                    </For>
                </div>
            </div>

            {/* ── Footer ── */}
            <footer class="mt-auto border-t border-slate-800/35 px-3 py-3 space-y-3">
                <A
                    href="/settings"
                    class={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors duration-100",
                        "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200",
                    )}
                    activeClass="bg-slate-800/50 text-slate-200"
                    inactiveClass="text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                >
                    <SettingsIcon
                        class="size-4 shrink-0"
                        stroke-width={1.75}
                    />
                    Settings
                    <span class="ml-auto">
                        <Kbd combo={formatKey("open_settings")} />
                    </span>
                </A>

                <div class="space-y-1.5 px-1">
                    <div class="flex items-baseline justify-between">
                        <span class="text-[11px] font-medium text-slate-500">
                            Usage
                        </span>
                        <span class="text-[11px] tabular-nums text-slate-600">
                            40%
                        </span>
                    </div>
                    <div
                        class="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/60"
                        role="progressbar"
                        aria-valuenow={40}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div class="h-full w-[40%] rounded-full bg-linear-to-r from-emerald-700/80 to-emerald-500/70 transition-all duration-500" />
                    </div>
                </div>
            </footer>
        </aside>
    );
};

/* ── Extracted sub-components for readability ── */

const ProjectGroup: Component<{
    id?: string;
    name: string;
    title?: string;
    shortcutHint?: string;
    onNewThread?: () => void;
    children?: any;
}> = (props) => {
    return (
        <details
            class="group/project"
            open
        >
            <summary class="flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-slate-300 transition-colors duration-100 hover:bg-slate-800/30 [&::-webkit-details-marker]:hidden">
                <ChevronRight
                    class="size-3 shrink-0 text-slate-600 transition-transform duration-150 group-open/project:rotate-90"
                    stroke-width={2.5}
                    aria-hidden
                />
                <span
                    class="min-w-0 flex-1 truncate"
                    title={props.title}
                >
                    {props.name}
                </span>
                {props.id && (
                    <div class="relative shrink-0">
                        <kbd class="pointer-events-none absolute right-full top-1/2 mr-1 -translate-y-1/2 rounded border border-slate-700/50 bg-slate-800/40 px-1 py-0.5 font-mono text-[9px] leading-none text-slate-500 opacity-0 transition-opacity group-hover/project:opacity-100">
                            {props.shortcutHint}
                        </kbd>
                        <button
                            type="button"
                            class="rounded-md p-1 text-slate-600 opacity-0 transition-all duration-100 hover:bg-slate-800/50 hover:text-slate-300 group-hover/project:opacity-100"
                            aria-label={`New thread in ${props.name}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                props.onNewThread?.();
                            }}
                        >
                            <Plus
                                class="size-3.5"
                                stroke-width={2}
                                aria-hidden
                            />
                        </button>
                    </div>
                )}
                {props.id && (
                    <A
                        href={`/project/${props.id}/settings`}
                        class="shrink-0 rounded-md p-1 text-slate-600 opacity-0 transition-all duration-100 hover:bg-slate-800/50 hover:text-slate-300 group-hover/project:opacity-100"
                        aria-label={`${props.name} settings`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SettingsIcon
                            class="size-3.5"
                            stroke-width={2}
                            aria-hidden
                        />
                    </A>
                )}
            </summary>
            <div class="ml-[18px] border-l border-slate-800/30 pl-2 pt-0.5 pb-1">
                {props.children}
            </div>
        </details>
    );
};

const ProjectThread: Component<{
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
        <div class="group/thread relative w-full">
            {props.shortcutHint && (
                <kbd class="pointer-events-none absolute right-full top-1/2 mr-1 -translate-y-1/2 rounded border border-slate-700/50 bg-slate-800/40 px-1 py-0.5 font-mono text-[9px] leading-none text-slate-500 opacity-0 transition-opacity group-hover/thread:opacity-100">
                    {props.shortcutHint}
                </kbd>
            )}
            <A
                href={`/project/${props.projectID}/thread/${props.threadID}`}
                class={cn(
                    "flex w-full items-baseline gap-1 rounded-md px-2 py-1.5 text-left text-xs transition-colors duration-100",
                    props.active
                        ? "bg-slate-800/55 text-slate-200"
                        : "text-slate-500 hover:bg-slate-800/40 hover:text-slate-300",
                )}
                onDblClick={startEditing}
            >
                <Show
                    when={editing()}
                    fallback={
                        <span class="min-w-0 flex-1 truncate">
                            {props.name}
                        </span>
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
        </div>
    );
};
