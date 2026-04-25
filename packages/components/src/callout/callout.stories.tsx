import GitBranch from "lucide-solid/icons/git-branch";
import KeyRound from "lucide-solid/icons/key-round";
import type { JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Callout } from "./callout";
import { Code } from "../code/code";

const meta = {
    title: "UI/Callout",
    component: Callout,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
    args: {
        tone: "info",
        title: "Heads up",
        children: "This is a callout body. It explains the situation in a sentence.",
    },
    argTypes: {
        tone: {
            control: { type: "select" },
            options: ["info", "success", "warn", "danger", "neutral"],
        },
    },
} satisfies Meta<typeof Callout>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = (props: { children: JSX.Element }) => (
    <div class="min-w-3xl bg-void-950 p-10">
        <div class="mx-auto max-w-2xl space-y-4">{props.children}</div>
    </div>
);

export const Playground: Story = {};

export const Tones: Story = {
    render: () => (
        <Frame>
            <Callout tone="info" title="Heads up">
                Moondust will fetch the remote before applying any changes.
            </Callout>
            <Callout tone="success" title="Connected">
                Claude Code CLI (<Code tone="starlight">claude</Code>) detected.
            </Callout>
            <Callout tone="warn" title="Sign in required">
                Run <Code tone="flare">claude auth login</Code> in a terminal.
            </Callout>
            <Callout tone="danger" title="Rebase failed">
                Could not rebase onto <Code tone="flare">origin/main</Code> —
                merge conflicts in 3 files.
            </Callout>
            <Callout tone="neutral" title="No usage yet">
                No assistant usage in recently touched transcript files (last 7
                days).
            </Callout>
        </Frame>
    ),
};

export const TitleOnly: Story = {
    render: () => (
        <Frame>
            <Callout tone="info" title="No body — just a single line of context." />
            <Callout
                tone="warn"
                title="Connection lost — reconnecting…"
            />
            <Callout tone="success" title="Saved." />
        </Frame>
    ),
};

export const BodyOnly: Story = {
    render: () => (
        <Frame>
            <Callout tone="neutral">
                Plain body without a heading. Use this for inline help text
                that is too long for a tooltip but doesn't need a title.
            </Callout>
            <Callout tone="info">
                Moondust scans Claude Code transcripts under{" "}
                <Code tone="nebula">~/.claude/projects</Code> and counts
                assistant lines with token usage from files touched in the last
                7 days.
            </Callout>
        </Frame>
    ),
};

export const CustomIcon: Story = {
    render: () => (
        <Frame>
            <Callout tone="info" title="Custom icon" icon={KeyRound}>
                Set <Code tone="nebula">OPENROUTER_API_KEY</Code> to enable cost
                reporting.
            </Callout>
            <Callout
                tone="neutral"
                title="No icon"
                icon={false}
            >
                Sometimes you want a callout without any leading glyph at all.
            </Callout>
        </Frame>
    ),
};

export const WithActions: Story = {
    render: () => (
        <Frame>
            <Callout
                tone="warn"
                title="Provider not configured"
                actions={
                    <>
                        <button
                            type="button"
                            class="inline-flex h-7 cursor-pointer items-center border border-flare-400/40 bg-flare-500/15 px-3 text-[11px] font-medium text-flare-100 transition-colors hover:bg-flare-500/25"
                        >
                            Open settings
                        </button>
                        <button
                            type="button"
                            class="inline-flex h-7 cursor-pointer items-center px-3 text-[11px] font-medium text-flare-200 transition-colors hover:text-flare-100"
                        >
                            Learn more
                        </button>
                    </>
                }
            >
                Add an OpenRouter key under Settings → Providers to start
                routing requests.
            </Callout>

            <Callout
                tone="info"
                title="Branch is behind origin"
                icon={GitBranch}
                actions={
                    <button
                        type="button"
                        class="inline-flex h-7 cursor-pointer items-center border border-nebula-400/30 bg-nebula-500/15 px-3 text-[11px] font-medium text-nebula-100 transition-colors hover:bg-nebula-500/25"
                    >
                        Pull
                    </button>
                }
            >
                <Code tone="nebula">feature/login</Code> is 4 commits behind{" "}
                <Code tone="nebula">origin/main</Code>.
            </Callout>
        </Frame>
    ),
};

export const Dismissible: Story = {
    render: () => (
        <Frame>
            <Callout
                tone="success"
                title="Saved"
                onDismiss={() => {
                    /* noop in story */
                }}
            >
                Your settings were saved successfully.
            </Callout>
            <Callout
                tone="warn"
                title="Unsaved changes"
                onDismiss={() => {
                    /* noop in story */
                }}
            >
                You have edits in this form that will be lost if you navigate
                away.
            </Callout>
        </Frame>
    ),
};

export const InContext: Story = {
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-3xl space-y-6">
                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    in context — git wizard panel
                </p>

                <div class="border border-void-700 bg-void-900 p-4">
                    <div class="space-y-3">
                        <p class="text-sm font-medium text-void-100">
                            Rebase onto
                        </p>
                        <div class="rounded-none border border-void-700 bg-void-950 px-3 py-2 font-mono text-xs text-void-200">
                            origin/main
                        </div>

                        <Callout
                            tone="info"
                            title="Resolving 3 conflicts with utility model…"
                            icon={GitBranch}
                        />

                        <Callout
                            tone="success"
                            title="Rebase complete"
                        />
                    </div>
                </div>

                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    in context — settings tab
                </p>

                <div class="border border-void-700 bg-void-900 p-5 space-y-4">
                    <h3 class="text-sm font-semibold text-void-50">
                        OpenRouter
                    </h3>
                    <Callout tone="warn" title="No API key set">
                        Add a key under Settings → Providers to enable cost
                        reporting and access higher-tier models.
                    </Callout>
                    <p class="text-xs text-void-500">
                        Once set, your key is stored in the OS keychain and
                        never leaves this device.
                    </p>
                </div>
            </div>
        </div>
    ),
};
