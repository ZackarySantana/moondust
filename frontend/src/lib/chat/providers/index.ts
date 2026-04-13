import type { AssistantPart, StreamingAssistantArgs } from "@/lib/chat/types";
import { streamPartsFromSnapshot } from "@/lib/chat/streaming";
import { plainPersistedAssistantParts } from "@/lib/chat/providers/defaults";
import { openRouterPersistedAssistantParts } from "@/lib/chat/providers/openrouter";
import type { store } from "@wails/go/models";

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

export function getChatFormatter(
    providerId: string | undefined,
): ChatProviderFormatter {
    const id = (providerId ?? "openrouter").toLowerCase();
    if (id === "openrouter") return openRouterFormatter;
    return defaultFormatter;
}

export function streamingAssistantParts(
    providerId: string | undefined,
    args: StreamingAssistantArgs,
): AssistantPart[] {
    const f = getChatFormatter(providerId);
    return f.streamingParts?.(args) ?? streamPartsFromSnapshot(args);
}

export { openRouterPersistedAssistantParts, plainPersistedAssistantParts };
export { streamPartsFromSnapshot } from "@/lib/chat/streaming";
