import type { Component } from "solid-js";
import { createSignal } from "solid-js";
import { FieldRow, Section } from "@/components/settings-form";
import { useProjectSettings } from "./layout";

export const ProjectEnvironmentPage: Component = () => {
    const { markDirty } = useProjectSettings();
    const [runtime, setRuntime] = createSignal("");
    const [shell, setShell] = createSignal("");
    const [workingDir, setWorkingDir] = createSignal("");

    function handleInput(setter: (v: string) => void) {
        return (e: InputEvent & { currentTarget: HTMLInputElement }) => {
            setter(e.currentTarget.value);
            markDirty();
        };
    }

    return (
        <Section
            title="Environment"
            description="Variables and context injected into agent sessions."
        >
            <FieldRow
                id="proj-runtime"
                label="Runtime"
                value={runtime()}
                placeholder="Auto-detect"
                description="Language runtime (e.g. Node 20, Python 3.12, Go 1.22)."
                onInput={handleInput(setRuntime)}
            />
            <FieldRow
                id="proj-shell"
                label="Shell"
                value={shell()}
                placeholder="/bin/bash"
                description="Shell used for command execution."
                onInput={handleInput(setShell)}
            />
            <FieldRow
                id="proj-working-dir"
                label="Working directory"
                value={workingDir()}
                placeholder="Project root"
                description="Override the default cwd for agent commands."
                onInput={handleInput(setWorkingDir)}
            />
        </Section>
    );
};
