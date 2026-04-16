import Loader2 from "lucide-solid/icons/loader-2";
import MessageCircleQuestion from "lucide-solid/icons/message-circle-question";
import Send from "lucide-solid/icons/send";
import X from "lucide-solid/icons/x";
import type { Component } from "solid-js";
import { createSignal, For, Show } from "solid-js";
import { ChatMarkdown } from "@/components/chat-markdown";
import { quickStreams, removeQuickStream } from "@/lib/quick-stream-store";
import { SendLaneMessage } from "@wails/go/app/App";
import type { store } from "@wails/go/models";

export const QuickQuestionPanel: Component<{
    threadId: string;
    open: boolean;
    onClose: () => void;
    laneMessages: () => store.ChatMessage[];
}> = (props) => {
    const [draft, setDraft] = createSignal("");
    const [sendError, setSendError] = createSignal("");
    const [sending, setSending] = createSignal(false);
    const quickState = () => quickStreams[props.threadId];
    const isStreaming = () => quickState()?.phase === "streaming";

    async function send() {
        const text = draft().trim();
        if (!text || sending() || isStreaming()) return;
        setSending(true);
        setSendError("");
        try {
            await SendLaneMessage(props.threadId, "quick", text);
            setDraft("");
        } catch (e) {
            setSendError(e instanceof Error ? e.message : String(e));
        } finally {
            setSending(false);
        }
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void send();
        }
    }

    function handleClose() {
        removeQuickStream(props.threadId);
        props.onClose();
    }

    return (
        <Show when={props.open}>
            <div class="flex h-full flex-col border-l border-slate-800/60 bg-slate-950/80">
                <div class="flex items-center gap-2 border-b border-slate-800/40 px-3 py-2">
                    <MessageCircleQuestion class="size-4 text-emerald-400/70" stroke-width={1.75} />
                    <span class="flex-1 text-xs font-medium text-slate-300">Quick Question</span>
                    <button
                        type="button"
                        onClick={handleClose}
                        class="rounded p-0.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
                    >
                        <X class="size-3.5" stroke-width={2} />
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto px-3 py-2 space-y-3">
                    <For each={props.laneMessages()}>
                        {(msg) => (
                            <div
                                class={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    class={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                                        msg.role === "user"
                                            ? "bg-emerald-600/20 text-emerald-200"
                                            : "bg-slate-800/50 text-slate-300"
                                    }`}
                                >
                                    <Show
                                        when={msg.role === "assistant"}
                                        fallback={<span>{msg.content}</span>}
                                    >
                                        <ChatMarkdown source={msg.content} class="text-xs" />
                                    </Show>
                                </div>
                            </div>
                        )}
                    </For>

                    <Show when={isStreaming()}>
                        <div class="flex justify-start">
                            <div class="max-w-[85%] rounded-lg bg-slate-800/50 px-3 py-2 text-xs leading-relaxed text-slate-300">
                                <Show
                                    when={quickState()!.responseFull.trim()}
                                    fallback={
                                        <span class="flex items-center gap-1.5 text-slate-500">
                                            <Loader2 class="size-3 animate-spin text-emerald-500/60" stroke-width={2} />
                                            Thinking...
                                        </span>
                                    }
                                >
                                    <ChatMarkdown source={quickState()!.responseFull} class="text-xs" />
                                </Show>
                            </div>
                        </div>
                    </Show>

                    <Show when={quickState()?.phase === "error"}>
                        <div class="rounded-lg bg-red-900/20 px-3 py-2 text-xs text-red-400">
                            {quickState()?.error ?? "Something went wrong"}
                        </div>
                    </Show>
                </div>

                <Show when={sendError()}>
                    <div class="px-3 pb-1 text-[10px] text-red-400">{sendError()}</div>
                </Show>

                <div class="border-t border-slate-800/40 p-2">
                    <div class="flex items-end gap-1.5 rounded-lg bg-slate-800/40 px-2.5 py-1.5">
                        <textarea
                            value={draft()}
                            onInput={(e) => setDraft(e.currentTarget.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a quick question..."
                            rows={1}
                            class="flex-1 resize-none bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-600"
                        />
                        <button
                            type="button"
                            onClick={() => void send()}
                            disabled={!draft().trim() || sending() || isStreaming()}
                            class="rounded p-1 text-slate-500 transition-colors hover:text-emerald-400 disabled:opacity-30"
                        >
                            <Show
                                when={!sending() && !isStreaming()}
                                fallback={<Loader2 class="size-3.5 animate-spin" stroke-width={2} />}
                            >
                                <Send class="size-3.5" stroke-width={2} />
                            </Show>
                        </button>
                    </div>
                </div>
            </div>
        </Show>
    );
};
