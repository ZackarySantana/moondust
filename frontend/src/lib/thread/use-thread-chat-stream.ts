import { createMemo, onCleanup, onMount } from "solid-js";
import { sidebarStreams } from "@/lib/chat-stream-sidebar-store";
import { EventsOn } from "@wails/runtime/runtime";

/**
 * Live assistant stream state for the thread page. Backed by the same global store
 * as the sidebar (updated in chat-stream-global-listeners) so navigating away and
 * back while a reply is streaming still shows the in-progress text.
 */
export function useThreadChatStream(
    threadId: () => string,
    onStreamError: (message: string) => void,
) {
    onMount(() => {
        const tid = () => threadId();
        const unsub = EventsOn("chat:stream_error", (...args: unknown[]) => {
            const p = args[0] as { thread_id?: string; error?: string };
            if (p?.thread_id !== tid()) return;
            onStreamError(p?.error?.trim() || "Assistant reply failed");
        });
        onCleanup(() => unsub());
    });

    const streaming = createMemo(() => {
        const s = sidebarStreams[threadId()];
        return !!s && (s.phase === "thinking" || s.phase === "responding");
    });

    const streamingText = createMemo(
        () => sidebarStreams[threadId()]?.responseFull ?? "",
    );

    const streamingReasoningText = createMemo(
        () => sidebarStreams[threadId()]?.reasoningFull ?? "",
    );

    const streamingThinkingDurationSec = createMemo(
        () => sidebarStreams[threadId()]?.thinkingDurationSec ?? null,
    );

    return {
        streaming,
        streamingText,
        streamingReasoningText,
        streamingThinkingDurationSec,
    };
}
