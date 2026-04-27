import type { Thread, Workspace } from "./queries";

function threadTimestamp(t: Thread): number {
    const u = t.UpdatedAt ?? t.CreatedAt;
    if (u == null) return 0;
    const d = typeof u === "string" || u instanceof Date ? new Date(u) : null;
    const ms = d && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
    return ms;
}

/** Most recently active workspace first. */
export function sortWorkspacesByLatestThread(
    workspaces: readonly Workspace[],
    threads: readonly Thread[],
): Workspace[] {
    const latest = new Map<string, number>();
    for (const t of threads) {
        const ts = threadTimestamp(t);
        const prev = latest.get(t.WorkspaceID) ?? 0;
        if (ts > prev) latest.set(t.WorkspaceID, ts);
    }
    return [...workspaces].sort(
        (a, b) => (latest.get(b.ID) ?? 0) - (latest.get(a.ID) ?? 0),
    );
}

/** Threads in a single workspace, newest first. */
export function sortThreadsForWorkspace(
    workspaceId: string,
    threads: readonly Thread[],
): Thread[] {
    return threads
        .filter((t) => t.WorkspaceID === workspaceId)
        .sort((a, b) => threadTimestamp(b) - threadTimestamp(a));
}

export interface RailThreadEntry {
    workspaceId: string;
    thread: Thread;
}

/**
 * Flat list of threads in rail order (most-recent workspace, then newest
 * thread within each workspace).
 */
export function railThreadOrder(
    workspaces: readonly Workspace[],
    threads: readonly Thread[],
): RailThreadEntry[] {
    const out: RailThreadEntry[] = [];
    for (const w of sortWorkspacesByLatestThread(workspaces, threads)) {
        for (const t of sortThreadsForWorkspace(w.ID, threads)) {
            out.push({ workspaceId: w.ID, thread: t });
        }
    }
    return out;
}

/** Map thread id → shortcut slot index (0-based) in {@link railThreadOrder}. */
export function railThreadSlotIndex(
    workspaces: readonly Workspace[],
    threads: readonly Thread[],
): Map<string, number> {
    const order = railThreadOrder(workspaces, threads);
    const m = new Map<string, number>();
    order.forEach((e, i) => m.set(e.thread.ID, i));
    return m;
}

/**
 * Recent threads in global rail order, capped for the sidebar “Recent” list and
 * for Alt+1… (see {@link DEFAULT_SHORTCUTS} `go_thread_slot_*`).
 */
export const RECENT_THREAD_SLOT_COUNT = 6 as const;

export function recentThreadOrder(
    workspaces: readonly Workspace[],
    threads: readonly Thread[],
): RailThreadEntry[] {
    return railThreadOrder(workspaces, threads).slice(
        0,
        RECENT_THREAD_SLOT_COUNT,
    );
}

export { threadTimestamp };
