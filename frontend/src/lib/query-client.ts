import { QueryClient } from "@tanstack/solid-query";

/** Shared client for the app; wrap the tree with `<QueryClientProvider client={queryClient}>`. */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Desktop IPC: avoid refetching on every focus; tune as needed.
            staleTime: 30_000,
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
    threads: {
        all: ["threads"] as const,
        detail: (id: string) => ["threads", id] as const,
        messages: (id: string) => ["threads", id, "messages"] as const,
        gitStatus: (id: string) => ["threads", id, "git-status"] as const,
    },
    /** OpenRouter GET /api/v1/models (filtered); safe to cache longer. */
    openRouterModels: ["openrouter", "chat-models"] as const,
    /** Aggregates from local chat history (assistant messages + billed cost). */
    openRouterUsageMetrics: ["openrouter", "usage-metrics"] as const,
};
