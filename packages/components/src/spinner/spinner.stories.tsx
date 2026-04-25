import type { JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Spinner } from "./spinner";

const meta = {
    title: "UI/Spinner",
    component: Spinner,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    args: {
        size: "default",
        tone: "muted",
    },
    argTypes: {
        size: {
            control: { type: "select" },
            options: ["xs", "sm", "default", "lg"],
        },
        tone: {
            control: { type: "select" },
            options: ["muted", "default", "starlight", "nebula", "flare"],
        },
        label: { control: { type: "text" } },
    },
} satisfies Meta<typeof Spinner>;

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
        <div class="flex flex-wrap items-center gap-4">{props.children}</div>
    </div>
);

export const Playground: Story = {
    args: { tone: "starlight" },
};

export const Sizes: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="xs">
                <Spinner size="xs" />
            </Row>
            <Row label="sm">
                <Spinner size="sm" />
            </Row>
            <Row label="default">
                <Spinner size="default" />
            </Row>
            <Row label="lg">
                <Spinner size="lg" />
            </Row>
        </Frame>
    ),
};

export const Tones: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="muted">
                <Spinner tone="muted" />
            </Row>
            <Row label="default">
                <Spinner tone="default" />
            </Row>
            <Row label="starlight">
                <Spinner tone="starlight" />
            </Row>
            <Row label="nebula">
                <Spinner tone="nebula" />
            </Row>
            <Row label="flare">
                <Spinner tone="flare" />
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
                    in context — common pairings
                </p>

                <div class="border border-void-700 bg-void-900 p-4">
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        inline status
                    </p>
                    <div class="space-y-2 text-sm text-void-300">
                        <p class="flex items-center gap-2">
                            <Spinner size="sm" tone="starlight" />
                            <span>Fetching remote…</span>
                        </p>
                        <p class="flex items-center gap-2">
                            <Spinner size="sm" tone="nebula" />
                            <span>Resolving 3 conflicts with utility model…</span>
                        </p>
                        <p class="flex items-center gap-2">
                            <Spinner size="xs" tone="muted" />
                            <span class="text-void-500">
                                Loading branches…
                            </span>
                        </p>
                    </div>
                </div>

                <div class="border border-void-700 bg-void-900 p-4">
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        button affordance
                    </p>
                    <div class="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            class="inline-flex h-8 cursor-pointer items-center gap-2 border border-starlight-400/40 bg-starlight-400/15 px-3 text-xs font-medium text-starlight-200"
                            disabled
                        >
                            <Spinner size="sm" tone="starlight" />
                            Working…
                        </button>
                        <button
                            type="button"
                            class="inline-flex h-8 cursor-pointer items-center gap-2 border border-void-700 bg-void-800 px-3 text-xs font-medium text-void-200"
                            disabled
                        >
                            <Spinner size="sm" />
                            Refreshing
                        </button>
                    </div>
                </div>

                <div class="border border-void-700 bg-void-900 p-4">
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        full-block loading
                    </p>
                    <div class="flex h-32 items-center justify-center border border-dashed border-void-700">
                        <div class="flex flex-col items-center gap-3">
                            <Spinner size="lg" tone="starlight" label="Loading" />
                            <span class="text-xs text-void-500">
                                Loading thread history
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ),
};
