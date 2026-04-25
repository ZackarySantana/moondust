import Loader2 from "lucide-solid/icons/loader-2";
import Minus from "lucide-solid/icons/minus";
import Plus from "lucide-solid/icons/plus";
import Undo2 from "lucide-solid/icons/undo-2";
import type { Component } from "solid-js";
import { Show } from "solid-js";
import { cn } from "../utils";

export type FileChangeContext = "staged" | "unstaged" | "untracked";

/**
 * Map a single-character Git status code to a Tailwind text-color class.
 * Mirrors the legacy `gitStatusColor` helper.
 */
function gitStatusColor(status: string): string {
    if (!status) return "text-slate-500";
    if (status === "untracked") return "text-sky-400";
    const ch = status[0]?.toUpperCase();
    switch (ch) {
        case "A":
        case "?":
            return "text-emerald-400";
        case "M":
            return "text-amber-400";
        case "D":
            return "text-red-400";
        case "R":
            return "text-violet-400";
        case "U":
            return "text-rose-400";
        default:
            return "text-slate-400";
    }
}

export interface FileChangeRowProps {
    path: string;
    status: string;
    context: FileChangeContext;
    disabled?: boolean;
    pendingPath?: string | null;
    onClick?: (path: string, status: string) => void;
    onStage?: (path: string) => void;
    onUnstage?: (path: string) => void;
    onDiscard?: (path: string) => void;
}

export const FileChangeRow: Component<FileChangeRowProps> = (props) => {
    const isPending = () => props.pendingPath === props.path;

    return (
        <div class="group flex w-full items-center gap-0.5 rounded px-1 py-0.5 transition-colors hover:bg-slate-800/40">
            <button
                type="button"
                class="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                onClick={() => props.onClick?.(props.path, props.status)}
            >
                <span
                    class={cn(
                        "w-4 shrink-0 text-center font-mono text-[10px] font-bold",
                        gitStatusColor(props.status),
                    )}
                >
                    {props.status === "untracked" ? "?" : props.status}
                </span>
                <span class="min-w-0 flex-1 truncate text-[11px] text-slate-300">
                    {props.path}
                </span>
            </button>

            <Show when={isPending()}>
                <Loader2
                    class="size-3 shrink-0 animate-spin text-slate-500"
                    stroke-width={2}
                    aria-hidden
                />
            </Show>

            <Show when={!isPending()}>
                <div class="flex shrink-0 items-center gap-px opacity-0 transition-opacity group-hover:opacity-100">
                    <Show when={props.context === "staged" && props.onUnstage}>
                        <button
                            type="button"
                            class="flex size-5 cursor-pointer items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-700/60 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-35"
                            title="Unstage file"
                            disabled={props.disabled}
                            onClick={(e) => {
                                e.stopPropagation();
                                props.onUnstage!(props.path);
                            }}
                        >
                            <Minus
                                class="size-3"
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
                            class="flex size-5 cursor-pointer items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-700/60 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-35"
                            title="Stage file"
                            disabled={props.disabled}
                            onClick={(e) => {
                                e.stopPropagation();
                                props.onStage!(props.path);
                            }}
                        >
                            <Plus
                                class="size-3"
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
                            class="flex size-5 cursor-pointer items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-700/60 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-35"
                            title="Discard changes"
                            disabled={props.disabled}
                            onClick={(e) => {
                                e.stopPropagation();
                                props.onDiscard!(props.path);
                            }}
                        >
                            <Undo2
                                class="size-3"
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
