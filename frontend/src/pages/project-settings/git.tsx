import type { Component } from "solid-js";
import { createSignal } from "solid-js";
import { FieldRow, Section } from "@/components/settings-form";

export const ProjectGitPage: Component = () => {
    const [defaultBranch, setDefaultBranch] = createSignal("");
    const [autoPull, setAutoPull] = createSignal("");
    const [commitSigning, setCommitSigning] = createSignal("");

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
                onInput={(e) => setDefaultBranch(e.currentTarget.value)}
            />
            <FieldRow
                id="proj-auto-pull"
                label="Auto-pull"
                value={autoPull()}
                placeholder="on change"
                description="When to pull upstream changes automatically."
                onInput={(e) => setAutoPull(e.currentTarget.value)}
            />
            <FieldRow
                id="proj-commit-signing"
                label="Commit signing"
                value={commitSigning()}
                placeholder="Disabled"
                description="GPG or SSH key used to sign commits."
                onInput={(e) => setCommitSigning(e.currentTarget.value)}
            />
        </Section>
    );
};
