import { QueryClient } from "@tanstack/solid-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Desktop IPC: avoid refetching on every focus.
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
        },
    },
});

/** Central key catalogue. Keep IDs in sync with invalidate helpers below. */
export const queryKeys = {
    workspaces: {
        all: ["workspaces"] as const,
        detail: (id: string) => ["workspaces", id] as const,
    },
    threads: {
        all: ["threads"] as const,
        byWorkspace: (workspaceId: string) =>
            ["threads", "by-workspace", workspaceId] as const,
        detail: (id: string) => ["threads", id] as const,
    },
};

export async function invalidateWorkspaces(qc: QueryClient): Promise<void> {
    await qc.invalidateQueries({ queryKey: queryKeys.workspaces.all });
}

export async function invalidateThreads(qc: QueryClient): Promise<void> {
    await qc.invalidateQueries({ queryKey: queryKeys.threads.all });
}

export async function invalidateThreadDetail(
    qc: QueryClient,
    id: string,
): Promise<void> {
    await qc.invalidateQueries({ queryKey: queryKeys.threads.detail(id) });
}
