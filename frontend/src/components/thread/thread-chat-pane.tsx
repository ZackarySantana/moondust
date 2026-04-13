import ArrowUp from "lucide-solid/icons/arrow-up";
import Bot from "lucide-solid/icons/bot";
import ChevronDown from "lucide-solid/icons/chevron-down";
import Loader2 from "lucide-solid/icons/loader-2";
import Sparkles from "lucide-solid/icons/sparkles";
import type { Component } from "solid-js";
import { createEffect, createSignal, For, on, Show } from "solid-js";
import { AssistantMessageMetadataButton } from "@/components/assistant-message-metadata";
import {
    AssistantReasoningPanel,
    AssistantReasoningToggleButton,
} from "@/components/thread/assistant-reasoning";
import { AssistantToolCallMessageRow } from "@/components/thread/assistant-tool-calls";
import { ChatMarkdown } from "@/components/chat-markdown";
import { ChatProviderBar } from "@/components/chat-provider-bar";
import {
    assistantAttributionLabel,
    type ChatProviderId,
    type ModelChoice,
} from "@/lib/chat-provider";
import type { StreamChunk } from "@/lib/chat-stream-sidebar-store";
import type { store } from "@wails/go/models";
import type { DiffTarget } from "./types";

const PersistedAssistantBubble: Component<{
    msg: store.ChatMessage;
    assistantLine: () => string | null;
}> = (props) => {
    const [reasoningExpanded, setReasoningExpanded] = createSignal(false);
    const reasoning = () =>
        props.msg.metadata?.openrouter?.reasoning?.trim() ?? "";
    const persistedSegments = () =>
        props.msg.metadata?.openrouter?.segments ?? [];
    const hasPersistedSegments = () => persistedSegments().length > 0;
    const legacyToolCalls = () =>
        props.msg.metadata?.openrouter?.tool_calls?.filter((t) =>
            (t.name ?? "").trim(),
        ) ?? [];
    const toolsForHeader = () => {
        const or = props.msg.metadata?.openrouter;
        if (!or) return [];
        if (or.segments?.length) {
            const out: store.OpenRouterToolCallRecord[] = [];
            for (const s of or.segments) {
                if (s.tool?.name?.trim()) {
                    out.push(s.tool);
                }
            }
            return out;
        }
        return legacyToolCalls();
    };

    return (
        <div class="flex min-w-0 max-w-[85%] flex-col gap-1">
            <Show
                when={
                    props.assistantLine() ||
                    reasoning() ||
                    toolsForHeader().length > 0
                }
            >
                <div class="flex min-w-0 items-center gap-2 pl-[34px]">
                    <Show
                        when={props.assistantLine()}
                        fallback={<span class="min-w-0 flex-1" />}
                    >
                        {(line) => (
                            <p class="min-w-0 flex-1 text-[10px] leading-tight text-slate-500">
                                {line()}
                            </p>
                        )}
                    </Show>
                    <Show when={reasoning()}>
                        <AssistantReasoningToggleButton
                            durationSec={null}
                            expanded={reasoningExpanded()}
                            onToggle={() =>
                                setReasoningExpanded(!reasoningExpanded())
                            }
                        />
                    </Show>
                    <Show
                        when={
                            props.assistantLine() || toolsForHeader().length > 0
                        }
                    >
                        <AssistantMessageMetadataButton msg={props.msg} />
                    </Show>
                </div>
            </Show>
            <Show when={reasoning() && reasoningExpanded()}>
                <AssistantReasoningPanel
                    reasoningText={reasoning()}
                    thinkingPhase={false}
                />
            </Show>
            <div class="flex gap-2.5 py-1">
                <div class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-slate-800/60">
                    <Bot
                        class="size-3.5 text-emerald-500/70"
                        stroke-width={1.5}
                    />
                </div>
                <div class="flex min-w-0 flex-1 flex-col gap-1 text-slate-300">
                    <Show when={hasPersistedSegments()}>
                        <For each={persistedSegments()}>
                            {(seg) => (
                                <div class="flex flex-col gap-1">
                                    <Show when={(seg.text ?? "").trim()}>
                                        <ChatMarkdown
                                            source={seg.text!}
                                            variant="assistant"
                                        />
                                    </Show>
                                    <Show when={seg.tool}>
                                        <AssistantToolCallMessageRow
                                            tc={seg.tool!}
                                        />
                                    </Show>
                                </div>
                            )}
                        </For>
                    </Show>
                    <Show when={!hasPersistedSegments()}>
                        <Show
                            when={legacyToolCalls().length > 0}
                            fallback={
                                <ChatMarkdown
                                    source={props.msg.content}
                                    variant="assistant"
                                />
                            }
                        >
                            <div class="flex flex-col gap-1">
                                <div class="flex flex-col gap-0.5">
                                    <For each={legacyToolCalls()}>
                                        {(tc) => (
                                            <AssistantToolCallMessageRow
                                                tc={tc}
                                            />
                                        )}
                                    </For>
                                </div>
                                <ChatMarkdown
                                    source={props.msg.content}
                                    variant="assistant"
                                />
                            </div>
                        </Show>
                    </Show>
                </div>
            </div>
        </div>
    );
};

export const ThreadChatPane: Component<{
    messages: () => store.ChatMessage[];
    diffTarget: () => DiffTarget | null;
    draft: () => string;
    setDraft: (v: string) => void;
    sendError: () => string;
    streaming: () => boolean;
    streamingText: () => string;
    streamingReasoningText: () => string;
    streamingThinkingDurationSec: () => number | null;
    streamingChunks: () => StreamChunk[];
    streamingAttribution: () => string | null;
    threadQueryData: () => store.Thread | undefined;
    modelChoices: () => ModelChoice[];
    canSend: () => boolean;
    onSubmit: () => void;
    sendMutationPending: boolean;
    chatProvider: () => ChatProviderId;
    chatModel: () => string;
    setProvider: (id: ChatProviderId) => void;
    setModel: (modelId: string) => void;
    showOpenRouterKeyHint: () => boolean;
    providerDisabled: () => boolean;
    modelDisabled: () => boolean;
    chatTextareaRef: (el: HTMLTextAreaElement) => void;
}> = (props) => {
    let messagesContainerRef!: HTMLDivElement;
    const [userAtBottom, setUserAtBottom] = createSignal(true);
    const [streamingReasoningExpanded, setStreamingReasoningExpanded] =
        createSignal(false);

    const hasStreamingTool = () =>
        props.streamingChunks().some((c) => c.kind === "tool");

    const streamingThinkingPhase = () =>
        props.streamingReasoningText().length > 0 &&
        props.streamingText().length === 0 &&
        !hasStreamingTool();

    /** Collapse the reasoning panel when the answer starts streaming (toggle re-opens). */
    createEffect(() => {
        if (!streamingThinkingPhase()) {
            setStreamingReasoningExpanded(false);
        }
    });

    const showStreamingReasoningToggle = () =>
        props.streamingReasoningText().length > 0 &&
        (props.streamingText().length > 0 || hasStreamingTool());

    const showStreamingReasoningPanel = () =>
        props.streamingReasoningText().length > 0 &&
        (streamingThinkingPhase() || streamingReasoningExpanded());

    const hasStreamingAssistantContent = () =>
        props.streamingText().trim().length > 0 || hasStreamingTool();

    createEffect(
        on(
            () =>
                [
                    props.draft(),
                    props.messages().length,
                    props.streamingText(),
                    props.streamingReasoningText(),
                    props.streamingThinkingDurationSec(),
                    props.streamingChunks(),
                ] as const,
            () => {
                if (userAtBottom() && messagesContainerRef) {
                    requestAnimationFrame(() => {
                        messagesContainerRef.scrollTop =
                            messagesContainerRef.scrollHeight;
                    });
                }
            },
        ),
    );

    createEffect(
        on(
            () => props.diffTarget(),
            (target, prev) => {
                if (target !== null) return;
                if (prev === undefined || prev === null) return;
                queueMicrotask(() => {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            const el = messagesContainerRef;
                            if (el) {
                                el.scrollTop = el.scrollHeight;
                                setUserAtBottom(true);
                            }
                        });
                    });
                });
            },
        ),
    );

    function scrollChatToBottom() {
        const el = messagesContainerRef;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
        setUserAtBottom(true);
    }

    return (
        <div class="relative flex min-h-0 flex-1 flex-col">
            <div class="relative min-h-0 flex-1">
                <div
                    ref={(el) => {
                        messagesContainerRef = el;
                        const onScroll = () => {
                            const atBottom =
                                el.scrollHeight -
                                    el.scrollTop -
                                    el.clientHeight <
                                32;
                            setUserAtBottom(atBottom);
                        };
                        el.addEventListener("scroll", onScroll, {
                            passive: true,
                        });
                        return () => el.removeEventListener("scroll", onScroll);
                    }}
                    class="h-full min-h-0 overflow-y-auto"
                >
                    <div class="mx-auto flex w-full max-w-3xl flex-col gap-1 px-4 py-4">
                        <Show
                            when={
                                props.messages().length > 0 || props.streaming()
                            }
                            fallback={
                                <div class="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                    <div class="rounded-xl border border-slate-800/40 bg-slate-900/30 p-3">
                                        <Sparkles
                                            class="size-6 text-emerald-500/60"
                                            stroke-width={1.5}
                                        />
                                    </div>
                                    <div>
                                        <p class="text-sm font-medium text-slate-300">
                                            Start a conversation
                                        </p>
                                        <p class="mt-1 text-xs text-slate-600">
                                            Send a message to begin working with
                                            the agent.
                                        </p>
                                    </div>
                                </div>
                            }
                        >
                            <For each={props.messages()}>
                                {(msg) => {
                                    const assistantLine = () => {
                                        if (msg.role !== "assistant")
                                            return null;
                                        return (
                                            assistantAttributionLabel(
                                                msg.chat_provider,
                                                msg.chat_model,
                                                props.modelChoices(),
                                            ) ??
                                            assistantAttributionLabel(
                                                props.threadQueryData()
                                                    ?.chat_provider,
                                                props.threadQueryData()
                                                    ?.chat_model,
                                                props.modelChoices(),
                                            )
                                        );
                                    };
                                    return (
                                        <div
                                            class={
                                                msg.role === "user"
                                                    ? "flex justify-end py-1"
                                                    : "flex justify-start py-1"
                                            }
                                        >
                                            <Show
                                                when={msg.role === "user"}
                                                fallback={
                                                    <PersistedAssistantBubble
                                                        msg={msg}
                                                        assistantLine={
                                                            assistantLine
                                                        }
                                                    />
                                                }
                                            >
                                                <div class="max-w-[80%] rounded-2xl rounded-br-md bg-emerald-800/30 px-3.5 py-2.5 text-slate-100">
                                                    <ChatMarkdown
                                                        source={msg.content}
                                                        variant="user"
                                                    />
                                                </div>
                                            </Show>
                                        </div>
                                    );
                                }}
                            </For>
                            <Show when={props.streaming()}>
                                <div class="flex justify-start py-1">
                                    <div class="flex min-w-0 max-w-[85%] flex-col gap-1">
                                        <Show
                                            when={
                                                props.streamingAttribution() ||
                                                props.streamingReasoningText()
                                                    .length > 0
                                            }
                                        >
                                            <div class="flex min-w-0 items-center gap-2 pl-[34px]">
                                                <Show
                                                    when={props.streamingAttribution()}
                                                    fallback={
                                                        <span class="min-w-0 flex-1" />
                                                    }
                                                >
                                                    {(line) => (
                                                        <p class="min-w-0 flex-1 text-[10px] leading-tight text-slate-500">
                                                            {line()}
                                                        </p>
                                                    )}
                                                </Show>
                                                <Show
                                                    when={showStreamingReasoningToggle()}
                                                >
                                                    <AssistantReasoningToggleButton
                                                        durationSec={props.streamingThinkingDurationSec()}
                                                        expanded={streamingReasoningExpanded()}
                                                        onToggle={() =>
                                                            setStreamingReasoningExpanded(
                                                                !streamingReasoningExpanded(),
                                                            )
                                                        }
                                                    />
                                                </Show>
                                            </div>
                                        </Show>
                                        <Show
                                            when={showStreamingReasoningPanel()}
                                        >
                                            <AssistantReasoningPanel
                                                reasoningText={props.streamingReasoningText()}
                                                thinkingPhase={streamingThinkingPhase()}
                                            />
                                        </Show>
                                        <div class="flex gap-2.5 py-1">
                                            <div class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-slate-800/60">
                                                <Bot
                                                    class="size-3.5 text-emerald-500/70"
                                                    stroke-width={1.5}
                                                />
                                            </div>
                                            <div class="flex min-w-0 flex-1 flex-col gap-1 text-slate-300">
                                                <Show
                                                    when={hasStreamingAssistantContent()}
                                                    fallback={
                                                        <div class="flex items-center gap-2 text-slate-500">
                                                            <Loader2
                                                                class="size-3.5 animate-spin"
                                                                stroke-width={2}
                                                                aria-hidden
                                                            />
                                                            <span class="text-xs">
                                                                {props.streamingReasoningText()
                                                                    .length > 0
                                                                    ? "Writing…"
                                                                    : "Thinking…"}
                                                            </span>
                                                        </div>
                                                    }
                                                >
                                                    <For
                                                        each={props.streamingChunks()}
                                                    >
                                                        {(chunk) =>
                                                            chunk.kind ===
                                                            "text" ? (
                                                                <Show
                                                                    when={chunk.text.trim()}
                                                                >
                                                                    <ChatMarkdown
                                                                        source={
                                                                            chunk.text
                                                                        }
                                                                        variant="assistant"
                                                                    />
                                                                </Show>
                                                            ) : (
                                                                <AssistantToolCallMessageRow
                                                                    tc={
                                                                        chunk.tool
                                                                    }
                                                                />
                                                            )
                                                        }
                                                    </For>
                                                </Show>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Show>
                        </Show>
                    </div>
                </div>
                <Show when={!userAtBottom()}>
                    <button
                        type="button"
                        class="pointer-events-auto absolute bottom-3 right-4 z-20 flex size-7 cursor-pointer items-center justify-center rounded-lg border border-slate-600/45 bg-slate-800/85 text-slate-400 shadow-md shadow-black/20 ring-1 ring-slate-900/40 backdrop-blur-xs transition-colors hover:border-emerald-800/50 hover:bg-slate-700/85 hover:text-emerald-300/90"
                        onClick={scrollChatToBottom}
                        title="Scroll to bottom"
                        aria-label="Scroll to bottom"
                    >
                        <ChevronDown
                            class="size-4"
                            stroke-width={2.5}
                            aria-hidden
                        />
                    </button>
                </Show>
            </div>

            <div class="shrink-0 border-t border-slate-800/40 px-4 py-3">
                <div class="mx-auto w-full max-w-3xl space-y-2">
                    <Show when={props.sendError()}>
                        {(msg) => (
                            <p class="text-xs text-red-400/90">{msg()}</p>
                        )}
                    </Show>
                    <div class="rounded-xl border border-slate-800/50 bg-slate-900/40 transition-colors focus-within:border-emerald-700/40">
                        <textarea
                            ref={(el) => {
                                props.chatTextareaRef(el);
                                const resize = () => {
                                    el.style.height = "auto";
                                    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                                };
                                createEffect(() => {
                                    props.draft();
                                    resize();
                                });
                            }}
                            rows={1}
                            class="max-h-40 min-h-[36px] w-full resize-none bg-transparent px-3.5 pt-3 pb-2 text-[13px] leading-relaxed text-slate-200 outline-none placeholder:text-slate-600"
                            placeholder="Send a message…"
                            value={props.draft()}
                            onInput={(e) =>
                                props.setDraft(e.currentTarget.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    props.onSubmit();
                                }
                            }}
                        />
                        <div class="flex flex-wrap items-center justify-between gap-2 px-2.5 pb-2">
                            <ChatProviderBar
                                provider={props.chatProvider()}
                                onProviderChange={props.setProvider}
                                model={props.chatModel()}
                                onModelChange={props.setModel}
                                modelChoices={props.modelChoices()}
                                showOpenRouterKeyHint={props.showOpenRouterKeyHint()}
                                providerDisabled={props.providerDisabled()}
                                modelDisabled={props.modelDisabled()}
                            />
                            <div class="flex shrink-0 items-center gap-2">
                                <kbd class="hidden items-center rounded border border-slate-700/50 bg-slate-800/40 px-1.5 py-0.5 font-mono text-[9px] leading-none text-slate-600 sm:inline-flex">
                                    Enter
                                </kbd>
                                <button
                                    type="button"
                                    class="flex size-7 cursor-pointer items-center justify-center rounded-lg bg-emerald-700/80 text-white transition-all duration-100 hover:bg-emerald-600/90 disabled:cursor-not-allowed disabled:opacity-30"
                                    disabled={!props.canSend()}
                                    onClick={props.onSubmit}
                                    aria-label="Send message"
                                >
                                    <Show
                                        when={
                                            !props.sendMutationPending &&
                                            !props.streaming()
                                        }
                                        fallback={
                                            <Loader2
                                                class="size-3.5 animate-spin"
                                                stroke-width={2}
                                                aria-hidden
                                            />
                                        }
                                    >
                                        <ArrowUp
                                            class="size-4"
                                            stroke-width={2.5}
                                            aria-hidden
                                        />
                                    </Show>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
