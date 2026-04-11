import type { Component } from "solid-js";
import { createMemo } from "solid-js";
import {
    CopyableReadonlyField,
    FieldRow,
    Section,
} from "@/components/settings-form";
import { useProjectSettings } from "./layout";

export const ProjectGeneralPage: Component = () => {
    const { project, markDirty, fields } = useProjectSettings();

    const projectId = createMemo(() => project()?.id ?? "");
    const directory = createMemo(() => project()?.directory ?? "");

    function handleInput(setter: (v: string) => void) {
        return (e: InputEvent & { currentTarget: HTMLInputElement }) => {
            setter(e.currentTarget.value);
            markDirty();
        };
    }

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
                value={fields.name()}
                placeholder="Project name"
                description="Display name shown in the sidebar and thread headers."
                onInput={handleInput(fields.setName)}
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
                value={fields.remoteUrl()}
                placeholder="Not configured"
                description="Git remote used for cloning and syncing."
                onInput={handleInput(fields.setRemoteUrl)}
            />
        </Section>
    );
};
