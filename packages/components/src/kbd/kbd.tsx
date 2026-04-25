import type { Component } from "solid-js";
import { Show, splitProps } from "solid-js";
import { cn } from "../utils";

export interface KbdProps {
    combo: string;
    class?: string;
}

export const Kbd: Component<KbdProps> = (props) => {
    const [local] = splitProps(props, ["combo", "class"]);
    return (
        <Show when={local.combo}>
            <kbd
                class={cn(
                    "ml-1 inline-flex items-center rounded border border-slate-700/50 bg-slate-800/40 px-1 py-0.5 font-mono text-[9px] leading-none text-slate-500",
                    local.class,
                )}
            >
                {local.combo}
            </kbd>
        </Show>
    );
};
