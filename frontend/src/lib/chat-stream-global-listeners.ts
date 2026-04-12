import { batch } from "solid-js";
import { EventsOn } from "@wails/runtime/runtime";
import { queryKeys, queryClient } from "@/lib/query-client";
import {
    clearSidebarDoneTimer,
    removeSidebarStream,
    scheduleSidebarStreamClear,
    setSidebarStreams,
    sidebarStreams,
} from "@/lib/chat-stream-sidebar-store";

function invalidateThreadMessages(threadId: string | undefined) {
    if (!threadId) return;
    void queryClient.invalidateQueries({
        queryKey: queryKeys.threads.messages(threadId),
    });
}

function invalidateOpenRouterUsageMetrics() {
    void queryClient.invalidateQueries({
        queryKey: queryKeys.openRouterUsageMetrics,
    });
}

/** First reasoning token time per thread (for “Thought for Xs”). */
const reasoningStartMsByThread = new Map<string, number>();

function clearReasoningStart(threadId: string) {
    reasoningStartMsByThread.delete(threadId);
}

/**
 * Single subscription to chat stream events: TanStack invalidation + live thread/sidebar state.
 * Call once for the app lifetime (see ChatStreamQuerySync).
 */
export function attachChatStreamGlobalListeners(): () => void {
    const unsubs: (() => void)[] = [];

    unsubs.push(
        EventsOn("chat:stream_start", (...args: unknown[]) => {
            const p = args[0] as { thread_id?: string };
            const id = p?.thread_id;
            if (!id) return;
            clearSidebarDoneTimer(id);
            clearReasoningStart(id);
            batch(() => {
                setSidebarStreams(id, {
                    phase: "thinking",
                    reasoningFull: "",
                    responseFull: "",
                    thinkingDurationSec: null,
                });
            });
        }),
    );

    unsubs.push(
        EventsOn("chat:stream", (...args: unknown[]) => {
            const p = args[0] as {
                thread_id?: string;
                delta?: string;
                reasoning_delta?: string;
            };
            const id = p?.thread_id;
            if (!id) return;
            const rd = p.reasoning_delta ?? "";
            const d = p.delta ?? "";
            if (!rd && !d) return;

            batch(() => {
                let cur = sidebarStreams[id];
                if (!cur) {
                    cur = {
                        phase: "thinking",
                        reasoningFull: "",
                        responseFull: "",
                        thinkingDurationSec: null,
                    };
                }
                if (rd && !reasoningStartMsByThread.has(id)) {
                    reasoningStartMsByThread.set(id, Date.now());
                }
                const reasoningFull = rd
                    ? cur.reasoningFull + rd
                    : cur.reasoningFull;
                const responseFull = d
                    ? cur.responseFull + d
                    : cur.responseFull;
                let thinkingDurationSec = cur.thinkingDurationSec;
                if (
                    d &&
                    thinkingDurationSec === null &&
                    reasoningStartMsByThread.has(id)
                ) {
                    thinkingDurationSec = Math.max(
                        1,
                        Math.round(
                            (Date.now() - reasoningStartMsByThread.get(id)!) /
                                1000,
                        ),
                    );
                }
                const phase =
                    responseFull.length > 0
                        ? ("responding" as const)
                        : reasoningFull.length > 0
                          ? ("thinking" as const)
                          : ("thinking" as const);

                setSidebarStreams(id, {
                    phase,
                    reasoningFull,
                    responseFull,
                    thinkingDurationSec,
                });
            });
        }),
    );

    unsubs.push(
        EventsOn("chat:stream_done", (...args: unknown[]) => {
            const p = args[0] as { thread_id?: string };
            const id = p?.thread_id;
            if (!id) return;
            invalidateThreadMessages(id);
            invalidateOpenRouterUsageMetrics();
            clearSidebarDoneTimer(id);
            clearReasoningStart(id);
            batch(() => {
                const cur = sidebarStreams[id];
                setSidebarStreams(id, {
                    phase: "done",
                    reasoningFull: cur?.reasoningFull ?? "",
                    responseFull: cur?.responseFull ?? "",
                    thinkingDurationSec: cur?.thinkingDurationSec ?? null,
                });
            });
            scheduleSidebarStreamClear(id, 2500);
        }),
    );

    unsubs.push(
        EventsOn("chat:stream_error", (...args: unknown[]) => {
            const p = args[0] as { thread_id?: string };
            const id = p?.thread_id;
            if (!id) return;
            invalidateThreadMessages(id);
            clearReasoningStart(id);
            removeSidebarStream(id);
        }),
    );

    return () => {
        unsubs.forEach((u) => u());
    };
}
