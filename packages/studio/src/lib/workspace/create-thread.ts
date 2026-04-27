import type { QueryClient } from "@tanstack/solid-query";
import { invalidateThreads } from "@/lib/query-client";
import { CreateThread } from "@/lib/wails";
import { paths } from "./paths";
import type { Thread } from "./queries";

export async function createThreadInProject(
    qc: QueryClient,
    navigate: (to: string) => void | Promise<void>,
    projectId: string,
    title = "",
): Promise<Thread> {
    const thread = await CreateThread(projectId, title);
    await invalidateThreads(qc);
    await navigate(paths.thread(projectId, thread.ID));
    return thread;
}
