import ChevronRight from "lucide-solid/icons/chevron-right";
import type { JSX, ParentComponent } from "solid-js";
import { createSignal, Show } from "solid-js";
import { cn } from "../utils";

export type SectionTone = "starlight" | "nebula" | "flare" | "void";

const TONE_BORDER: Record<SectionTone, string> = {
    starlight: "border-l-starlight-400",
    nebula: "border-l-nebula-400",
    flare: "border-l-flare-500",
    void: "border-l-void-600",
};

const TONE_BADGE: Record<SectionTone, string> = {
    starlight: "bg-starlight-400/15 text-starlight-200",
    nebula: "bg-nebula-400/20 text-nebula-200",
    flare: "bg-flare-500/15 text-flare-300",
    void: "bg-void-800 text-void-400",
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
        <div class={cn("rounded-none border-l-2", TONE_BORDER[props.tone])}>
            <div class="relative">
                <button
                    type="button"
                    class="absolute inset-0 z-0 cursor-pointer transition-colors duration-100 hover:bg-void-800/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-void-500"
                    onClick={() => setOpen((o) => !o)}
                    aria-expanded={open()}
                    aria-label={`Toggle ${props.title}`}
                />
                <div class="pointer-events-none relative z-10 flex w-full items-center gap-1 px-2.5 py-1.5">
                    <ChevronRight
                        class={cn(
                            "size-3 shrink-0 text-void-400 transition-transform duration-150",
                            open() && "rotate-90",
                        )}
                        stroke-width={2}
                        aria-hidden
                    />
                    <span class="min-w-0 flex-1 text-[11px] font-medium text-void-200">
                        {props.title}
                    </span>
                    <Show when={props.trailing}>
                        <div class="pointer-events-auto flex shrink-0 items-center gap-0.5">
                            {props.trailing}
                        </div>
                    </Show>
                    <span
                        class={cn(
                            "shrink-0 rounded-none px-1.5 py-0.5 font-mono text-[10px] leading-none tabular-nums",
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
