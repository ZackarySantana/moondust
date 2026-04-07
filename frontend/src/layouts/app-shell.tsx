import type { RouteSectionProps } from "@solidjs/router";
import type { Component } from "solid-js";
import { createSignal, onMount } from "solid-js";
import { AppSidebar } from "@/components/app-sidebar";
import { CreateProjectModal } from "@/components/create-project-modal";
import { ListProjects } from "@wails/go/main/App";
import { store } from "@wails/go/models";

export const AppShell: Component<RouteSectionProps> = (props) => {
    const [createProjectOpen, setCreateProjectOpen] = createSignal(false);
    const [projects, setProjects] = createSignal<store.Project[]>([]);

    async function loadProjects() {
        try {
            const list = await ListProjects();
            setProjects(list ?? []);
        } catch {
            setProjects([]);
        }
    }

    onMount(() => void loadProjects());

    return (
        <div class="flex h-full w-full bg-app-bg text-slate-200">
            <AppSidebar
                onNewProject={() => setCreateProjectOpen(true)}
                projects={projects()}
            />
            <main class="min-w-0 flex-1 overflow-auto">{props.children}</main>
            <CreateProjectModal
                open={createProjectOpen()}
                onOpenChange={setCreateProjectOpen}
                onCreated={() => void loadProjects()}
            />
        </div>
    );
};
