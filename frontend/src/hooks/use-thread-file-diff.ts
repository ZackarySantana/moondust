import { useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { GetFileDiff } from "@wails/go/app/App";
import type { DiffTarget } from "@/components/thread/types";
import { queryKeys } from "@/lib/query-client";

/** Loads unified diff for the review sidebar file selection. */
export function useThreadFileDiff(
    threadId: Accessor<string>,
    diffTarget: Accessor<DiffTarget | null>,
) {
    return useQuery(() => {
        const tid = threadId();
        const t = diffTarget();
        return {
            queryKey: queryKeys.threads.fileDiff(
                tid,
                t?.path ?? "",
                t?.status ?? "",
            ),
            queryFn: () => GetFileDiff(tid, t!.path, t!.status),
            enabled: !!t && !!tid,
        };
    });
}
