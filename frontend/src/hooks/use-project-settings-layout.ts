import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import type { Accessor, Setter } from "solid-js";
import { createEffect, createMemo, createSignal, on } from "solid-js";
import {
    invalidateProjectList,
    invalidateProjectScoped,
    queryKeys,
} from "@/lib/query-client";
import { GetProject, UpdateProject } from "@wails/go/app/App";
import { store } from "@wails/go/models";

export interface ProjectSettingsContextValue {
    project: () => store.Project | undefined;
    isLoading: () => boolean;
    markDirty: () => void;
    fields: {
        name: Accessor<string>;
        setName: Setter<string>;
        remoteUrl: Accessor<string>;
        setRemoteUrl: Setter<string>;
        defaultBranch: Accessor<string>;
        setDefaultBranch: Setter<string>;
        autoFetch: Accessor<string>;
        setAutoFetch: Setter<string>;
    };
}

/**
 * Project settings route: load project, editable fields, save mutation, and context payload.
 */
export function useProjectSettingsLayoutState(projectId: string) {
    const queryClient = useQueryClient();

    const [error, setError] = createSignal("");
    const [dirty, setDirty] = createSignal(false);

    const [name, setName] = createSignal("");
    const [remoteUrl, setRemoteUrl] = createSignal("");
    const [defaultBranch, setDefaultBranch] = createSignal("");
    const [autoFetch, setAutoFetch] = createSignal("both");

    const canSaveProject = createMemo(() => defaultBranch().trim().length > 0);

    const projectQuery = useQuery(() => ({
        queryKey: queryKeys.projects.detail(projectId),
        queryFn: async () => {
            const p = await GetProject(projectId);
            if (!p) throw new Error("Project not found");
            return p;
        },
        enabled: !!projectId,
    }));

    const updateMutation = useMutation(() => ({
        mutationFn: (p: store.Project) => UpdateProject(p),
        onSuccess: async () => {
            setDirty(false);
            await invalidateProjectScoped(queryClient, projectId);
            await invalidateProjectList(queryClient);
        },
    }));

    createEffect(
        on(
            () => projectQuery.data,
            (p) => {
                if (p) {
                    setName(p.name);
                    setRemoteUrl(p.remote_url ?? "");
                    setDefaultBranch(p.default_branch ?? "");
                    setAutoFetch(p.auto_fetch?.trim() || "both");
                    setDirty(false);
                }
            },
        ),
    );

    async function save() {
        setError("");
        const p = projectQuery.data;
        if (!p) return;
        if (!defaultBranch().trim()) {
            setError("Default branch is required (see Git settings).");
            return;
        }
        try {
            await updateMutation.mutateAsync(
                new store.Project({
                    id: p.id,
                    name: name(),
                    directory: p.directory,
                    remote_url: remoteUrl() || undefined,
                    default_branch: defaultBranch().trim(),
                    auto_fetch: autoFetch(),
                }),
            );
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }

    const contextValue: ProjectSettingsContextValue = {
        project: () => projectQuery.data,
        isLoading: () => projectQuery.isLoading,
        markDirty: () => setDirty(true),
        fields: {
            name,
            setName,
            remoteUrl,
            setRemoteUrl,
            defaultBranch,
            setDefaultBranch,
            autoFetch,
            setAutoFetch,
        },
    };

    return {
        projectQuery,
        updateMutation,
        error,
        dirty,
        canSaveProject,
        save,
        contextValue,
    };
}
