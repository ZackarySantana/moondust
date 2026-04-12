import { onCleanup, onMount } from "solid-js";
import { queryKeys, queryClient } from "@/lib/query-client";
import { EventsOn } from "@wails/runtime/runtime";

/**
 * Subscribes to assistant stream lifecycle events for the whole app lifetime.
 * When the thread page unmounts (e.g. user goes home mid-stream), the per-page
 * hook unsubscribes — without this, chat:stream_done never invalidates the
 * messages cache, so returning to the thread shows stale data and a broken UI.
 */
export function ChatStreamQuerySync() {
    onMount(() => {
        const unsubs: (() => void)[] = [];

        function invalidateThreadMessages(threadId: string | undefined) {
            if (!threadId) return;
            void queryClient.invalidateQueries({
                queryKey: queryKeys.threads.messages(threadId),
            });
        }

        unsubs.push(
            EventsOn("chat:stream_done", (...args: unknown[]) => {
                const p = args[0] as { thread_id?: string };
                invalidateThreadMessages(p?.thread_id);
            }),
        );
        unsubs.push(
            EventsOn("chat:stream_error", (...args: unknown[]) => {
                const p = args[0] as { thread_id?: string };
                invalidateThreadMessages(p?.thread_id);
            }),
        );

        onCleanup(() => unsubs.forEach((u) => u()));
    });

    return null;
}
