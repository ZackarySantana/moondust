import { A, useLocation } from "@solidjs/router";
import Plus from "lucide-solid/icons/plus";
import SettingsIcon from "lucide-solid/icons/settings";
import {
    createMemo,
    createSignal,
    For,
    onCleanup,
    onMount,
    type Component,
} from "solid-js";
import { GetBuildLabel } from "@wails/go/app/App";
import { ProjectGroup } from "@/components/sidebar/project-group";
import { ProjectThread } from "@/components/sidebar/project-thread";
import { Kbd } from "@/components/kbd";
import { Separator } from "@/components/ui/separator";
import {
    globalThreadShortcutSlots,
    sortProjectsByLatestThread,
    sortThreadsForProject,
} from "@/lib/sidebar-thread-order";
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

export const AppSidebar: Component<AppSidebarProps> = (props) => {
    const location = useLocation();
    const { formatKey } = useShortcuts();

    const [tick, setTick] = createSignal(0);
    const timer = setInterval(() => setTick((t) => t + 1), 60_000);
    onCleanup(() => clearInterval(timer));

    const [buildLabel, setBuildLabel] = createSignal("");
    onMount(() => {
        void GetBuildLabel().then(setBuildLabel);
    });

    const sortedProjects = createMemo(() =>
        sortProjectsByLatestThread(props.projects, props.threads),
    );

    const shortcutSlotByThreadId = createMemo(() =>
        globalThreadShortcutSlots(props.projects, props.threads),
    );

    function sortedThreadsFor(projectId: string): store.Thread[] {
        return sortThreadsForProject(projectId, props.threads);
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
                                    {(thread) => {
                                        const slot =
                                            shortcutSlotByThreadId().get(
                                                thread.id,
                                            );
                                        return (
                                            <ProjectThread
                                                projectID={p.id}
                                                threadID={thread.id}
                                                name={
                                                    thread.title || "New thread"
                                                }
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
                                                    slot !== undefined
                                                        ? formatKey(
                                                              `go_thread_${slot + 1}`,
                                                          )
                                                        : undefined
                                                }
                                            />
                                        );
                                    }}
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

                <p
                    class="min-h-[14px] px-1 pt-1 text-left text-[10px] leading-snug text-slate-600 select-none"
                    aria-live="polite"
                >
                    {buildLabel()}
                </p>
            </footer>
        </aside>
    );
};
