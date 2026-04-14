import type { AssistantPart, StreamingAssistantArgs } from "@/lib/chat/types";
import { streamPartsFromSnapshot } from "@/lib/chat/streaming";
import { plainPersistedAssistantParts } from "@/lib/chat/providers/defaults";
import { cursorPersistedAssistantParts } from "@/lib/chat/providers/cursor";
import { openRouterPersistedAssistantParts } from "@/lib/chat/providers/openrouter";
import type { store } from "@wails/go/models";

/**
 * Maps stored messages and optional live stream snapshots to {@link AssistantPart[]}.
 * OpenRouter uses {@link streamPartsFromSnapshot} for streaming unless `streamingParts` is set.
 */
export type ChatProviderFormatter = {
    persistedAssistantParts: (msg: store.ChatMessage) => AssistantPart[];
    streamingParts?: (args: StreamingAssistantArgs) => AssistantPart[];
};

const openRouterFormatter: ChatProviderFormatter = {
    persistedAssistantParts: openRouterPersistedAssistantParts,
};

const defaultFormatter: ChatProviderFormatter = {
    persistedAssistantParts: plainPersistedAssistantParts,
};

const cursorFormatter: ChatProviderFormatter = {
    persistedAssistantParts: cursorPersistedAssistantParts,
};

export function getChatFormatter(
    providerId: string | undefined,
): ChatProviderFormatter {
    const id = (providerId ?? "openrouter").toLowerCase();
    if (id === "openrouter") return openRouterFormatter;
    if (id === "cursor") return cursorFormatter;
    return defaultFormatter;
}

export function streamingAssistantParts(
    providerId: string | undefined,
    args: StreamingAssistantArgs,
): AssistantPart[] {
    const f = getChatFormatter(providerId);
    return f.streamingParts?.(args) ?? streamPartsFromSnapshot(args);
}

export {
    cursorPersistedAssistantParts,
    openRouterPersistedAssistantParts,
    plainPersistedAssistantParts,
};
export { streamPartsFromSnapshot } from "@/lib/chat/streaming";
