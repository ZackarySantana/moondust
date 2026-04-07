import { A } from "@solidjs/router";
import ArrowUpDown from "lucide-solid/icons/arrow-up-down";
import ChevronRight from "lucide-solid/icons/chevron-right";
import MessageSquarePlus from "lucide-solid/icons/message-square-plus";
import Plus from "lucide-solid/icons/plus";
import Search from "lucide-solid/icons/search";
import Settings from "lucide-solid/icons/settings";
import { For, Show, type Component } from "solid-js";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { store } from "@wails/go/models";

export interface AppSidebarProps {
    onNewProject: () => void;
    projects: store.Project[];
    class?: string;
}

export const AppSidebar: Component<AppSidebarProps> = (props) => {
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
                <div class="flex items-center gap-0.5">
                    <Button
                        variant="icon"
                        size="icon"
                        aria-label="Sort projects"
                    >
                        <ArrowUpDown
                            class="size-3.5"
                            stroke-width={2}
                            aria-hidden
                        />
                    </Button>
                    <Button
                        variant="icon"
                        size="icon"
                        aria-label="Search projects"
                    >
                        <Search
                            class="size-3.5"
                            stroke-width={2}
                            aria-hidden
                        />
                    </Button>
                </div>
            </header>

            {/* ── Quick actions ── */}
            <div class="px-2 pb-1">
                <button
                    type="button"
                    class="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-slate-400 transition-colors duration-100 hover:bg-slate-800/40 hover:text-slate-200 active:bg-slate-800/60"
                >
                    <MessageSquarePlus
                        class="size-4 shrink-0 text-slate-500"
                        stroke-width={1.75}
                        aria-hidden
                    />
                    New Thread
                </button>
            </div>

            <div class="px-5 py-2">
                <Separator class="bg-slate-800/35" />
            </div>

            {/* ── Project list ── */}
            <div class="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-2">
                <div class="mb-1 flex items-center justify-between px-2.5">
                    <span class="text-[11px] font-semibold uppercase tracking-widest text-slate-600">
                        Projects
                    </span>
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
                <div class="flex flex-col gap-1">
                    <Show
                        when={props.projects.length > 0}
                        fallback={
                            <ProjectGroup name="Project">
                                <ProjectThread name="Active Thread" />
                            </ProjectGroup>
                        }
                    >
                        <For each={props.projects}>
                            {(p) => (
                                <ProjectGroup
                                    id={p.id}
                                    name={p.name}
                                    title={p.directory}
                                >
                                    <ProjectThread name="Active Thread" />
                                </ProjectGroup>
                            )}
                        </For>
                    </Show>
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
                    <Settings
                        class="size-4 shrink-0"
                        stroke-width={1.75}
                    />
                    Settings
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
                    <A
                        href={`/project/${props.id}/settings`}
                        class="shrink-0 rounded-md p-1 text-slate-600 opacity-0 transition-all duration-100 hover:bg-slate-800/50 hover:text-slate-300 group-hover/project:opacity-100"
                        aria-label={`${props.name} settings`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Settings
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

const ProjectThread: Component<{ name: string }> = (props) => {
    return (
        <button
            type="button"
            class="w-full rounded-md px-2 py-1.5 text-left text-xs text-slate-500 transition-colors duration-100 hover:bg-slate-800/40 hover:text-slate-300"
        >
            {props.name}
        </button>
    );
};
