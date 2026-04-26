import { useQuery } from "@tanstack/solid-query";
import { queryKeys } from "@/lib/query-client";
import {
    GetProject,
    GetThread,
    ListProjects,
    ListThreads,
    ListThreadsByProject,
    store,
} from "@/lib/wails";

export type Project = store.Project;
export type Thread = store.Thread;

/** All workspaces. Memoized via TanStack Query keyed by `["projects"]`. */
export function useProjectsQuery() {
    return useQuery(() => ({
        queryKey: queryKeys.projects.all,
        queryFn: async (): Promise<Project[]> => {
            const list = await ListProjects();
            return list ?? [];
        },
    }));
}

export function useProjectQuery(id: () => string | undefined) {
    return useQuery(() => ({
        queryKey: queryKeys.projects.detail(id() ?? ""),
        queryFn: async (): Promise<Project | null> => {
            const pid = id();
            if (!pid) return null;
            const p = await GetProject(pid);
            return p ?? null;
        },
        enabled: Boolean(id()),
    }));
}

/** All threads across all workspaces. */
export function useThreadsQuery() {
    return useQuery(() => ({
        queryKey: queryKeys.threads.all,
        queryFn: async (): Promise<Thread[]> => {
            const list = await ListThreads();
            return list ?? [];
        },
    }));
}

export function useThreadsByProjectQuery(projectId: () => string | undefined) {
    return useQuery(() => ({
        queryKey: queryKeys.threads.byProject(projectId() ?? ""),
        queryFn: async (): Promise<Thread[]> => {
            const pid = projectId();
            if (!pid) return [];
            const list = await ListThreadsByProject(pid);
            return list ?? [];
        },
        enabled: Boolean(projectId()),
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
