import type { Component } from "solid-js";
import { createEffect, createSignal, Show } from "solid-js";
import { AssistantToolCallMessageRow } from "@/components/thread/assistant-tool-calls";
import { CollapsibleGhostRow } from "@/components/thread/collapsible-ghost-row";
import { ChatMarkdown } from "@/components/chat-markdown";
import type { AssistantPart } from "@/lib/chat/types";

const ThoughtPartBlock: Component<{
    part: Extract<AssistantPart, { kind: "thought" }>;
    collapseOnThinkingEnd: boolean;
}> = (props) => {
    const thinking = () => !!props.part.thinkingPhase;
    const [expanded, setExpanded] = createSignal(false);

    createEffect(() => {
        if (props.collapseOnThinkingEnd && !props.part.thinkingPhase) {
            setExpanded(false);
        }
    });

    return (
        <CollapsibleGhostRow
            expanded={expanded()}
            onToggle={() => setExpanded(!expanded())}
            showBusy={thinking()}
            ariaLabelExpanded="Collapse thinking"
            ariaLabelCollapsed="Expand thinking"
            body={
                <div class="ml-1 border-l-2 border-slate-700/40 py-0.5 pl-3">
                    <pre class="max-h-52 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed text-slate-500 wrap-anywhere">
                        {props.part.text}
                    </pre>
                </div>
            }
        >
            <span>Thinking</span>
            <Show when={!thinking() && props.part.durationSec != null}>
                <span class="rounded-full bg-slate-800/70 px-1.5 py-px text-[10px] tabular-nums text-slate-500">
                    {props.part.durationSec}s
                </span>
            </Show>
        </CollapsibleGhostRow>
    );
};

const TextPartBlock: Component<{ text: string }> = (props) => (
    <Show when={props.text.trim()}>
        <ChatMarkdown
            source={props.text}
            variant="assistant"
        />
    </Show>
);

/** One assistant part as its own transcript row (thought / answer / tool). */
export const AssistantPartMessageRow: Component<{
    part: AssistantPart;
    streaming: boolean;
}> = (props) => {
    const p = props.part;

    if (p.kind === "thought") {
        return (
            <div class="w-full max-w-[85%]">
                <ThoughtPartBlock
                    part={p}
                    collapseOnThinkingEnd={props.streaming}
                />
            </div>
        );
    }
    if (p.kind === "text") {
        return (
            <div class="min-w-0 w-full max-w-[85%] text-slate-300">
                <TextPartBlock text={p.text} />
            </div>
        );
    }
    return (
        <div class="min-w-0 max-w-[85%]">
            <AssistantToolCallMessageRow
                tc={p.tool}
                streaming={props.streaming}
            />
        </div>
    );
};
