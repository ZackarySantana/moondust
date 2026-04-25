import type { JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Code } from "./code";

const meta = {
    title: "UI/Code",
    component: Code,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    args: {
        children: "main",
        tone: "neutral",
        size: "default",
    },
    argTypes: {
        tone: {
            control: { type: "select" },
            options: ["neutral", "subtle", "starlight", "nebula", "flare"],
        },
        size: {
            control: { type: "select" },
            options: ["sm", "default"],
        },
    },
} satisfies Meta<typeof Code>;

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
        <div class="flex flex-wrap items-center gap-2">{props.children}</div>
    </div>
);

export const Playground: Story = {
    args: { children: "claude-3.5-sonnet", tone: "nebula" },
};

export const Tones: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="neutral">
                <Code>main</Code>
                <Code>~/.config/claude</Code>
                <Code>SIGTERM</Code>
            </Row>
            <Row label="subtle">
                <Code tone="subtle">npm run dev</Code>
                <Code tone="subtle">--no-verify</Code>
            </Row>
            <Row label="starlight">
                <Code tone="starlight">cost_usd</Code>
                <Code tone="starlight">primary</Code>
            </Row>
            <Row label="nebula">
                <Code tone="nebula">claude-3.5-sonnet</Code>
                <Code tone="nebula">feature/login</Code>
            </Row>
            <Row label="flare">
                <Code tone="flare">EACCES</Code>
                <Code tone="flare">deprecated</Code>
            </Row>
        </Frame>
    ),
};

export const Sizes: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="default">
                <Code>git push origin main</Code>
                <Code tone="nebula">main</Code>
                <Code tone="starlight">$0.0124</Code>
            </Row>
            <Row label="sm">
                <Code size="sm">git push origin main</Code>
                <Code size="sm" tone="nebula">
                    main
                </Code>
                <Code size="sm" tone="starlight">
                    $0.0124
                </Code>
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
                    in context — inline tokens in copy
                </p>

                <div class="border border-void-700 bg-void-900 p-5 text-sm leading-relaxed text-void-300">
                    <p>
                        Moondust scans Claude Code transcripts under{" "}
                        <Code>~/.claude/projects</Code> (and{" "}
                        <Code>~/.config/claude/projects</Code>), counting
                        assistant lines with token usage from files touched in
                        the last <Code tone="subtle">7</Code> days. Run{" "}
                        <Code tone="nebula">claude auth status --json</Code> in
                        a terminal to verify your account.
                    </p>
                    <p class="mt-3">
                        Set <Code tone="subtle">OPENROUTER_API_KEY</Code> in your
                        environment to enable cost reporting; otherwise totals
                        will display as <Code tone="flare">unknown</Code>.
                    </p>
                </div>

                <div class="border border-void-700 bg-void-900 p-5">
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        identifiers in lists
                    </p>
                    <ul class="divide-y divide-void-700">
                        <li class="flex items-center justify-between py-2 text-sm">
                            <span class="text-void-100">Last commit</span>
                            <Code tone="nebula" size="sm">
                                a1b2c3d
                            </Code>
                        </li>
                        <li class="flex items-center justify-between py-2 text-sm">
                            <span class="text-void-100">Branch</span>
                            <Code tone="nebula" size="sm">
                                feature/login-flow
                            </Code>
                        </li>
                        <li class="flex items-center justify-between py-2 text-sm">
                            <span class="text-void-100">Model</span>
                            <Code tone="nebula" size="sm">
                                claude-3.5-sonnet
                            </Code>
                        </li>
                        <li class="flex items-center justify-between py-2 text-sm">
                            <span class="text-void-100">Cost</span>
                            <Code tone="starlight" size="sm">
                                $0.0124
                            </Code>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    ),
};
