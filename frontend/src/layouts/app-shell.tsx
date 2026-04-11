import { useQuery } from "@tanstack/solid-query";
import { useLocation } from "@solidjs/router";
import type { RouteSectionProps } from "@solidjs/router";
import type { Component } from "solid-js";
import { createEffect, createMemo, createSignal } from "solid-js";
import { AppSidebar } from "@/components/app-sidebar";
import { CreateProjectModal } from "@/components/create-project-modal";
import { CreateThreadModal } from "@/components/create-thread-modal";
import { queryKeys } from "@/lib/query-client";
import { GetProject, ListProjects, ListThreads } from "@wails/go/app/App";
import { store } from "@wails/go/models";
import { WindowSetTitle } from "@wails/runtime/runtime";

export const AppShell: Component<RouteSectionProps> = (props) => {
    const location = useLocation();
    const [createProjectOpen, setCreateProjectOpen] = createSignal(false);
    const [newThreadProjectID, setNewThreadProjectID] = createSignal("");

    const projectsQuery = useQuery(() => ({
        queryKey: queryKeys.projects.all,
        queryFn: async (): Promise<store.Project[]> => {
            const list = await ListProjects();
            return list ?? [];
        },
    }));
    const threadsQuery = useQuery(() => ({
        queryKey: queryKeys.threads.all,
        queryFn: async (): Promise<store.Thread[]> => {
            const list = await ListThreads();
            return list ?? [];
        },
    }));

    const projectIdFromPath = createMemo(() => {
        const m = location.pathname.match(/^\/project\/([^/]+)\/settings/);
        return m?.[1] ?? null;
    });

    const titleProjectQuery = useQuery(() => ({
        queryKey: queryKeys.projects.detail(projectIdFromPath() ?? ""),
        queryFn: async () => {
            const id = projectIdFromPath();
            if (!id) return null;
            const p = await GetProject(id);
            return p ?? null;
        },
        enabled: !!projectIdFromPath(),
    }));

    createEffect(() => {
        const path = location.pathname;
        const pid = projectIdFromPath();

        if (path === "/") {
            WindowSetTitle("Moondust");
            return;
        }
        if (path.startsWith("/settings")) {
            WindowSetTitle("Moondust — Settings");
            return;
        }
        const threadMatch = path.match(/^\/project\/([^/]+)\/thread\/([^/]+)$/);
        if (threadMatch) {
            WindowSetTitle("Moondust — Thread");
            return;
        }
        if (pid) {
            const p = titleProjectQuery.data;
            WindowSetTitle(
                p?.name ? `Moondust — ${p.name}` : "Moondust — Project",
            );
            return;
        }
        WindowSetTitle("Moondust");
    });

    return (
        <div class="flex h-full w-full bg-app-bg text-slate-200">
            <AppSidebar
                onNewProject={() => setCreateProjectOpen(true)}
                onNewThread={(id) => setNewThreadProjectID(id)}
                projects={projectsQuery.data ?? []}
                threads={threadsQuery.data ?? []}
            />
            <main class="min-w-0 flex-1 overflow-auto">{props.children}</main>
            <CreateProjectModal
                open={createProjectOpen()}
                onOpenChange={setCreateProjectOpen}
            />
            <CreateThreadModal
                open={!!newThreadProjectID()}
                onOpenChange={(open) => {
                    if (!open) setNewThreadProjectID("");
                }}
                projectID={newThreadProjectID()}
            />
        </div>
    );
};
