import Bot from "lucide-solid/icons/bot";
import ChevronDown from "lucide-solid/icons/chevron-down";
import ChevronRight from "lucide-solid/icons/chevron-right";
import Loader2 from "lucide-solid/icons/loader-2";
import Sparkles from "lucide-solid/icons/sparkles";
import type { Component } from "solid-js";
import { createEffect, createSignal, Show } from "solid-js";
import { Button } from "@/components/ui/button";
import { AssistantReasoningPanel } from "@/components/thread/assistant-reasoning";
import { AssistantToolCallMessageRow } from "@/components/thread/assistant-tool-calls";
import { ChatMarkdown } from "@/components/chat-markdown";
import type { AssistantPart } from "@/lib/chat/types";

const ThoughtPartBlock: Component<{
    part: Extract<AssistantPart, { kind: "thought" }>;
    collapseOnThinkingEnd: boolean;
}> = (props) => {
    const thinking = () => !!props.part.thinkingPhase;

    const [expanded, setExpanded] = createSignal(thinking());

    createEffect(() => {
        if (thinking()) {
            setExpanded(true);
        }
    });

    createEffect(() => {
        if (props.collapseOnThinkingEnd && !props.part.thinkingPhase) {
            setExpanded(false);
        }
    });

    const buttonLabel = () =>
        thinking()
            ? "Thinking"
            : props.part.durationSec != null
              ? `Thought for ${props.part.durationSec}s`
              : "Thought";

    return (
        <div class="flex min-w-0 flex-1 flex-col gap-1">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                class="h-7 w-fit shrink-0 gap-0.5 px-2 text-[10px] font-normal text-slate-500 hover:text-slate-400"
                aria-expanded={expanded()}
                aria-label={
                    expanded() ? "Hide thought details" : "Show thought details"
                }
                onClick={() => setExpanded(!expanded())}
            >
                <Show when={thinking()}>
                    <Loader2
                        class="size-3 shrink-0 animate-spin text-slate-500"
                        stroke-width={2}
                        aria-hidden
                    />
                </Show>
                <span>{buttonLabel()}</span>
                <Show
                    when={expanded()}
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
            <Show when={expanded()}>
                <div class="rounded-md border border-slate-700/35 bg-slate-900/40 px-2 pb-2 pt-1">
                    <AssistantReasoningPanel
                        reasoningText={props.part.text}
                        thinkingPhase={false}
                        variant="flat"
                    />
                </div>
            </Show>
        </div>
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
            <div class="flex w-full min-w-0 max-w-[85%] flex-col">
                <div class="flex gap-2.5 py-1">
                    <div class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-slate-800/50">
                        <Sparkles
                            class="size-3.5 text-slate-500/80"
                            stroke-width={1.5}
                            aria-hidden
                        />
                    </div>
                    <ThoughtPartBlock
                        part={p}
                        collapseOnThinkingEnd={props.streaming}
                    />
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
