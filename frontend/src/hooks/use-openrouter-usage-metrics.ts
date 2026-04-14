import { useQuery } from "@tanstack/solid-query";
import { GetOpenRouterUsageMetrics } from "@wails/go/app/App";
import { queryKeys } from "@/lib/query-client";

/** Local OpenRouter spend / model usage aggregates (assistant messages). */
export function useOpenRouterUsageMetrics() {
    return useQuery(() => ({
        queryKey: queryKeys.openRouterUsageMetrics,
        queryFn: GetOpenRouterUsageMetrics,
    }));
}
