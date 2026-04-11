import type { Component } from "solid-js";
import { createSignal } from "solid-js";
import { FieldRow, Section } from "@/components/settings-form";
import { useProjectSettings } from "./layout";

export const ProjectGitPage: Component = () => {
    const { markDirty } = useProjectSettings();
    const [defaultBranch, setDefaultBranch] = createSignal("");
    const [autoPull, setAutoPull] = createSignal("");
    const [commitSigning, setCommitSigning] = createSignal("");

    function handleInput(setter: (v: string) => void) {
        return (e: InputEvent & { currentTarget: HTMLInputElement }) => {
            setter(e.currentTarget.value);
            markDirty();
        };
    }

    return (
        <Section
            title="Git"
            description="Version control behavior for this project."
        >
            <FieldRow
                id="proj-default-branch"
                label="Default branch"
                value={defaultBranch()}
                placeholder="main"
                description="Branch checked out when opening the project."
                onInput={handleInput(setDefaultBranch)}
            />
            <FieldRow
                id="proj-auto-pull"
                label="Auto-pull"
                value={autoPull()}
                placeholder="on change"
                description="When to pull upstream changes automatically."
                onInput={handleInput(setAutoPull)}
            />
            <FieldRow
                id="proj-commit-signing"
                label="Commit signing"
                value={commitSigning()}
                placeholder="Disabled"
                description="GPG or SSH key used to sign commits."
                onInput={handleInput(setCommitSigning)}
            />
        </Section>
    );
};
