import { useQuery, useQueryClient } from "@tanstack/solid-query";
import { GetClaudeCLIInfo } from "@wails/go/app/App";
import { queryKeys } from "@/lib/query-client";

/** Claude Code CLI (`claude`) detection on PATH. */
export function useClaudeCliInfo() {
    const queryClient = useQueryClient();

    const claudeQuery = useQuery(() => ({
        queryKey: queryKeys.claudeCLI,
        queryFn: GetClaudeCLIInfo,
        staleTime: 60_000,
    }));

    function refresh() {
        void queryClient.invalidateQueries({
            queryKey: queryKeys.claudeCLI,
        });
    }

    return { claudeQuery, refresh };
}
