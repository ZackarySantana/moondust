import { useQuery, useQueryClient } from "@tanstack/solid-query";
import { GetCursorCLIInfo } from "@wails/go/app/App";
import { queryKeys } from "@/lib/query-client";

/** Cursor Agent CLI (`agent`) detection and dashboard usage snapshot. */
export function useCursorCliInfo() {
    const queryClient = useQueryClient();

    const cursorQuery = useQuery(() => ({
        queryKey: queryKeys.cursorCLI,
        queryFn: GetCursorCLIInfo,
    }));

    function refresh() {
        void queryClient.invalidateQueries({
            queryKey: queryKeys.cursorCLI,
        });
    }

    return { cursorQuery, refresh };
}
