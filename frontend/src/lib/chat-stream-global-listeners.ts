import { batch } from "solid-js";
import { EventsOn } from "@wails/runtime/runtime";
import { queryKeys, queryClient } from "@/lib/query-client";
import {
    clearSidebarDoneTimer,
    removeSidebarStream,
    scheduleSidebarStreamClear,
    setSidebarStreams,
    sidebarStreams,
    truncateSidebarPreview,
} from "@/lib/chat-stream-sidebar-store";

function invalidateThreadMessages(threadId: string | undefined) {
    if (!threadId) return;
    void queryClient.invalidateQueries({
        queryKey: queryKeys.threads.messages(threadId),
    });
}

/**
 * Single subscription to chat stream events: TanStack invalidation + sidebar previews.
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
            batch(() => {
                setSidebarStreams(id, {
                    phase: "thinking",
                    reasoning: "",
                    response: "",
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
                        reasoning: "",
                        response: "",
                    };
                }
                const reasoning = rd
                    ? truncateSidebarPreview(cur.reasoning + rd)
                    : cur.reasoning;
                const response = d
                    ? truncateSidebarPreview(cur.response + d)
                    : cur.response;
                const phase =
                    response.length > 0
                        ? ("responding" as const)
                        : reasoning.length > 0
                          ? ("thinking" as const)
                          : ("thinking" as const);

                setSidebarStreams(id, {
                    phase,
                    reasoning,
                    response,
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
            clearSidebarDoneTimer(id);
            batch(() => {
                const cur = sidebarStreams[id];
                setSidebarStreams(id, {
                    phase: "done",
                    reasoning: cur?.reasoning ?? "",
                    response: cur?.response ?? "",
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
            removeSidebarStream(id);
        }),
    );

    return () => {
        unsubs.forEach((u) => u());
    };
}
