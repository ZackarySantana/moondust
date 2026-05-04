import { useQuery } from "@tanstack/solid-query";
import { queryKeys } from "@/lib/query-client";
import {
    GetWorkspace,
    GetThread,
    ListWorkspaces,
    ListThreads,
    ListThreadsByWorkspace,
} from "@/lib/ipc";

export type Workspace = import("@/lib/ipc").Workspace;
export type Thread = import("@/lib/ipc").Thread;

export function useWorkspacesQuery() {
    return useQuery(() => ({
        queryKey: queryKeys.workspaces.all,
        queryFn: async (): Promise<Workspace[]> => {
            const list = await ListWorkspaces();
            return list ?? [];
        },
    }));
}

export function useWorkspaceQuery(id: () => string | undefined) {
    return useQuery(() => ({
        queryKey: queryKeys.workspaces.detail(id() ?? ""),
        queryFn: async (): Promise<Workspace | null> => {
            const wid = id();
            if (!wid) return null;
            const w = await GetWorkspace(wid);
            return w ?? null;
        },
        enabled: Boolean(id()),
    }));
}

export function useThreadsQuery() {
    return useQuery(() => ({
        queryKey: queryKeys.threads.all,
        queryFn: async (): Promise<Thread[]> => {
            const list = await ListThreads();
            return list ?? [];
        },
    }));
}

export function useThreadsByWorkspaceQuery(
    workspaceId: () => string | undefined,
) {
    return useQuery(() => ({
        queryKey: queryKeys.threads.byWorkspace(workspaceId() ?? ""),
        queryFn: async (): Promise<Thread[]> => {
            const wid = workspaceId();
            if (!wid) return [];
            const list = await ListThreadsByWorkspace(wid);
            return list ?? [];
        },
        enabled: Boolean(workspaceId()),
    }));
}

export function useThreadQuery(id: () => string | undefined) {
    return useQuery(() => ({
        queryKey: queryKeys.threads.detail(id() ?? ""),
        queryFn: async (): Promise<Thread | null> => {
            const tid = id();
            if (!tid) return null;
            const t = await GetThread(tid);
            return t ?? null;
        },
        enabled: Boolean(id()),
    }));
}
