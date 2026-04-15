import type { AssistantPart, StreamingAssistantArgs } from "@/lib/chat/types";
import { streamPartsFromSnapshot } from "@/lib/chat/streaming";
import { plainPersistedAssistantParts } from "@/lib/chat/providers/defaults";
import { claudePersistedAssistantParts } from "@/lib/chat/providers/claude";
import { cursorPersistedAssistantParts } from "@/lib/chat/providers/cursor";
import { openRouterPersistedAssistantParts } from "@/lib/chat/providers/openrouter";
import type { ChatProviderId } from "@/lib/chat-provider";
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

const cursorFormatter: ChatProviderFormatter = {
    persistedAssistantParts: cursorPersistedAssistantParts,
};

const claudeFormatter: ChatProviderFormatter = {
    persistedAssistantParts: claudePersistedAssistantParts,
};

export function getChatFormatter(
    providerId: ChatProviderId,
): ChatProviderFormatter {
    if (providerId === "openrouter") return openRouterFormatter;
    if (providerId === "cursor") return cursorFormatter;
    if (providerId === "claude") return claudeFormatter;
    throw new Error(
        `invalid chat_provider for formatter: ${JSON.stringify(providerId)}`,
    );
}

export function streamingAssistantParts(
    providerId: ChatProviderId,
    args: StreamingAssistantArgs,
): AssistantPart[] {
    const f = getChatFormatter(providerId);
    return f.streamingParts?.(args) ?? streamPartsFromSnapshot(args);
}

export {
    claudePersistedAssistantParts,
    cursorPersistedAssistantParts,
    openRouterPersistedAssistantParts,
    plainPersistedAssistantParts,
};
export { streamPartsFromSnapshot } from "@/lib/chat/streaming";
