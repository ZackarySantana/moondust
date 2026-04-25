import type { JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { StatusDot } from "./status-dot";

const meta = {
    title: "UI/StatusDot",
    component: StatusDot,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    args: {
        tone: "starlight",
        size: "sm",
        pulse: false,
    },
    argTypes: {
        tone: {
            control: { type: "select" },
            options: ["neutral", "starlight", "nebula", "flare", "muted"],
        },
        size: { control: { type: "select" }, options: ["xs", "sm", "default"] },
        pulse: { control: { type: "boolean" } },
        label: { control: { type: "text" } },
    },
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = (props: { children: JSX.Element }) => (
    <div class="min-w-3xl bg-void-950 p-10">
        <div class="space-y-8">{props.children}</div>
    </div>
);

const Row = (props: { label: string; children: JSX.Element }) => (
    <div class="grid grid-cols-[140px_1fr] items-center gap-6">
        <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
            {props.label}
        </span>
        <div class="flex flex-wrap items-center gap-6">{props.children}</div>
    </div>
);

export const Playground: Story = {};

export const Tones: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="static">
                <StatusDot tone="neutral" />
                <StatusDot tone="muted" />
                <StatusDot tone="starlight" />
                <StatusDot tone="nebula" />
                <StatusDot tone="flare" />
            </Row>
            <Row label="pulsing">
                <StatusDot tone="neutral" pulse />
                <StatusDot tone="muted" pulse />
                <StatusDot tone="starlight" pulse />
                <StatusDot tone="nebula" pulse />
                <StatusDot tone="flare" pulse />
            </Row>
        </Frame>
    ),
};

export const Sizes: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="xs">
                <StatusDot tone="starlight" size="xs" />
                <StatusDot tone="nebula" size="xs" pulse />
            </Row>
            <Row label="sm">
                <StatusDot tone="starlight" size="sm" />
                <StatusDot tone="nebula" size="sm" pulse />
            </Row>
            <Row label="default">
                <StatusDot tone="starlight" size="default" />
                <StatusDot tone="nebula" size="default" pulse />
            </Row>
        </Frame>
    ),
};

export const InContext: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-2xl space-y-6">
                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    in context — sidebar thread states
                </p>

                <div class="border border-void-700 bg-void-900 p-2">
                    <ul class="space-y-0.5">
                        <ThreadRow
                            name="Refactor router"
                            time="2m"
                            tone="nebula"
                            pulse
                            status="Thinking"
                        />
                        <ThreadRow
                            name="Fix flake in CI"
                            time="14m"
                            tone="starlight"
                            pulse
                            status="Streaming reply"
                        />
                        <ThreadRow
                            name="Wire up new auth flow"
                            time="1h"
                            tone="muted"
                            status="Reply ready"
                        />
                        <ThreadRow
                            name="Investigate connection drops"
                            time="3h"
                            tone="flare"
                            status="Errored"
                        />
                        <ThreadRow name="Sketch payments page" time="1d" />
                    </ul>
                </div>

                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    in context — provider list
                </p>

                <div class="border border-void-700 bg-void-900">
                    <ProviderRow name="Anthropic" detail="Connected" tone="starlight" />
                    <ProviderRow
                        name="OpenAI"
                        detail="Connected"
                        tone="starlight"
                    />
                    <ProviderRow
                        name="OpenRouter"
                        detail="Streaming 2 requests"
                        tone="nebula"
                        pulse
                    />
                    <ProviderRow
                        name="Local"
                        detail="Offline"
                        tone="muted"
                    />
                </div>
            </div>
        </div>
    ),
};

const ThreadRow = (props: {
    name: string;
    time: string;
    tone?: "neutral" | "starlight" | "nebula" | "flare" | "muted";
    pulse?: boolean;
    status?: string;
}) => (
    <li class="flex items-center gap-2 px-2 py-1.5 text-sm text-void-300 hover:bg-void-800/40">
        <StatusDot
            tone={props.tone ?? "muted"}
            pulse={props.pulse}
            label={props.status}
        />
        <span class="min-w-0 flex-1 truncate">{props.name}</span>
        <span class="shrink-0 font-mono text-[10px] tabular-nums text-void-500">
            {props.time}
        </span>
    </li>
);

const ProviderRow = (props: {
    name: string;
    detail: string;
    tone: "starlight" | "nebula" | "flare" | "muted";
    pulse?: boolean;
}) => (
    <div class="flex items-center justify-between border-b border-void-700 px-3 py-2.5 last:border-b-0">
        <span class="text-sm font-medium text-void-100">{props.name}</span>
        <span class="flex items-center gap-2 text-[11px] text-void-400">
            <StatusDot tone={props.tone} pulse={props.pulse} />
            {props.detail}
        </span>
    </div>
);
