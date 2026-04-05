import ArrowUpDown from "lucide-solid/icons/arrow-up-down";
import Folder from "lucide-solid/icons/folder";
import Plus from "lucide-solid/icons/plus";
import Search from "lucide-solid/icons/search";
import Settings from "lucide-solid/icons/settings";
import type { Component } from "solid-js";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AppSidebarProps {
    onNewProject: () => void;
    class?: string;
}

export const AppSidebar: Component<AppSidebarProps> = (props) => {
    return (
        <aside
            class={cn(
                "flex w-64 shrink-0 flex-col border-r border-slate-700/80 bg-[rgb(24,31,42)]",
                props.class,
            )}
        >
            <header class="flex items-center gap-2 border-b border-slate-700/60 px-4 py-3">
                <h1 class="flex min-w-0 flex-1 items-center gap-2 truncate text-base font-semibold tracking-tight">
                    <Folder
                        class="size-4.5 shrink-0 text-slate-400"
                        stroke-width={2}
                        aria-hidden
                    />
                    <span class="truncate">Projects</span>
                </h1>
                <div class="flex shrink-0 items-center gap-0.5">
                    <Button
                        variant="icon"
                        size="icon"
                        aria-label="Sort projects"
                    >
                        <ArrowUpDown
                            class="size-4"
                            stroke-width={2}
                        />
                    </Button>
                    <Button
                        variant="icon"
                        size="icon"
                        aria-label="New project"
                        onClick={() => props.onNewProject()}
                    >
                        <Plus
                            class="size-4"
                            stroke-width={2}
                        />
                    </Button>
                    <Button
                        variant="icon"
                        size="icon"
                        aria-label="Search projects"
                    >
                        <Search
                            class="size-4"
                            stroke-width={2}
                        />
                    </Button>
                </div>
            </header>
            <div class="min-h-0 flex-1" />
            <footer class="mt-auto space-y-3 border-t border-slate-700/60 px-4 py-3">
                <Button
                    variant="ghost"
                    class="w-full justify-start px-2 py-2 text-left font-medium"
                >
                    <Settings
                        class="size-4 shrink-0"
                        stroke-width={2}
                    />
                    <span>Settings</span>
                </Button>
                <div class="space-y-1.5">
                    <div class="flex items-baseline gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        <span>Usage</span>
                        <span class="text-[10px] font-normal normal-case text-slate-600">
                            (40%)
                        </span>
                    </div>
                    <div
                        class="h-2 w-full overflow-hidden rounded-full bg-slate-700/90"
                        role="progressbar"
                        aria-valuenow={40}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div class="h-full w-[40%] rounded-full bg-sky-500/90" />
                    </div>
                </div>
            </footer>
        </aside>
    );
};
