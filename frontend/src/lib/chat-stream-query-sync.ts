import { onCleanup, onMount } from "solid-js";
import { attachChatStreamGlobalListeners } from "@/lib/chat-stream-global-listeners";
import { attachQuickStreamListeners } from "@/lib/quick-stream-store";

/**
 * Subscribes to assistant stream events for the whole app lifetime: message cache
 * invalidation and per-thread sidebar previews (see chat-stream-global-listeners).
 */
export function ChatStreamQuerySync() {
    onMount(() => {
        const offChat = attachChatStreamGlobalListeners();
        const offQuick = attachQuickStreamListeners();
        onCleanup(() => { offChat(); offQuick(); });
    });

    return null;
}
