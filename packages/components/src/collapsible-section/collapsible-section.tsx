import ChevronRight from "lucide-solid/icons/chevron-right";
import type { JSX, ParentComponent } from "solid-js";
import { createSignal, Show } from "solid-js";
import { cn } from "../utils";

export type SectionTone = "emerald" | "amber" | "sky" | "violet" | "slate";

const TONE_BORDER: Record<SectionTone, string> = {
    emerald: "border-l-emerald-500",
    amber: "border-l-amber-500",
    sky: "border-l-sky-500",
    violet: "border-l-violet-500",
    slate: "border-l-slate-600",
};

const TONE_BADGE: Record<SectionTone, string> = {
    emerald: "bg-emerald-900/30 text-emerald-300",
    amber: "bg-amber-900/30 text-amber-300",
    sky: "bg-sky-900/30 text-sky-300",
    violet: "bg-violet-900/30 text-violet-300",
    slate: "bg-slate-800/60 text-slate-400",
};

export interface CollapsibleSectionProps {
    title: string;
    count: number;
    tone: SectionTone;
    defaultOpen?: boolean;
    trailing?: JSX.Element;
}

export const CollapsibleSection: ParentComponent<CollapsibleSectionProps> = (
    props,
) => {
    const [open, setOpen] = createSignal(props.defaultOpen ?? props.count > 0);
    return (
        <div class={cn("rounded-r border-l-2", TONE_BORDER[props.tone])}>
            <div class="relative">
                <button
                    type="button"
                    class="absolute inset-0 z-0 cursor-pointer transition-colors hover:bg-slate-800/30 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-slate-500"
                    onClick={() => setOpen((o) => !o)}
                    aria-expanded={open()}
                    aria-label={`Toggle ${props.title}`}
                />
                <div class="pointer-events-none relative z-10 flex w-full items-center gap-1 px-2.5 py-1.5">
                    <ChevronRight
                        class={cn(
                            "size-3 shrink-0 text-slate-500 transition-transform duration-150",
                            open() && "rotate-90",
                        )}
                        stroke-width={2}
                        aria-hidden
                    />
                    <span class="min-w-0 flex-1 text-[11px] font-medium text-slate-300">
                        {props.title}
                    </span>
                    <Show when={props.trailing}>
                        <div class="pointer-events-auto flex shrink-0 items-center gap-0.5">
                            {props.trailing}
                        </div>
                    </Show>
                    <span
                        class={cn(
                            "shrink-0 rounded px-1.5 py-0.5 text-[10px] leading-none",
                            TONE_BADGE[props.tone],
                        )}
                    >
                        {props.count}
                    </span>
                </div>
            </div>
            <Show when={open()}>
                <div class="px-2.5 pb-2 pt-1">{props.children}</div>
            </Show>
        </div>
    );
};
