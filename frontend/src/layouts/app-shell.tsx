import { useQuery, useQueryClient } from "@tanstack/solid-query";
import { useLocation, useNavigate } from "@solidjs/router";
import type { RouteSectionProps } from "@solidjs/router";
import type { Component } from "solid-js";
import {
    createEffect,
    createMemo,
    createSignal,
    onCleanup,
    onMount,
} from "solid-js";
import { AppSidebar } from "@/components/app-sidebar";
import { CreateProjectModal } from "@/components/create-project-modal";
import { CreateThreadModal } from "@/components/create-thread-modal";
import { NotificationToast } from "@/components/notification-toast";
import { normalizeDefaultWorktreePref } from "@/lib/default-worktree";
import {
    invalidateThreadList,
    invalidateThreadScoped,
    queryKeys,
} from "@/lib/query-client";
import { CurrentThreadProvider } from "@/lib/current-thread-context";
import { globalSidebarThreadOrder } from "@/lib/sidebar-thread-order";
import { ShortcutProvider, useShortcuts } from "@/lib/shortcut-context";
import {
    GetBuildLabel,
    GetProject,
    GetSettings,
    ListProjects,
    ListThreads,
    RenameThread,
} from "@wails/go/app/App";
import { store } from "@wails/go/models";
import { EventsOn, WindowSetTitle } from "@wails/runtime/runtime";

export const AppShell: Component<RouteSectionProps> = (props) => {
    return (
        <ShortcutProvider>
            <CurrentThreadProvider>
                <AppShellInner {...props} />
            </CurrentThreadProvider>
        </ShortcutProvider>
    );
};

const AppShellInner: Component<RouteSectionProps> = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { onAction } = useShortcuts();
    const [createProjectOpen, setCreateProjectOpen] = createSignal(false);
    const [newThreadProjectID, setNewThreadProjectID] = createSignal("");
    const [buildLabel, setBuildLabel] = createSignal("");

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

    const settingsQuery = useQuery(() => ({
        queryKey: queryKeys.settings,
        queryFn: GetSettings,
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

    const focusedProjectId = createMemo(() => {
        const threadMatch = location.pathname.match(/^\/project\/([^/]+)\//);
        return threadMatch?.[1] ?? null;
    });

    function goToThread(index: number) {
        const order = globalSidebarThreadOrder(
            projectsQuery.data ?? [],
            threadsQuery.data ?? [],
        );
        const entry = order[index];
        if (!entry) return;
        navigate(`/project/${entry.projectId}/thread/${entry.thread.id}`);
    }

    const cleanups: (() => void)[] = [];
    cleanups.push(
        onAction("new_project", () => setCreateProjectOpen(true)),
        onAction("go_home", () => navigate("/")),
        onAction("open_settings", () => navigate("/settings")),
        onAction("new_thread", () => {
            const pid = focusedProjectId();
            if (pid) setNewThreadProjectID(pid);
        }),
        onAction("go_thread_1", () => goToThread(0)),
        onAction("go_thread_2", () => goToThread(1)),
        onAction("go_thread_3", () => goToThread(2)),
        onAction("go_thread_4", () => goToThread(3)),
        onAction("go_thread_5", () => goToThread(4)),
        onAction("go_thread_6", () => goToThread(5)),
    );
    onCleanup(() => cleanups.forEach((c) => c()));

    onMount(() => {
        void GetBuildLabel().then(setBuildLabel);
        const off = EventsOn("notification:navigate", (...args: unknown[]) => {
            const path = typeof args[0] === "string" ? args[0] : "";
            if (path.startsWith("/")) navigate(path);
        });
        onCleanup(off);
    });

    async function onRenameThread(threadId: string, title: string) {
        await RenameThread(threadId, title);
        await invalidateThreadScoped(queryClient, threadId);
        await invalidateThreadList(queryClient);
    }

    return (
        <div class="flex h-full w-full bg-app-bg text-slate-200">
            <AppSidebar
                buildLabel={buildLabel()}
                onRenameThread={onRenameThread}
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
                defaultWorktreePref={normalizeDefaultWorktreePref(
                    settingsQuery.data?.default_worktree,
                )}
            />
            <NotificationToast />
        </div>
    );
};
