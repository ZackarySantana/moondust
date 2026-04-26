import type { Project, Thread } from "./queries";

export function threadTimestamp(t: Thread): number {
    for (const field of [t.UpdatedAt, t.CreatedAt]) {
        if (field == null || field === "") continue;
        const d = typeof field === "string" ? new Date(field) : field;
        if (d instanceof Date && !Number.isNaN(d.getTime())) {
            return d.getTime();
        }
    }
    return 0;
}

/** Most recently active project first. */
export function sortProjectsByLatestThread(
    projects: readonly Project[],
    threads: readonly Thread[],
): Project[] {
    const latest = new Map<string, number>();
    for (const t of threads) {
        const ts = threadTimestamp(t);
        const prev = latest.get(t.ProjectID) ?? 0;
        if (ts > prev) latest.set(t.ProjectID, ts);
    }
    return [...projects].sort(
        (a, b) => (latest.get(b.ID) ?? 0) - (latest.get(a.ID) ?? 0),
    );
}

/** Threads in a single project, newest first. */
export function sortThreadsForProject(
    projectId: string,
    threads: readonly Thread[],
): Thread[] {
    return threads
        .filter((t) => t.ProjectID === projectId)
        .sort((a, b) => threadTimestamp(b) - threadTimestamp(a));
}

export interface RailThreadEntry {
    projectId: string;
    thread: Thread;
}

/**
 * Flat list of threads in rail order (most-recent project, then newest
 * thread). Used to drive ⌘⌥1..6 jumps and the "Recent threads" section
 * on the Hub.
 */
export function railThreadOrder(
    projects: readonly Project[],
    threads: readonly Thread[],
): RailThreadEntry[] {
    const out: RailThreadEntry[] = [];
    for (const p of sortProjectsByLatestThread(projects, threads)) {
        for (const t of sortThreadsForProject(p.ID, threads)) {
            out.push({ projectId: p.ID, thread: t });
        }
    }
    return out;
}

/** Map thread id → 0-based slot index for the first 6 threads in rail order. */
export function railThreadSlotIndex(
    projects: readonly Project[],
    threads: readonly Thread[],
): Map<string, number> {
    const order = railThreadOrder(projects, threads);
    const m = new Map<string, number>();
    const n = Math.min(6, order.length);
    for (let i = 0; i < n; i++) m.set(order[i].thread.ID, i);
    return m;
}
