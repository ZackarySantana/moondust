import type { QueryClient } from "@tanstack/solid-query";
import { invalidateThreads } from "@/lib/query-client";
import { CreateThread } from "@/lib/ipc";
import { paths } from "./paths";
import type { Thread } from "./queries";

export async function createThreadInWorkspace(
    qc: QueryClient,
    navigate: (to: string) => void | Promise<void>,
    workspaceId: string,
    title = "",
): Promise<Thread> {
    const thread = await CreateThread(workspaceId, title);
    await invalidateThreads(qc);
    await navigate(paths.thread(workspaceId, thread.ID));
    return thread;
}
