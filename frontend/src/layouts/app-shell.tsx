import { useQuery } from "@tanstack/solid-query";
import type { RouteSectionProps } from "@solidjs/router";
import type { Component } from "solid-js";
import { createSignal } from "solid-js";
import { AppSidebar } from "@/components/app-sidebar";
import { CreateProjectModal } from "@/components/create-project-modal";
import { queryKeys } from "@/lib/query-client";
import { ListProjects } from "@wails/go/app/App";
import { store } from "@wails/go/models";

export const AppShell: Component<RouteSectionProps> = (props) => {
    const [createProjectOpen, setCreateProjectOpen] = createSignal(false);

    const projectsQuery = useQuery(() => ({
        queryKey: queryKeys.projects.all,
        queryFn: async (): Promise<store.Project[]> => {
            const list = await ListProjects();
            return list ?? [];
        },
    }));

    return (
        <div class="flex h-full w-full bg-app-bg text-slate-200">
            <AppSidebar
                onNewProject={() => setCreateProjectOpen(true)}
                projects={projectsQuery.data ?? []}
            />
            <main class="min-w-0 flex-1 overflow-auto">{props.children}</main>
            <CreateProjectModal
                open={createProjectOpen()}
                onOpenChange={setCreateProjectOpen}
            />
        </div>
    );
};
