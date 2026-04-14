import type { AssistantPart } from "@/lib/chat/types";
import type { store } from "@wails/go/models";

/**
 * Maps a persisted assistant message (Cursor metadata) to parts: tool rows from
 * `metadata.cursor.tool_calls`, then the final assistant text in `msg.content`.
 */
export function cursorPersistedAssistantParts(
    msg: store.ChatMessage,
): AssistantPart[] {
    const cur = msg.metadata?.cursor;
    const parts: AssistantPart[] = [];

    const tools = cur?.tool_calls?.filter((t) => (t.name ?? "").trim()) ?? [];
    for (const tc of tools) {
        parts.push({ kind: "tool", tool: tc });
    }

    const content = (msg.content ?? "").trim();
    if (content.length > 0) {
        parts.push({ kind: "text", text: msg.content });
    }

    return parts;
}
