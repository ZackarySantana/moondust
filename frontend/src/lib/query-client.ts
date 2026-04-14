import { QueryClient } from "@tanstack/solid-query";

/** Shared client for the app; wrap the tree with `<QueryClientProvider client={queryClient}>`. */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Desktop IPC: avoid refetching on every focus; tune as needed.
            staleTime: 30_000,
            // Wails: window focus changes often; avoid surprise IPC refetches when stale.
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
        },
    },
});

/** Central keys so list/detail invalidation stays consistent. */
export const queryKeys = {
    projects: {
        all: ["projects"] as const,
        detail: (id: string) => ["projects", id] as const,
    },
    settings: ["settings"] as const,
    notifications: {
        pushAvailable: ["notifications", "push-available"] as const,
    },
    threads: {
        all: ["threads"] as const,
        detail: (id: string) => ["threads", id] as const,
        messages: (id: string) => ["threads", id, "messages"] as const,
        gitStatus: (id: string) => ["threads", id, "git-status"] as const,
        fileDiff: (threadId: string, path: string, status: string) =>
            ["threads", threadId, "file-diff", path, status] as const,
    },
    /** OpenRouter GET /api/v1/models (filtered); safe to cache longer. */
    openRouterModels: ["openrouter", "chat-models"] as const,
    /** `agent --list-models` when Cursor CLI is installed. */
    cursorChatModels: ["cursor", "chat-models"] as const,
    /** Aggregates from local chat history (assistant messages + billed cost). */
    openRouterUsageMetrics: ["openrouter", "usage-metrics"] as const,
    /** Cursor Agent CLI (`agent`) detection and status probes. */
    cursorCLI: ["cursor", "cli-info"] as const,
};

/** Refetch only `ListThreads` (exact `["threads"]`), not every cached thread query. */
export async function invalidateThreadList(qc: QueryClient): Promise<void> {
    await qc.invalidateQueries({
        queryKey: queryKeys.threads.all,
        exact: true,
    });
}

/** Invalidate detail, messages, git-status, file-diff, etc. for one thread (prefix match). */
export async function invalidateThreadScoped(
    qc: QueryClient,
    threadId: string,
): Promise<void> {
    await qc.invalidateQueries({
        queryKey: queryKeys.threads.detail(threadId),
    });
}

/** Refetch only the project list query. */
export async function invalidateProjectList(qc: QueryClient): Promise<void> {
    await qc.invalidateQueries({
        queryKey: queryKeys.projects.all,
        exact: true,
    });
}

/** Invalidate one project detail query. */
export async function invalidateProjectScoped(
    qc: QueryClient,
    projectId: string,
): Promise<void> {
    await qc.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
    });
}
