import type { Meta, StoryObj } from "storybook-solidjs-vite";
import type { JSX } from "solid-js";

import { Text } from "./text";
import { Code } from "../code/code";
import { Separator } from "../separator/separator";

const meta = {
    title: "UI/Text",
    component: Text,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: [
                "display",
                "title",
                "subtitle",
                "body",
                "small",
                "eyebrow",
                "caption",
                "mono",
            ],
        },
        tone: {
            control: "select",
            options: [
                "default",
                "strong",
                "muted",
                "subtle",
                "starlight",
                "nebula",
                "flare",
            ],
        },
        weight: {
            control: "select",
            options: ["normal", "medium", "semibold"],
        },
        align: {
            control: "select",
            options: ["left", "center", "right"],
        },
        truncate: { control: "boolean" },
        as: {
            control: "select",
            options: [
                "p",
                "span",
                "div",
                "h1",
                "h2",
                "h3",
                "h4",
                "label",
                "small",
            ],
        },
    },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

const Row = (props: { label: string; children: JSX.Element }) => (
    <div class="grid grid-cols-[110px_1fr] items-center gap-6">
        <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
            {props.label}
        </span>
        <div class="flex flex-wrap items-baseline gap-4">{props.children}</div>
    </div>
);

const Frame = (props: { children: JSX.Element }) => (
    <div class="min-w-3xl bg-void-950 p-10">
        <div class="space-y-6">{props.children}</div>
    </div>
);

export const Playground: Story = {
    args: {
        children: "Refactor the router for clarity",
        variant: "body",
        tone: "default",
        weight: undefined,
        align: undefined,
        truncate: false,
        as: "p",
    },
};

export const Variants: Story = {
    render: () => (
        <Frame>
            <Row label="display">
                <Text
                    variant="display"
                    as="h1"
                >
                    Refactor router
                </Text>
            </Row>
            <Row label="title">
                <Text
                    variant="title"
                    as="h2"
                >
                    Refactor router
                </Text>
            </Row>
            <Row label="subtitle">
                <Text
                    variant="subtitle"
                    as="h3"
                >
                    24 messages · 2 minutes ago
                </Text>
            </Row>
            <Row label="body">
                <Text variant="body">
                    The router currently lives at{" "}
                    <Code tone="nebula">src/router.tsx</Code> and pulls in
                    @solidjs/router.
                </Text>
            </Row>
            <Row label="small">
                <Text variant="small">
                    2 local commits ahead of origin/main
                </Text>
            </Row>
            <Row label="eyebrow">
                <Text variant="eyebrow">moondust / threads</Text>
            </Row>
            <Row label="caption">
                <Text variant="caption">Section</Text>
            </Row>
            <Row label="mono">
                <Text variant="mono">~/code/moondust-companion</Text>
            </Row>
        </Frame>
    ),
};

export const Tones: Story = {
    render: () => (
        <Frame>
            <Row label="default">
                <Text>moondust automatically threads conversations.</Text>
            </Row>
            <Row label="strong">
                <Text tone="strong">moondust automatically threads.</Text>
            </Row>
            <Row label="subtle">
                <Text tone="subtle">moondust automatically threads.</Text>
            </Row>
            <Row label="muted">
                <Text tone="muted">Auto-saved 4 minutes ago</Text>
            </Row>
            <Row label="starlight">
                <Text tone="starlight">Connected to OpenRouter</Text>
            </Row>
            <Row label="nebula">
                <Text tone="nebula">claude-3.5-sonnet</Text>
            </Row>
            <Row label="flare">
                <Text tone="flare">2 checks failing on this branch</Text>
            </Row>
        </Frame>
    ),
};

export const Weights: Story = {
    render: () => (
        <Frame>
            <Row label="normal">
                <Text weight="normal">moondust-companion</Text>
            </Row>
            <Row label="medium">
                <Text weight="medium">moondust-companion</Text>
            </Row>
            <Row label="semibold">
                <Text weight="semibold">moondust-companion</Text>
            </Row>
        </Frame>
    ),
};

export const Alignment: Story = {
    render: () => (
        <Frame>
            <div class="space-y-3 border border-void-700 bg-void-900 p-4">
                <Text align="left">
                    Left-aligned: home base for most prose.
                </Text>
                <Text
                    align="center"
                    tone="muted"
                >
                    Centered: empty states, dialog headings.
                </Text>
                <Text
                    align="right"
                    variant="small"
                >
                    Right-aligned · footer metadata
                </Text>
            </div>
        </Frame>
    ),
};

export const Truncate: Story = {
    render: () => (
        <Frame>
            <Row label="no truncate">
                <div class="w-64 border border-void-700 bg-void-900 p-3">
                    <Text>
                        ~/code/moondust-companion/internal/v2/app/project.go
                    </Text>
                </div>
            </Row>
            <Row label="truncate">
                <div class="w-64 border border-void-700 bg-void-900 p-3">
                    <Text
                        truncate
                        variant="mono"
                    >
                        ~/code/moondust-companion/internal/v2/app/project.go
                    </Text>
                </div>
            </Row>
        </Frame>
    ),
};

export const PolymorphicTags: Story = {
    render: () => (
        <Frame>
            <Row label="h1">
                <Text
                    variant="display"
                    as="h1"
                >
                    moondust
                </Text>
            </Row>
            <Row label="h2">
                <Text
                    variant="title"
                    as="h2"
                >
                    Project settings
                </Text>
            </Row>
            <Row label="span">
                <Text
                    variant="body"
                    as="span"
                    tone="strong"
                >
                    inline span
                </Text>{" "}
                <Text
                    variant="body"
                    as="span"
                    tone="muted"
                >
                    next to muted span
                </Text>
            </Row>
            <Row label="label">
                <Text
                    variant="caption"
                    as="label"
                    for="story-input"
                >
                    Project name
                </Text>
            </Row>
            <Row label="small">
                <Text
                    variant="small"
                    as="small"
                    tone="muted"
                >
                    Last synced 4 minutes ago
                </Text>
            </Row>
        </Frame>
    ),
};

export const InContext: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-2xl space-y-10">
                <header>
                    <Text variant="eyebrow">moondust / status</Text>
                    <Text
                        variant="title"
                        as="h1"
                        class="mt-2"
                    >
                        Tool & runtime status
                    </Text>
                    <Text
                        variant="body"
                        tone="subtle"
                        class="mt-2"
                    >
                        What you have installed versus what’s current for the
                        Moondust stack and its dependencies.
                    </Text>
                    <Text
                        variant="small"
                        tone="muted"
                        class="mt-2"
                    >
                        Last checked · 2026-04-25 09:47
                    </Text>
                </header>

                <Separator />

                <section class="space-y-3">
                    <Text variant="caption">Section header</Text>
                    <div class="border border-void-700 bg-void-900 p-4">
                        <Text
                            variant="subtitle"
                            as="h3"
                        >
                            Refactor router
                        </Text>
                        <Text
                            variant="body"
                            tone="subtle"
                            class="mt-1"
                        >
                            The router currently lives at{" "}
                            <Code tone="nebula">src/router.tsx</Code> and pulls
                            in @solidjs/router.
                        </Text>
                        <div class="mt-3 flex items-center gap-3">
                            <Text variant="mono">main</Text>
                            <Text
                                variant="small"
                                tone="muted"
                            >
                                +24 −8
                            </Text>
                        </div>
                    </div>
                </section>

                <section class="space-y-1.5">
                    <Text variant="caption">Empty state</Text>
                    <div class="flex flex-col items-center gap-1 border border-void-700 bg-void-900 p-8 text-center">
                        <Text
                            variant="subtitle"
                            as="h3"
                        >
                            No threads yet
                        </Text>
                        <Text
                            variant="small"
                            tone="muted"
                        >
                            Start a conversation to see it here.
                        </Text>
                    </div>
                </section>
            </div>
        </div>
    ),
};
