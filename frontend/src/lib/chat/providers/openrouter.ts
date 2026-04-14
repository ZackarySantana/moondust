import type { AssistantPart } from "@/lib/chat/types";
import type { store } from "@wails/go/models";

/**
 * Maps a persisted assistant message (OpenRouter metadata) to parts. Live streaming uses
 * `streamPartsFromSnapshot` from `@/lib/chat/streaming` unless a provider-specific
 * `streamingParts` override is registered.
 */
export function openRouterPersistedAssistantParts(
    msg: store.ChatMessage,
): AssistantPart[] {
    const or = msg.metadata?.openrouter;
    const parts: AssistantPart[] = [];

    const reasoning = (or?.reasoning ?? "").trim();
    if (reasoning.length > 0) {
        const rawDur = or?.reasoning_duration_sec;
        const durationSec =
            rawDur != null ? Math.max(1, Math.round(rawDur)) : null;
        parts.push({
            kind: "thought",
            text: reasoning,
            durationSec,
        });
    }

    const segments = or?.segments ?? [];
    if (segments.length > 0) {
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

    const legacyTools =
        or?.tool_calls?.filter((t) => (t.name ?? "").trim()) ?? [];
    for (const tc of legacyTools) {
        parts.push({ kind: "tool", tool: tc });
    }

    const content = (msg.content ?? "").trim();
    if (content.length > 0) {
        parts.push({ kind: "text", text: msg.content });
    }

    return parts;
}
