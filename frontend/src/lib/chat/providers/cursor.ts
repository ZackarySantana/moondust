import type { AssistantPart } from "@/lib/chat/types";
import type { store } from "@wails/go/models";

/**
 * Maps a persisted assistant message (Cursor metadata) to parts. When segments
 * are available (tool turns), uses them for execution-order interleaving;
 * otherwise falls back to tool_calls + content.
 */
export function cursorPersistedAssistantParts(
    msg: store.ChatMessage,
): AssistantPart[] {
    const cur = msg.metadata?.cursor;
    const segments = cur?.segments ?? [];

    if (segments.length > 0) {
        const parts: AssistantPart[] = [];
        for (const seg of segments) {
            if ((seg.text ?? "").trim()) {
                parts.push({ kind: "text", text: seg.text! });
            }
            if (seg.tool?.name?.trim()) {
                parts.push({ kind: "tool", tool: seg.tool });
            }
        }
        return parts;
    }

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
