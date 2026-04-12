import { store } from "@wails/go/models";

/** Latest activity time for ordering threads and projects. */
export function threadTimestamp(t: store.Thread): number {
    for (const field of [t.updated_at, t.created_at]) {
        if (!field) continue;
        const d = typeof field === "string" ? new Date(field) : field;
        if (d instanceof Date && !isNaN(d.getTime())) return d.getTime();
    }
    return 0;
}

/** Same order as the sidebar project list (most recently active thread first). */
export function sortProjectsByLatestThread(
    projects: store.Project[],
    threads: store.Thread[],
): store.Project[] {
    const latestByProject = new Map<string, number>();
    for (const t of threads) {
        const ts = threadTimestamp(t);
        const prev = latestByProject.get(t.project_id) ?? 0;
        if (ts > prev) latestByProject.set(t.project_id, ts);
    }
    return [...projects].sort((a, b) => {
        const ta = latestByProject.get(a.id) ?? 0;
        const tb = latestByProject.get(b.id) ?? 0;
        return tb - ta;
    });
}

/** Threads in one project, newest first (matches sidebar). */
export function sortThreadsForProject(
    projectId: string,
    threads: store.Thread[],
): store.Thread[] {
    return threads
        .filter((t) => t.project_id === projectId)
        .sort((a, b) => threadTimestamp(b) - threadTimestamp(a));
}

/**
 * Flat list of threads in sidebar order: for each project (sorted), each thread
 * (sorted). Used for global go_thread_1 … go_thread_6 shortcuts.
 */
export function globalSidebarThreadOrder(
    projects: store.Project[],
    threads: store.Thread[],
): { projectId: string; thread: store.Thread }[] {
    const out: { projectId: string; thread: store.Thread }[] = [];
    for (const p of sortProjectsByLatestThread(projects, threads)) {
        for (const t of sortThreadsForProject(p.id, threads)) {
            out.push({ projectId: p.id, thread: t });
        }
    }
    return out;
}

/** Map thread id → global shortcut slot index 0–5 for the first six threads in sidebar order. */
export function globalThreadShortcutSlots(
    projects: store.Project[],
    threads: store.Thread[],
): Map<string, number> {
    const order = globalSidebarThreadOrder(projects, threads);
    const m = new Map<string, number>();
    const n = Math.min(6, order.length);
    for (let i = 0; i < n; i++) {
        m.set(order[i].thread.id, i);
    }
    return m;
}
