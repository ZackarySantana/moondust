import Bot from "lucide-solid/icons/bot";
import Sparkles from "lucide-solid/icons/sparkles";
import type { Component } from "solid-js";
import { createEffect, createSignal, Show } from "solid-js";
import {
    AssistantReasoningPanel,
    AssistantReasoningToggleButton,
} from "@/components/thread/assistant-reasoning";
import { AssistantToolCallMessageRow } from "@/components/thread/assistant-tool-calls";
import { ChatMarkdown } from "@/components/chat-markdown";
import type { AssistantPart } from "@/lib/chat/types";

const ThoughtPartBlock: Component<{
    part: Extract<AssistantPart, { kind: "thought" }>;
    collapseOnThinkingEnd: boolean;
}> = (props) => {
    const [expanded, setExpanded] = createSignal(false);

    const thinking = () => !!props.part.thinkingPhase;

    createEffect(() => {
        if (props.collapseOnThinkingEnd && !props.part.thinkingPhase) {
            setExpanded(false);
        }
    });

    return (
        <Show
            when={thinking() && !props.part.text.trim()}
            fallback={
                <Show
                    when={thinking()}
                    fallback={
                        <div class="flex flex-col gap-1">
                            <div class="flex min-w-0 items-center gap-2">
                                <AssistantReasoningToggleButton
                                    durationSec={props.part.durationSec}
                                    expanded={expanded()}
                                    onToggle={() => setExpanded(!expanded())}
                                />
                            </div>
                            <Show when={expanded()}>
                                <AssistantReasoningPanel
                                    reasoningText={props.part.text}
                                    thinkingPhase={false}
                                    variant="flat"
                                />
                            </Show>
                        </div>
                    }
                >
                    <AssistantReasoningPanel
                        reasoningText={props.part.text}
                        thinkingPhase={true}
                        variant="flat"
                    />
                </Show>
            }
        >
            <AssistantReasoningPanel
                reasoningText=""
                thinkingPhase={true}
                variant="flat"
            />
        </Show>
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

const ToolPartBlock: Component<{
    tool: import("@/lib/chat/types").ChatToolPayload;
}> = (props) => <AssistantToolCallMessageRow tc={props.tool} />;

/** One assistant part as its own transcript row (thought / answer / tool). */
export const AssistantPartMessageRow: Component<{
    part: AssistantPart;
    streaming: boolean;
}> = (props) => {
    const p = props.part;
    if (p.kind === "thought") {
        return (
            <div class="flex min-w-0 w-full max-w-[85%] gap-2.5 py-1">
                <div class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/15">
                    <Sparkles
                        class="size-3.5 text-violet-400/75"
                        stroke-width={1.5}
                        aria-hidden
                    />
                </div>
                <div class="min-w-0 flex-1 overflow-hidden text-slate-300">
                    <div class="min-w-0 max-w-full rounded-2xl rounded-bl-md border border-violet-500/30 bg-violet-950/35 px-3.5 py-2.5 shadow-sm">
                        <ThoughtPartBlock
                            part={p}
                            collapseOnThinkingEnd={props.streaming}
                        />
                    </div>
                </div>
            </div>
        );
    }
    if (p.kind === "text") {
        return (
            <div class="flex min-w-0 w-full max-w-[85%] gap-2.5 py-1">
                <div class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-slate-800/60">
                    <Bot
                        class="size-3.5 text-emerald-500/70"
                        stroke-width={1.5}
                    />
                </div>
                <div class="min-w-0 flex-1 overflow-hidden text-slate-300">
                    <TextPartBlock text={p.text} />
                </div>
            </div>
        );
    }
    return (
        <div class="min-w-0 max-w-[85%] overflow-hidden">
            <ToolPartBlock tool={p.tool} />
        </div>
    );
};
