import Loader2 from "lucide-solid/icons/loader-2";
import Minus from "lucide-solid/icons/minus";
import Plus from "lucide-solid/icons/plus";
import Undo2 from "lucide-solid/icons/undo-2";
import type { Component } from "solid-js";
import { Show } from "solid-js";
import { gitStatusColor } from "@/lib/git-display";

export type FileChangeContext = "staged" | "unstaged" | "untracked";

export const FileChangeRow: Component<{
    path: string;
    status: string;
    context: FileChangeContext;
    disabled?: boolean;
    pendingPath?: string | null;
    onClick?: (path: string, status: string) => void;
    onStage?: (path: string) => void;
    onUnstage?: (path: string) => void;
    onDiscard?: (path: string) => void;
}> = (props) => {
    const isPending = () => props.pendingPath === props.path;

    return (
        <div class="group flex w-full items-center gap-0.5 rounded px-1 py-0.5 transition-colors hover:bg-slate-800/40">
            <button
                type="button"
                class="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                onClick={() => props.onClick?.(props.path, props.status)}
            >
                <span
                    class={`w-4 shrink-0 text-center font-mono text-[10px] font-bold ${gitStatusColor(props.status)}`}
                >
                    {props.status === "untracked" ? "?" : props.status}
                </span>
                <span class="min-w-0 flex-1 truncate text-[11px] text-slate-300">
                    {props.path}
                </span>
            </button>

            <Show when={isPending()}>
                <Loader2
                    class="h-3 w-3 shrink-0 animate-spin text-slate-500"
                    stroke-width={2}
                    aria-hidden
                />
            </Show>

            <Show when={!isPending()}>
                <div class="flex shrink-0 items-center gap-px opacity-0 transition-opacity group-hover:opacity-100">
                    <Show when={props.context === "staged" && props.onUnstage}>
                        <button
                            type="button"
                            class="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-700/60 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-35"
                            title="Unstage file"
                            disabled={props.disabled}
                            onClick={(e) => {
                                e.stopPropagation();
                                props.onUnstage!(props.path);
                            }}
                        >
                            <Minus
                                class="h-3 w-3"
                                stroke-width={2}
                                aria-hidden
                            />
                        </button>
                    </Show>

                    <Show
                        when={
                            (props.context === "unstaged" ||
                                props.context === "untracked") &&
                            props.onStage
                        }
                    >
                        <button
                            type="button"
                            class="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-700/60 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-35"
                            title="Stage file"
                            disabled={props.disabled}
                            onClick={(e) => {
                                e.stopPropagation();
                                props.onStage!(props.path);
                            }}
                        >
                            <Plus
                                class="h-3 w-3"
                                stroke-width={2}
                                aria-hidden
                            />
                        </button>
                    </Show>

                    <Show
                        when={
                            props.context === "unstaged" && props.onDiscard
                        }
                    >
                        <button
                            type="button"
                            class="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-700/60 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-35"
                            title="Discard changes"
                            disabled={props.disabled}
                            onClick={(e) => {
                                e.stopPropagation();
                                props.onDiscard!(props.path);
                            }}
                        >
                            <Undo2
                                class="h-3 w-3"
                                stroke-width={2}
                                aria-hidden
                            />
                        </button>
                    </Show>
                </div>
            </Show>
        </div>
    );
};
