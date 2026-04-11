import type { Component } from "solid-js";
import { createEffect, createSignal, on } from "solid-js";
import {
    CopyableReadonlyField,
    FieldRow,
    Section,
} from "@/components/settings-form";
import { useProjectSettings } from "./layout";

export const ProjectGeneralPage: Component = () => {
    const { project } = useProjectSettings();

    const [name, setName] = createSignal("");
    const [directory, setDirectory] = createSignal("");
    const [remoteUrl, setRemoteUrl] = createSignal("");
    const [projectId, setProjectId] = createSignal("");

    createEffect(
        on(project, (p) => {
            if (p) {
                setProjectId(p.id);
                setName(p.name);
                setDirectory(p.directory);
                setRemoteUrl(p.remote_url ?? "");
            }
        }),
    );

    return (
        <Section title="General">
            <CopyableReadonlyField
                label="ID"
                value={projectId()}
                copyAriaLabel="Copy ID"
                description="Immutable identifier used internally. Cannot be changed."
            />
            <FieldRow
                id="proj-name"
                label="Name"
                value={name()}
                placeholder="Project name"
                description="Display name shown in the sidebar and thread headers."
                onInput={(e) => setName(e.currentTarget.value)}
            />
            <CopyableReadonlyField
                label="Directory"
                value={directory()}
                copyAriaLabel="Copy directory path"
                description="Local path where the project files are stored."
            />
            <FieldRow
                id="proj-remote-url"
                label="Remote URL"
                value={remoteUrl()}
                placeholder="Not configured"
                description="Git remote used for cloning and syncing."
                onInput={(e) => setRemoteUrl(e.currentTarget.value)}
            />
        </Section>
    );
};
