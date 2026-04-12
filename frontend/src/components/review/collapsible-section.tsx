import type { JSX, ParentComponent } from "solid-js";
import { createSignal, Show } from "solid-js";

export type SectionTone = "emerald" | "amber" | "sky" | "violet" | "slate";

const toneAccentMap: Record<SectionTone, string> = {
    emerald: "border-l-emerald-500",
    amber: "border-l-amber-500",
    sky: "border-l-sky-500",
    violet: "border-l-violet-500",
    slate: "border-l-slate-600",
};

const toneBadgeMap: Record<SectionTone, string> = {
    emerald: "bg-emerald-900/30 text-emerald-300",
    amber: "bg-amber-900/30 text-amber-300",
    sky: "bg-sky-900/30 text-sky-300",
    violet: "bg-violet-900/30 text-violet-300",
    slate: "bg-slate-800/60 text-slate-400",
};

export const CollapsibleSection: ParentComponent<{
    title: string;
    count: number;
    tone: SectionTone;
    defaultOpen?: boolean;
    trailing?: JSX.Element;
}> = (props) => {
    const [open, setOpen] = createSignal(props.defaultOpen ?? props.count > 0);
    return (
        <div class={`border-l-2 ${toneAccentMap[props.tone]} rounded-r`}>
            <div class="flex w-full items-center gap-1 px-2.5 py-1.5">
                <button
                    type="button"
                    class="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 text-left transition-colors hover:bg-slate-800/30"
                    onClick={() => setOpen((o) => !o)}
                >
                    <svg
                        class={`h-3 w-3 shrink-0 text-slate-500 transition-transform ${open() ? "rotate-90" : ""}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                            clip-rule="evenodd"
                        />
                    </svg>
                    <span class="min-w-0 flex-1 text-[11px] font-medium text-slate-300">
                        {props.title}
                    </span>
                </button>
                <Show when={props.trailing}>
                    <div class="flex shrink-0 items-center gap-0.5">
                        {props.trailing}
                    </div>
                </Show>
                <span
                    class={`shrink-0 rounded px-1.5 py-0.5 text-[10px] leading-none ${toneBadgeMap[props.tone]}`}
                >
                    {props.count}
                </span>
            </div>
            <Show when={open()}>
                <div class="px-2.5 pb-2 pt-1">{props.children}</div>
            </Show>
        </div>
    );
};
