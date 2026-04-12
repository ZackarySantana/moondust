import type { Component } from "solid-js";
import { gitStatusColor } from "@/lib/git-display";

export const FileChangeRow: Component<{
    path: string;
    status: string;
    onClick?: (path: string, status: string) => void;
}> = (props) => {
    return (
        <button
            type="button"
            class="flex w-full cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-left transition-colors hover:bg-slate-800/40"
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
    );
};
