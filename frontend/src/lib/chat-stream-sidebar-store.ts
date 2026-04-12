import { batch } from "solid-js";
import { createStore, produce } from "solid-js/store";

/** Max characters per preview line (keeps sidebar updates cheap with many concurrent streams). */
const MAX_PREVIEW = 96;

export type SidebarStreamPhase = "thinking" | "responding" | "done";

export interface SidebarStreamSnapshot {
    phase: SidebarStreamPhase;
    reasoning: string;
    response: string;
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
