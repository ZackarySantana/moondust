import { onCleanup, onMount } from "solid-js";
import { attachChatStreamGlobalListeners } from "@/lib/chat-stream-global-listeners";

/**
 * Subscribes to assistant stream events for the whole app lifetime: message cache
 * invalidation and per-thread sidebar previews (see chat-stream-global-listeners).
 */
export function ChatStreamQuerySync() {
    onMount(() => {
        const off = attachChatStreamGlobalListeners();
        onCleanup(off);
    });

    return null;
}
