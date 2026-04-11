import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { useParams } from "@solidjs/router";
import type { RouteSectionProps } from "@solidjs/router";
import Check from "lucide-solid/icons/check";
import Loader2 from "lucide-solid/icons/loader-2";
import type { Component } from "solid-js";
import {
    createContext,
    createEffect,
    createSignal,
    on,
    Show,
    useContext,
} from "solid-js";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/query-client";
import { GetProject, UpdateProject } from "@wails/go/app/App";
import { store } from "@wails/go/models";
import { SettingsShell } from "@/pages/settings/layout";
import { PROJECT_SETTINGS_SECTIONS } from "./sections";

interface ProjectSettingsContextValue {
    project: () => store.Project | undefined;
    isLoading: () => boolean;
}

const ProjectSettingsContext = createContext<ProjectSettingsContextValue>();

export function useProjectSettings() {
    const ctx = useContext(ProjectSettingsContext);
    if (!ctx)
        throw new Error(
            "useProjectSettings must be used within ProjectSettingsLayout",
        );
    return ctx;
}

export const ProjectSettingsLayout: Component<RouteSectionProps> = (props) => {
    const params = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const [saved, setSaved] = createSignal(false);
    const [error, setError] = createSignal("");

    const [name, setName] = createSignal("");
    const [remoteUrl, setRemoteUrl] = createSignal("");

    const projectQuery = useQuery(() => ({
        queryKey: queryKeys.projects.detail(params.id),
        queryFn: async () => {
            const p = await GetProject(params.id);
            if (!p) throw new Error("Project not found");
            return p;
        },
        enabled: !!params.id,
    }));

    const updateMutation = useMutation(() => ({
        mutationFn: (p: store.Project) => UpdateProject(p),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.projects.all,
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.projects.detail(params.id),
            });
        },
    }));

    createEffect(
        on(
            () => projectQuery.data,
            (p) => {
                if (p) {
                    setName(p.name);
                    setRemoteUrl(p.remote_url ?? "");
                }
            },
        ),
    );

    createEffect(
        on(saved, (v) => {
            if (!v) return;
            const t = setTimeout(() => setSaved(false), 2000);
            return () => clearTimeout(t);
        }),
    );

    async function save() {
        setError("");
        setSaved(false);
        const p = projectQuery.data;
        if (!p) return;
        try {
            await updateMutation.mutateAsync(
                new store.Project({
                    id: p.id,
                    name: name(),
                    directory: p.directory,
                    remote_url: remoteUrl() || undefined,
                }),
            );
            setSaved(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }

    const contextValue: ProjectSettingsContextValue = {
        project: () => projectQuery.data,
        isLoading: () => projectQuery.isLoading,
    };

    return (
        <ProjectSettingsContext.Provider value={contextValue}>
            <SettingsShell
                title={projectQuery.data?.name || params.id}
                subtitle="Project configuration and runtime settings."
                backHref="/"
                backLabel="Back"
                items={PROJECT_SETTINGS_SECTIONS}
                baseHref={`/project/${params.id}/settings`}
                navLabel="Project settings sections"
                trailing={
                    <Button
                        onClick={() => void save()}
                        disabled={
                            updateMutation.isPending || !projectQuery.isSuccess
                        }
                        class="min-w-24"
                    >
                        <Show
                            when={!updateMutation.isPending}
                            fallback={
                                <>
                                    <Loader2
                                        class="size-4 animate-spin"
                                        stroke-width={2}
                                        aria-hidden
                                    />
                                    Saving…
                                </>
                            }
                        >
                            <Show
                                when={!saved()}
                                fallback={
                                    <>
                                        <Check
                                            class="size-4"
                                            stroke-width={2}
                                            aria-hidden
                                        />
                                        Saved
                                    </>
                                }
                            >
                                Save
                            </Show>
                        </Show>
                    </Button>
                }
            >
                <Show when={projectQuery.isError}>
                    <p class="mb-4 rounded-lg border border-red-900/30 bg-red-950/15 px-3 py-2 text-xs text-red-400">
                        Failed to load project.
                    </p>
                </Show>
                <Show when={error()}>
                    <p class="mb-4 rounded-lg border border-red-900/30 bg-red-950/15 px-3 py-2 text-xs text-red-400">
                        {error()}
                    </p>
                </Show>
                {props.children}
            </SettingsShell>
        </ProjectSettingsContext.Provider>
    );
};
