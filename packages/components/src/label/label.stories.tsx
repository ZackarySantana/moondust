import type { Meta, StoryObj } from "storybook-solidjs-vite";
import type { JSX } from "solid-js";
import AlertCircle from "lucide-solid/icons/alert-circle";

import { Input } from "../input/input";
import { Select } from "../select/select";
import { Label } from "./label";

const meta = {
    title: "UI/Label",
    component: Label,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

const Row = (props: { label: string; children: JSX.Element }) => (
    <div class="grid grid-cols-[110px_1fr] items-start gap-6">
        <span class="pt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
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

export const Default: Story = {
    render: () => (
        <div class="w-72">
            <Label for="name">Project name</Label>
            <Input id="name" placeholder="moondust-companion" />
        </div>
    ),
};

export const Anatomy: Story = {
    render: () => (
        <Frame>
            <Row label="basic">
                <div class="w-80">
                    <Label for="a-name">Project name</Label>
                    <Input id="a-name" placeholder="moondust-companion" />
                </div>
            </Row>
            <Row label="hint">
                <div class="w-80">
                    <Label for="a-handle">Handle</Label>
                    <Input id="a-handle" placeholder="leo" />
                    <p class="mt-1.5 text-xs text-void-400">
                        Lowercase letters, numbers, and hyphens only.
                    </p>
                </div>
            </Row>
            <Row label="error">
                <div class="w-80">
                    <Label for="a-email" class="text-flare-400">
                        Email
                    </Label>
                    <Input
                        id="a-email"
                        type="email"
                        value="not-an-email"
                        class="border-flare-500 focus-visible:border-flare-400 focus-visible:ring-flare-400/40"
                    />
                    <p class="mt-1.5 flex items-center gap-1.5 text-xs text-flare-400">
                        <AlertCircle size={12} />
                        Enter a valid email address
                    </p>
                </div>
            </Row>
            <Row label="optional">
                <div class="w-80">
                    <Label for="a-bio">
                        Description{" "}
                        <span class="font-normal text-void-500">
                            (optional)
                        </span>
                    </Label>
                    <Input id="a-bio" placeholder="What is this project for?" />
                </div>
            </Row>
        </Frame>
    ),
};

export const Tones: Story = {
    render: () => (
        <Frame>
            <Row label="default">
                <Label>Project name</Label>
            </Row>
            <Row label="primary">
                <Label class="text-void-100">Project name</Label>
            </Row>
            <Row label="muted">
                <Label class="text-void-500">Project name</Label>
            </Row>
            <Row label="error">
                <Label class="text-flare-400">Project name</Label>
            </Row>
            <Row label="success">
                <Label class="text-starlight-300">Project name</Label>
            </Row>
            <Row label="info">
                <Label class="text-nebula-300">Project name</Label>
            </Row>
        </Frame>
    ),
};

export const InGrid: Story = {
    render: () => (
        <Frame>
            <Row label="left aligned">
                <div class="grid w-[28rem] grid-cols-[10rem_1fr] items-center gap-3 gap-y-4">
                    <Label for="g-name" class="mb-0">
                        Name
                    </Label>
                    <Input id="g-name" placeholder="moondust-companion" />
                    <Label for="g-branch" class="mb-0">
                        Default branch
                    </Label>
                    <Input
                        id="g-branch"
                        value="origin/main"
                        class="font-mono"
                    />
                </div>
            </Row>
            <Row label="right aligned">
                <div class="grid w-[28rem] grid-cols-[10rem_1fr] items-center gap-3 gap-y-4">
                    <Label for="g2-name" class="mb-0 text-right">
                        Name
                    </Label>
                    <Input id="g2-name" placeholder="moondust-companion" />
                    <Label for="g2-branch" class="mb-0 text-right">
                        Default branch
                    </Label>
                    <Input
                        id="g2-branch"
                        value="origin/main"
                        class="font-mono"
                    />
                </div>
            </Row>
        </Frame>
    ),
};

export const InContext: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-xl">
                <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    Provider settings
                </p>
                <div class="border border-void-700 bg-void-900 p-6">
                    <div class="mb-5">
                        <Label for="ic-provider">Provider</Label>
                        <Select id="ic-provider">
                            <option>Anthropic</option>
                            <option>OpenAI</option>
                            <option>Google</option>
                        </Select>
                        <p class="mt-1.5 text-xs text-void-400">
                            Used as the default provider for new threads in
                            this project.
                        </p>
                    </div>
                    <div class="mb-5">
                        <div class="mb-1.5 flex items-baseline justify-between">
                            <Label for="ic-key" class="mb-0">
                                API key
                            </Label>
                            <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                                Required
                            </span>
                        </div>
                        <Input
                            id="ic-key"
                            type="password"
                            value="sk-ant-api03-aBcDeF"
                            class="font-mono"
                        />
                        <p class="mt-1.5 text-xs text-void-400">
                            Stored in your system keychain, never sent to
                            Moondust.
                        </p>
                    </div>
                    <div>
                        <Label for="ic-temp">
                            Temperature{" "}
                            <span class="font-normal text-void-500">
                                (0 to 2)
                            </span>
                        </Label>
                        <Input
                            id="ic-temp"
                            type="number"
                            value="0.7"
                            step={0.1}
                            min={0}
                            max={2}
                            class="text-right font-mono tabular-nums"
                        />
                    </div>
                </div>
            </div>
        </div>
    ),
};
