import type { AssistantPart, StreamingAssistantArgs } from "@/lib/chat/types";

/** Default live stream → parts (reasoning buffer + interleaved text/tools). */
export function streamPartsFromSnapshot(
    args: StreamingAssistantArgs,
): AssistantPart[] {
    const out: AssistantPart[] = [];
    const reasoningTrim = args.reasoningFull.trim();
    if (reasoningTrim.length > 0 || args.thinkingPhase) {
        out.push({
            kind: "thought",
            text: args.reasoningFull,
            durationSec: args.reasoningDurationSec,
            thinkingPhase: args.thinkingPhase,
        });
    }
    for (const c of args.chunks) {
        if (c.kind === "text") {
            if (c.text.trim()) {
                out.push({ kind: "text", text: c.text });
            }
        } else {
            out.push({ kind: "tool", tool: c.tool });
        }
    }
    return out;
}

export function streamPartsHaveVisibleContent(parts: AssistantPart[]): boolean {
    for (const p of parts) {
        if (p.kind === "thought") {
            if (p.thinkingPhase) return true;
            if (p.text.trim().length > 0) return true;
        }
        if (p.kind === "text" && p.text.trim().length > 0) return true;
        if (p.kind === "tool") return true;
    }
    return false;
}
