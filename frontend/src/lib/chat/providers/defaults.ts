import type { AssistantPart } from "@/lib/chat/types";
import type { store } from "@wails/go/models";

export function plainPersistedAssistantParts(
    msg: store.ChatMessage,
): AssistantPart[] {
    const t = (msg.content ?? "").trim();
    if (!t) return [];
    return [{ kind: "text", text: msg.content }];
}
