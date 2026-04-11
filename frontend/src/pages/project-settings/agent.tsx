import type { Component } from "solid-js";
import { createSignal } from "solid-js";
import { FieldRow, Section } from "@/components/settings-form";

export const ProjectAgentPage: Component = () => {
    const [model, setModel] = createSignal("");
    const [systemPrompt, setSystemPrompt] = createSignal("");
    const [maxTokens, setMaxTokens] = createSignal("");
    const [temperature, setTemperature] = createSignal("");

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
                onInput={(e) => setModel(e.currentTarget.value)}
            />
            <FieldRow
                id="proj-system-prompt"
                label="System prompt"
                value={systemPrompt()}
                placeholder="None"
                description="Prepended to every thread in this project."
                onInput={(e) => setSystemPrompt(e.currentTarget.value)}
            />
            <FieldRow
                id="proj-max-tokens"
                label="Max tokens"
                value={maxTokens()}
                placeholder="8192"
                description="Maximum response length per turn."
                onInput={(e) => setMaxTokens(e.currentTarget.value)}
            />
            <FieldRow
                id="proj-temperature"
                label="Temperature"
                value={temperature()}
                placeholder="0.7"
                description="Sampling temperature for model responses."
                onInput={(e) => setTemperature(e.currentTarget.value)}
            />
        </Section>
    );
};
