import { batch } from "solid-js";
import { createStore, produce } from "solid-js/store";

/** Max characters per preview line (keeps sidebar updates cheap with many concurrent streams). */
const MAX_PREVIEW = 96;

export type SidebarStreamPhase = "thinking" | "responding" | "done";

/** Live stream payload for a tool row (matches persisted OpenRouterToolCallRecord). */
export type StreamToolPayload = {
    id?: string;
    name: string;
    arguments?: string;
    output?: string;
};

/** Ordered assistant stream: text runs and tool invocations (same idea as persisted segments). */
export type StreamChunk =
    | { kind: "text"; text: string }
    | { kind: "tool"; tool: StreamToolPayload };

export interface SidebarStreamSnapshot {
    phase: SidebarStreamPhase;
    /** Full streamed reasoning (thread view); sidebar truncates when rendering. */
    reasoningFull: string;
    /** Cumulative assistant text only (no tool payloads); used for sidebar preview. */
    responseFull: string;
    /** Interleaved text + tools for the active thread view. */
    responseChunks: StreamChunk[];
    /** Set when the first answer token arrives after reasoning started; mirrors thread header “Thought for Xs”. */
    thinkingDurationSec: number | null;
}

/** Plain text from stream chunks (text segments only). */
export function streamChunksPlainText(
    chunks: StreamChunk[] | undefined,
): string {
    if (!chunks?.length) return "";
    return chunks
        .filter((c): c is { kind: "text"; text: string } => c.kind === "text")
        .map((c) => c.text)
        .join("");
}

/** Append assistant text delta to the last text chunk, or start a new text chunk after a tool. */
export function appendStreamTextDelta(
    chunks: StreamChunk[] | undefined,
    delta: string,
): StreamChunk[] {
    if (!delta) {
        return chunks?.length
            ? [...chunks]
            : ([{ kind: "text", text: "" }] satisfies StreamChunk[]);
    }
    const base: StreamChunk[] = chunks?.length
        ? [...chunks]
        : [{ kind: "text", text: "" }];
    const last = base[base.length - 1];
    if (last.kind === "text") {
        base[base.length - 1] = {
            kind: "text",
            text: last.text + delta,
        };
    } else {
        base.push({ kind: "text", text: delta });
    }
    return base;
}

/**
 * Per-thread assistant stream preview for the sidebar. Keys are thread IDs.
 * Cleared when streams end or error.
 */
export const [sidebarStreams, setSidebarStreams] = createStore<
    Record<string, SidebarStreamSnapshot | undefined>
>({});

const doneClearTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function clearSidebarDoneTimer(threadId: string) {
    const t = doneClearTimers.get(threadId);
    if (t !== undefined) {
        clearTimeout(t);
        doneClearTimers.delete(threadId);
    }
}

export function scheduleSidebarStreamClear(threadId: string, ms: number) {
    clearSidebarDoneTimer(threadId);
    doneClearTimers.set(
        threadId,
        setTimeout(() => {
            batch(() => {
                setSidebarStreams(
                    produce((draft) => {
                        delete draft[threadId];
                    }),
                );
            });
            doneClearTimers.delete(threadId);
        }, ms),
    );
}

export function truncateSidebarPreview(s: string): string {
    const x = s.replace(/\s+/g, " ").trim();
    if (x.length <= MAX_PREVIEW) return x;
    return `${x.slice(0, MAX_PREVIEW - 1)}…`;
}

export function removeSidebarStream(threadId: string) {
    clearSidebarDoneTimer(threadId);
    batch(() => {
        setSidebarStreams(
            produce((draft) => {
                delete draft[threadId];
            }),
        );
    });
}
