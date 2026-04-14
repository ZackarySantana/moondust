import { useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { GetFileDiff } from "@wails/go/app/App";
import type { DiffTarget } from "@/components/thread/types";
import { queryKeys } from "@/lib/query-client";

/** Loads unified diff for the review sidebar file selection. */
export function useThreadFileDiff(
    threadId: string,
    diffTarget: Accessor<DiffTarget | null>,
) {
    return useQuery(() => ({
        queryKey: queryKeys.threads.fileDiff(
            threadId,
            diffTarget()?.path ?? "",
            diffTarget()?.status ?? "",
        ),
        queryFn: () =>
            GetFileDiff(threadId, diffTarget()!.path, diffTarget()!.status),
        enabled: !!diffTarget() && !!threadId,
    }));
}
