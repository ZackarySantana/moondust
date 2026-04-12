import ChevronDown from "lucide-solid/icons/chevron-down";
import ChevronRight from "lucide-solid/icons/chevron-right";
import Loader2 from "lucide-solid/icons/loader-2";
import type { Component } from "solid-js";
import { Show } from "solid-js";
import { Button } from "@/components/ui/button";

/** Ghost control shown to the right of the model line when reasoning can be toggled. */
export const AssistantReasoningToggleButton: Component<{
    durationSec: number | null;
    expanded: boolean;
    onToggle: () => void;
}> = (props) => {
    const label = () =>
        props.durationSec != null
            ? `Thought for ${props.durationSec}s`
            : "Thought";

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            class="h-7 shrink-0 gap-0.5 px-2 text-[10px] font-normal text-slate-500 hover:text-slate-400"
            aria-expanded={props.expanded}
            aria-label={
                props.expanded ? "Hide reasoning" : "Show reasoning"
            }
            onClick={() => props.onToggle()}
        >
            <span>{label()}</span>
            <Show
                when={props.expanded}
                fallback={
                    <ChevronRight
                        class="size-3 text-slate-500"
                        stroke-width={2}
                        aria-hidden
                    />
                }
            >
                <ChevronDown
                    class="size-3 text-slate-500"
                    stroke-width={2}
                    aria-hidden
                />
            </Show>
        </Button>
    );
};

/** Bordered reasoning body: optional “Thinking” strip while tokens are streaming only. */
export const AssistantReasoningPanel: Component<{
    reasoningText: string;
    thinkingPhase: boolean;
}> = (props) => (
    <div class="mb-1 rounded-md border border-slate-700/35 bg-slate-900/40 pl-[34px]">
        <Show when={props.thinkingPhase}>
            <div class="flex items-center gap-2 border-b border-slate-700/25 px-2 py-1.5">
                <Loader2
                    class="size-3.5 shrink-0 animate-spin text-slate-500"
                    stroke-width={2}
                    aria-hidden
                />
                <span class="text-[10px] font-medium text-slate-500">
                    Thinking
                </span>
            </div>
        </Show>
        <pre class="max-h-52 overflow-y-auto whitespace-pre-wrap px-2 py-2 text-[11px] leading-snug text-slate-500">
            {props.reasoningText}
        </pre>
    </div>
);
