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
};
