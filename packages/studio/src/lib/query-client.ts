import { QueryClient } from "@tanstack/solid-query";

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
