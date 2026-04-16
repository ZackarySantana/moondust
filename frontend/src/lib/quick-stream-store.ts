import { batch } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { EventsOn } from "@wails/runtime/runtime";
import { queryClient, queryKeys } from "@/lib/query-client";

export type QuickStreamPhase = "idle" | "streaming" | "done" | "error";

export interface QuickStreamSnapshot {
    phase: QuickStreamPhase;
    responseFull: string;
    laneId: string;
    error?: string;
}

export const [quickStreams, setQuickStreams] = createStore<
    Record<string, QuickStreamSnapshot | undefined>
>({});

const doneClearTimers = new Map<string, ReturnType<typeof setTimeout>>();

function clearDoneTimer(key: string) {
    const t = doneClearTimers.get(key);
    if (t !== undefined) {
        clearTimeout(t);
        doneClearTimers.delete(key);
    }
}

function scheduleStreamClear(key: string, ms: number) {
    clearDoneTimer(key);
    doneClearTimers.set(
        key,
        setTimeout(() => {
            batch(() => {
                setQuickStreams(produce((d) => { delete d[key]; }));
            });
            doneClearTimers.delete(key);
        }, ms),
    );
}

export function removeQuickStream(threadId: string) {
    clearDoneTimer(threadId);
    batch(() => {
        setQuickStreams(produce((d) => { delete d[threadId]; }));
    });
}

export function attachQuickStreamListeners(): () => void {
    const unsubs: (() => void)[] = [];

    unsubs.push(
        EventsOn("quick:stream_start", (...args: unknown[]) => {
            const p = args[0] as { thread_id?: string; lane_id?: string };
            const id = p?.thread_id;
            if (!id) return;
            clearDoneTimer(id);
            batch(() => {
                setQuickStreams(id, {
                    phase: "streaming",
                    responseFull: "",
                    laneId: p?.lane_id ?? "quick",
                });
            });
        }),
    );

    unsubs.push(
        EventsOn("quick:stream", (...args: unknown[]) => {
            const p = args[0] as { thread_id?: string; delta?: string; lane_id?: string };
            const id = p?.thread_id;
            if (!id || !p.delta) return;
            batch(() => {
                const cur = quickStreams[id];
                setQuickStreams(id, {
                    phase: "streaming",
                    responseFull: (cur?.responseFull ?? "") + p.delta,
                    laneId: p?.lane_id ?? cur?.laneId ?? "quick",
                });
            });
        }),
    );

    unsubs.push(
        EventsOn("quick:stream_done", (...args: unknown[]) => {
            const p = args[0] as { thread_id?: string; lane_id?: string };
            const id = p?.thread_id;
            if (!id) return;
            void queryClient.invalidateQueries({
                queryKey: queryKeys.threads.messages(id),
            });
            batch(() => {
                const cur = quickStreams[id];
                setQuickStreams(id, {
                    phase: "done",
                    responseFull: cur?.responseFull ?? "",
                    laneId: p?.lane_id ?? cur?.laneId ?? "quick",
                });
            });
            scheduleStreamClear(id, 2500);
        }),
    );

    unsubs.push(
        EventsOn("quick:stream_error", (...args: unknown[]) => {
            const p = args[0] as { thread_id?: string; error?: string; lane_id?: string };
            const id = p?.thread_id;
            if (!id) return;
            batch(() => {
                const cur = quickStreams[id];
                setQuickStreams(id, {
                    phase: "error",
                    responseFull: cur?.responseFull ?? "",
                    laneId: p?.lane_id ?? cur?.laneId ?? "quick",
                    error: p?.error ?? "Quick question failed",
                });
            });
        }),
    );

    return () => { unsubs.forEach((u) => u()); };
}
