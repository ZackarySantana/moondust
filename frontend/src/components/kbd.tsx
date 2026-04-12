import type { Component } from "solid-js";
import { Show } from "solid-js";

export const Kbd: Component<{ combo: string }> = (props) => (
    <Show when={props.combo}>
        <kbd class="ml-1 inline-flex items-center rounded border border-slate-700/50 bg-slate-800/40 px-1 py-0.5 font-mono text-[9px] leading-none text-slate-500">
            {props.combo}
        </kbd>
    </Show>
);
