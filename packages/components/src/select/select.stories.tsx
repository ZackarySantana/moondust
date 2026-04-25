import type { Meta, StoryObj } from "storybook-solidjs-vite";
import type { JSX } from "solid-js";
import Bot from "lucide-solid/icons/bot";
import GitBranch from "lucide-solid/icons/git-branch";
import Globe from "lucide-solid/icons/globe";
import Layers from "lucide-solid/icons/layers";

import { Label } from "../label/label";
import { Button } from "../button/button";
import { Select, type SelectProps } from "./select";

const meta = {
    title: "UI/Select",
    component: Select,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    argTypes: {
        disabled: { control: "boolean" },
    },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const Row = (props: { label: string; children: JSX.Element }) => (
    <div class="grid grid-cols-[110px_1fr] items-start gap-6">
        <span class="pt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
            {props.label}
        </span>
        <div>{props.children}</div>
    </div>
);

const Frame = (props: { children: JSX.Element }) => (
    <div class="min-w-3xl bg-void-950 p-10">
        <div class="space-y-6">{props.children}</div>
    </div>
);

const Field = (props: { children: JSX.Element; class?: string }) => (
    <div class={`relative ${props.class ?? "w-80"}`}>{props.children}</div>
);

export const Playground: Story = {
    args: {
        disabled: false,
    },
    render: (args: SelectProps) => (
        <div class="w-72">
            <Select {...args}>
                <option>claude-3.5-sonnet</option>
                <option>claude-3.5-haiku</option>
                <option>claude-3-opus</option>
            </Select>
        </div>
    ),
};

export const Default: Story = {
    render: () => (
        <Frame>
            <Row label="provider">
                <Field>
                    <Select>
                        <option>Anthropic</option>
                        <option>OpenAI</option>
                        <option>Google</option>
                        <option>Local (Ollama)</option>
                    </Select>
                </Field>
            </Row>
            <Row label="model">
                <Field>
                    <Select>
                        <option>claude-3.5-sonnet</option>
                        <option>claude-3.5-haiku</option>
                        <option>claude-3-opus</option>
                    </Select>
                </Field>
            </Row>
            <Row label="branch">
                <Field>
                    <Select>
                        <option>origin/main</option>
                        <option>origin/develop</option>
                        <option>origin/feature/login-flow</option>
                        <option>origin/feature/router-refactor</option>
                    </Select>
                </Field>
            </Row>
        </Frame>
    ),
};

export const States: Story = {
    render: () => (
        <Frame>
            <Row label="default">
                <Field>
                    <Select>
                        <option>claude-3.5-sonnet</option>
                        <option>claude-3.5-haiku</option>
                    </Select>
                </Field>
            </Row>
            <Row label="placeholder">
                <Field>
                    <Select>
                        <option value="" disabled selected>
                            Pick a model
                        </option>
                        <option>claude-3.5-sonnet</option>
                        <option>claude-3.5-haiku</option>
                    </Select>
                </Field>
            </Row>
            <Row label="disabled">
                <Field>
                    <Select disabled>
                        <option>Provider not connected</option>
                    </Select>
                </Field>
            </Row>
            <Row label="invalid">
                <div class="w-80 space-y-1.5">
                    <Field>
                        <Select class="border-flare-500 focus-visible:border-flare-400 focus-visible:ring-flare-400/40">
                            <option value="" selected>
                                Pick a provider
                            </option>
                            <option>Anthropic</option>
                            <option>OpenAI</option>
                        </Select>
                    </Field>
                    <p class="text-xs text-flare-400">Provider is required</p>
                </div>
            </Row>
        </Frame>
    ),
};

export const WithLabel: Story = {
    render: () => (
        <Frame>
            <Row label="basic">
                <div class="w-80">
                    <Label for="ks-provider">Provider</Label>
                    <Select id="ks-provider">
                        <option>Anthropic</option>
                        <option>OpenAI</option>
                        <option>Google</option>
                    </Select>
                </div>
            </Row>
            <Row label="hint">
                <div class="w-80">
                    <Label for="ks-model">Default model</Label>
                    <Select id="ks-model">
                        <option>claude-3.5-sonnet</option>
                        <option>claude-3.5-haiku</option>
                    </Select>
                    <p class="mt-1.5 text-xs text-void-400">
                        New threads in this project use this model unless
                        overridden.
                    </p>
                </div>
            </Row>
            <Row label="error">
                <div class="w-80">
                    <Label for="ks-key" class="text-flare-400">
                        Provider
                    </Label>
                    <Select
                        id="ks-key"
                        class="border-flare-500 focus-visible:border-flare-400 focus-visible:ring-flare-400/40"
                    >
                        <option value="" selected>
                            Pick a provider
                        </option>
                        <option>Anthropic</option>
                    </Select>
                    <p class="mt-1.5 text-xs text-flare-400">
                        Choose a provider to continue
                    </p>
                </div>
            </Row>
        </Frame>
    ),
};

export const WithIcon: Story = {
    render: () => (
        <Frame>
            <Row label="provider">
                <Field>
                    <Bot
                        size={14}
                        class="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-void-500"
                    />
                    <Select class="pl-9">
                        <option>Anthropic</option>
                        <option>OpenAI</option>
                        <option>Google</option>
                    </Select>
                </Field>
            </Row>
            <Row label="branch">
                <Field>
                    <GitBranch
                        size={14}
                        class="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-void-500"
                    />
                    <Select class="pl-9 font-mono">
                        <option>origin/main</option>
                        <option>origin/develop</option>
                        <option>origin/feature/login-flow</option>
                    </Select>
                </Field>
            </Row>
            <Row label="region">
                <Field>
                    <Globe
                        size={14}
                        class="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-void-500"
                    />
                    <Select class="pl-9">
                        <option>us-east-1</option>
                        <option>us-west-2</option>
                        <option>eu-west-1</option>
                        <option>ap-southeast-1</option>
                    </Select>
                </Field>
            </Row>
            <Row label="density">
                <Field>
                    <Layers
                        size={14}
                        class="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-void-500"
                    />
                    <Select class="pl-9">
                        <option>Compact</option>
                        <option>Default</option>
                        <option>Comfortable</option>
                    </Select>
                </Field>
            </Row>
        </Frame>
    ),
};

export const Sizes: Story = {
    render: () => (
        <Frame>
            <Row label="narrow">
                <Field class="w-24">
                    <Select>
                        <option>1</option>
                        <option>2</option>
                        <option>4</option>
                        <option>8</option>
                    </Select>
                </Field>
            </Row>
            <Row label="default">
                <Field>
                    <Select>
                        <option>claude-3.5-sonnet</option>
                    </Select>
                </Field>
            </Row>
            <Row label="wide">
                <Field class="w-full max-w-2xl">
                    <Select class="font-mono">
                        <option>
                            anthropic / claude-3.5-sonnet-20241022
                        </option>
                        <option>anthropic / claude-3.5-haiku-20241022</option>
                        <option>openai / gpt-4o-2024-11-20</option>
                    </Select>
                </Field>
            </Row>
            <Row label="inline">
                <div class="flex w-full max-w-md items-center gap-2">
                    <Field class="flex-1">
                        <Select>
                            <option>main</option>
                            <option>develop</option>
                        </Select>
                    </Field>
                    <Button size="sm" variant="secondary">
                        Switch
                    </Button>
                </div>
            </Row>
        </Frame>
    ),
};

export const ManyOptions: Story = {
    render: () => (
        <Frame>
            <Row label="long list">
                <Field>
                    <Select>
                        {Array.from({ length: 24 }, (_, i) => (
                            <option value={`opt-${i}`}>
                                feature/branch-{String(i + 1).padStart(2, "0")}
                            </option>
                        ))}
                    </Select>
                </Field>
            </Row>
            <Row label="grouped">
                <Field>
                    <Select>
                        <optgroup label="Anthropic">
                            <option>claude-3.5-sonnet</option>
                            <option>claude-3.5-haiku</option>
                            <option>claude-3-opus</option>
                        </optgroup>
                        <optgroup label="OpenAI">
                            <option>gpt-4o</option>
                            <option>gpt-4o-mini</option>
                            <option>o1</option>
                        </optgroup>
                        <optgroup label="Google">
                            <option>gemini-2.0-flash</option>
                            <option>gemini-1.5-pro</option>
                        </optgroup>
                    </Select>
                </Field>
            </Row>
        </Frame>
    ),
};

export const InContext: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-2xl">
                <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    Thread settings
                </p>
                <div class="border border-void-700 bg-void-900 p-6">
                    <div class="mb-5">
                        <Label for="ic-provider">Provider</Label>
                        <Field class="w-full">
                            <Bot
                                size={14}
                                class="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-void-500"
                            />
                            <Select id="ic-provider" class="pl-9">
                                <option>Anthropic</option>
                                <option>OpenAI</option>
                                <option>Google</option>
                            </Select>
                        </Field>
                    </div>
                    <div class="mb-5">
                        <Label for="ic-model">Model</Label>
                        <Select id="ic-model" class="font-mono">
                            <option>claude-3.5-sonnet-20241022</option>
                            <option>claude-3.5-haiku-20241022</option>
                            <option>claude-3-opus-20240229</option>
                        </Select>
                    </div>
                    <div class="mb-5">
                        <Label for="ic-branch">Branch</Label>
                        <Field class="w-full">
                            <GitBranch
                                size={14}
                                class="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-void-500"
                            />
                            <Select id="ic-branch" class="pl-9 font-mono">
                                <option>origin/main</option>
                                <option>origin/develop</option>
                                <option>origin/feature/router-refactor</option>
                            </Select>
                        </Field>
                    </div>
                    <div class="mb-6 grid grid-cols-2 gap-3">
                        <div>
                            <Label for="ic-density">Density</Label>
                            <Select id="ic-density">
                                <option>Compact</option>
                                <option>Default</option>
                                <option>Comfortable</option>
                            </Select>
                        </div>
                        <div>
                            <Label for="ic-region">Region</Label>
                            <Select id="ic-region">
                                <option>us-east-1</option>
                                <option>us-west-2</option>
                                <option>eu-west-1</option>
                            </Select>
                        </div>
                    </div>
                    <div class="flex items-center justify-end gap-2">
                        <Button variant="ghost">Cancel</Button>
                        <Button>Save</Button>
                    </div>
                </div>
            </div>
        </div>
    ),
};
