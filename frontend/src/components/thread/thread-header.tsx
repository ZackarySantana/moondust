import FolderOpen from "lucide-solid/icons/folder-open";
import PanelBottom from "lucide-solid/icons/panel-bottom";
import PanelBottomDashed from "lucide-solid/icons/panel-bottom-dashed";
import PanelRight from "lucide-solid/icons/panel-right";
import PanelRightDashed from "lucide-solid/icons/panel-right-dashed";
import type { Component } from "solid-js";
import { Show } from "solid-js";
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
}> = (props) => {
    return (
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
                    <span class="shrink-0 text-[10px] text-slate-600">in</span>
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
            </div>
        </header>
    );
};
