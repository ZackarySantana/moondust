import type { QueryClient } from "@tanstack/solid-query";
import { createEffect, createSignal, on, onCleanup, onMount } from "solid-js";
import { queryKeys } from "@/lib/query-client";
import { EventsOn } from "@wails/runtime/runtime";

/**
 * Subscribes to Wails chat stream events for the active thread and exposes
 * streaming state for the assistant reply UI.
 */
export function useThreadChatStream(
    threadId: () => string,
    queryClient: QueryClient,
    onStreamError: (message: string) => void,
) {
    const [streaming, setStreaming] = createSignal(false);
    const [streamingText, setStreamingText] = createSignal("");

    createEffect(
        on(
            () => threadId(),
            (id, prev) => {
                if (prev !== undefined && prev !== id) {
                    setStreaming(false);
                    setStreamingText("");
                }
            },
        ),
    );

    onMount(() => {
        const unsubs: (() => void)[] = [];
        const tid = () => threadId();

        unsubs.push(
            EventsOn("chat:stream_start", (...args: unknown[]) => {
                const p = args[0] as { thread_id?: string };
                if (p?.thread_id !== tid()) return;
                setStreamingText("");
                setStreaming(true);
            }),
        );
        unsubs.push(
            EventsOn("chat:stream", (...args: unknown[]) => {
                const p = args[0] as { thread_id?: string; delta?: string };
                if (p?.thread_id !== tid()) return;
                const d = p.delta ?? "";
                if (!d) return;
                setStreamingText((prev) => prev + d);
            }),
        );
        unsubs.push(
            EventsOn("chat:stream_done", (...args: unknown[]) => {
                const p = args[0] as { thread_id?: string };
                const doneId = p?.thread_id;
                if (!doneId) return;
                void (async () => {
                    await queryClient.invalidateQueries({
                        queryKey: queryKeys.threads.messages(doneId),
                    });
                    if (tid() === doneId) {
                        setStreaming(false);
                        setStreamingText("");
                    }
                })();
            }),
        );
        unsubs.push(
            EventsOn("chat:stream_error", (...args: unknown[]) => {
                const p = args[0] as { thread_id?: string; error?: string };
                if (p?.thread_id !== tid()) return;
                setStreaming(false);
                setStreamingText("");
                onStreamError(p?.error?.trim() || "Assistant reply failed");
            }),
        );

        onCleanup(() => unsubs.forEach((u) => u()));
    });

    return { streaming, streamingText };
}
