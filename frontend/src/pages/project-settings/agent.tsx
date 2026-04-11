import type { Component } from "solid-js";
import { createSignal } from "solid-js";
import { FieldRow, Section } from "@/components/settings-form";
import { useProjectSettings } from "./layout";

export const ProjectAgentPage: Component = () => {
    const { markDirty } = useProjectSettings();
    const [model, setModel] = createSignal("");
    const [systemPrompt, setSystemPrompt] = createSignal("");
    const [maxTokens, setMaxTokens] = createSignal("");
    const [temperature, setTemperature] = createSignal("");

    function handleInput(setter: (v: string) => void) {
        return (e: InputEvent & { currentTarget: HTMLInputElement }) => {
            setter(e.currentTarget.value);
            markDirty();
        };
    }

    return (
        <Section
            title="Agent"
            description="Defaults for threads running in this project."
        >
            <FieldRow
                id="proj-model"
                label="Model"
                value={model()}
                placeholder="Default"
                description="LLM model used for new threads."
                onInput={handleInput(setModel)}
            />
            <FieldRow
                id="proj-system-prompt"
                label="System prompt"
                value={systemPrompt()}
                placeholder="None"
                description="Prepended to every thread in this project."
                onInput={handleInput(setSystemPrompt)}
            />
            <FieldRow
                id="proj-max-tokens"
                label="Max tokens"
                value={maxTokens()}
                placeholder="8192"
                description="Maximum response length per turn."
                onInput={handleInput(setMaxTokens)}
            />
            <FieldRow
                id="proj-temperature"
                label="Temperature"
                value={temperature()}
                placeholder="0.7"
                description="Sampling temperature for model responses."
                onInput={handleInput(setTemperature)}
            />
        </Section>
    );
};
