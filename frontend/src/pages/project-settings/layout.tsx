import type { RouteSectionProps } from "@solidjs/router";
import { useParams } from "@solidjs/router";
import type { Component } from "solid-js";
import { createContext, Show, useContext } from "solid-js";
import { SaveButton } from "@/components/save-button";
import {
    type ProjectSettingsContextValue,
    useProjectSettingsLayoutState,
} from "@/hooks/use-project-settings-layout";
import { SettingsShell } from "@/pages/settings/layout";
import { PROJECT_SETTINGS_SECTIONS } from "./sections";

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

    const {
        projectQuery,
        updateMutation,
        error,
        dirty,
        canSaveProject,
        save,
        contextValue,
    } = useProjectSettingsLayoutState(params.id);

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
                    <SaveButton
                        dirty={dirty()}
                        isPending={updateMutation.isPending}
                        disabled={!projectQuery.isSuccess || !canSaveProject()}
                        onClick={() => void save()}
                    />
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
