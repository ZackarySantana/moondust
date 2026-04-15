import type { AssistantPart } from "@/lib/chat/types";
import type { store } from "@wails/go/models";

/**
 * Maps a persisted assistant message (Claude Code CLI metadata) to parts: tool rows from
 * `metadata.claude.tool_calls`, then the final assistant text in `msg.content`.
 */
export function claudePersistedAssistantParts(
    msg: store.ChatMessage,
): AssistantPart[] {
    const cl = msg.metadata?.claude;
    const parts: AssistantPart[] = [];

    const tools = cl?.tool_calls?.filter((t) => (t.name ?? "").trim()) ?? [];
    for (const tc of tools) {
        parts.push({ kind: "tool", tool: tc });
    }

    const content = (msg.content ?? "").trim();
    if (content.length > 0) {
        parts.push({ kind: "text", text: msg.content });
    }

    return parts;
}
