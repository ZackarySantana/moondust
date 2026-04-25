import { createSignal, type JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import GitBranch from "lucide-solid/icons/git-branch";
import Bot from "lucide-solid/icons/bot";
import Settings from "lucide-solid/icons/settings";
import Wrench from "lucide-solid/icons/wrench";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Button } from "../button/button";
import { Badge } from "../badge/badge";
import { Separator } from "../separator/separator";

const meta = {
    title: "UI/Tabs",
    component: Tabs,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = (props: { children: JSX.Element; label?: string }) => (
    <div class="min-w-3xl bg-void-950 p-10">
        {props.label && (
            <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                {props.label}
            </p>
        )}
        <div class="space-y-10">{props.children}</div>
    </div>
);

const PanelBody = (props: { children: JSX.Element }) => (
    <div class="border border-t-0 border-void-700 bg-void-900 p-5 text-sm text-void-200">
        {props.children}
    </div>
);

export const Default: Story = {
    render: () => (
        <Frame label="default — underline variant">
            <Tabs defaultValue="general">
                <TabsList aria-label="Project settings">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="git">Git</TabsTrigger>
                    <TabsTrigger value="agent">Agent</TabsTrigger>
                    <TabsTrigger value="env">Environment</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                    <PanelBody>
                        Project name, path and default display preferences.
                    </PanelBody>
                </TabsContent>
                <TabsContent value="git">
                    <PanelBody>
                        Git integration, default branch, and worktree behavior.
                    </PanelBody>
                </TabsContent>
                <TabsContent value="agent">
                    <PanelBody>
                        Default model, tool permissions, and system prompt
                        defaults.
                    </PanelBody>
                </TabsContent>
                <TabsContent value="env">
                    <PanelBody>
                        Shell, package manager, and environment variables passed
                        to spawned commands.
                    </PanelBody>
                </TabsContent>
            </Tabs>
        </Frame>
    ),
};

export const Variants: Story = {
    render: () => (
        <Frame>
            <div>
                <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    underline
                </p>
                <Tabs defaultValue="overview">
                    <TabsList aria-label="Underline">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="usage">Usage</TabsTrigger>
                        <TabsTrigger value="changelog">Changelog</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                        <PanelBody>Overview panel content.</PanelBody>
                    </TabsContent>
                    <TabsContent value="usage">
                        <PanelBody>Usage panel content.</PanelBody>
                    </TabsContent>
                    <TabsContent value="changelog">
                        <PanelBody>Changelog panel content.</PanelBody>
                    </TabsContent>
                </Tabs>
            </div>

            <div>
                <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    segmented
                </p>
                <Tabs
                    defaultValue="diff"
                    variant="segmented"
                >
                    <TabsList aria-label="View mode">
                        <TabsTrigger value="diff">Diff</TabsTrigger>
                        <TabsTrigger value="rendered">Rendered</TabsTrigger>
                        <TabsTrigger value="raw">Raw</TabsTrigger>
                    </TabsList>
                    <TabsContent value="diff">
                        <PanelBody>Side-by-side diff.</PanelBody>
                    </TabsContent>
                    <TabsContent value="rendered">
                        <PanelBody>Rendered output.</PanelBody>
                    </TabsContent>
                    <TabsContent value="raw">
                        <PanelBody>Raw text.</PanelBody>
                    </TabsContent>
                </Tabs>
            </div>
        </Frame>
    ),
};

export const Sizes: Story = {
    render: () => (
        <Frame>
            <div>
                <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    default
                </p>
                <Tabs defaultValue="a">
                    <TabsList aria-label="Default size">
                        <TabsTrigger value="a">First</TabsTrigger>
                        <TabsTrigger value="b">Second</TabsTrigger>
                        <TabsTrigger value="c">Third</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <div>
                <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    sm
                </p>
                <Tabs
                    defaultValue="a"
                    size="sm"
                >
                    <TabsList aria-label="Small size">
                        <TabsTrigger value="a">First</TabsTrigger>
                        <TabsTrigger value="b">Second</TabsTrigger>
                        <TabsTrigger value="c">Third</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <div>
                <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    sm + segmented
                </p>
                <Tabs
                    defaultValue="a"
                    size="sm"
                    variant="segmented"
                >
                    <TabsList aria-label="Small segmented">
                        <TabsTrigger value="a">Diff</TabsTrigger>
                        <TabsTrigger value="b">Raw</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </Frame>
    ),
};

export const WithIcons: Story = {
    render: () => (
        <Frame label="triggers can host icons and badges">
            <Tabs defaultValue="general">
                <TabsList aria-label="Project settings">
                    <TabsTrigger value="general">
                        <Settings
                            class="size-3.5"
                            stroke-width={2}
                            aria-hidden
                        />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="git">
                        <GitBranch
                            class="size-3.5"
                            stroke-width={2}
                            aria-hidden
                        />
                        Git
                        <Badge
                            size="sm"
                            mono
                        >
                            12
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="agent">
                        <Bot
                            class="size-3.5"
                            stroke-width={2}
                            aria-hidden
                        />
                        Agent
                    </TabsTrigger>
                    <TabsTrigger value="env">
                        <Wrench
                            class="size-3.5"
                            stroke-width={2}
                            aria-hidden
                        />
                        Environment
                        <Badge
                            size="sm"
                            tone="flare"
                        >
                            !2
                        </Badge>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                    <PanelBody>General settings.</PanelBody>
                </TabsContent>
                <TabsContent value="git">
                    <PanelBody>12 file changes pending review.</PanelBody>
                </TabsContent>
                <TabsContent value="agent">
                    <PanelBody>Agent configuration.</PanelBody>
                </TabsContent>
                <TabsContent value="env">
                    <PanelBody>2 environment issues to resolve.</PanelBody>
                </TabsContent>
            </Tabs>
        </Frame>
    ),
};

export const Disabled: Story = {
    render: () => (
        <Frame label="individual triggers can be disabled">
            <Tabs defaultValue="general">
                <TabsList aria-label="Settings sections">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="git">Git</TabsTrigger>
                    <TabsTrigger
                        value="agent"
                        disabled
                    >
                        Agent (Pro)
                    </TabsTrigger>
                    <TabsTrigger
                        value="env"
                        disabled
                    >
                        Environment (Pro)
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                    <PanelBody>General is reachable.</PanelBody>
                </TabsContent>
                <TabsContent value="git">
                    <PanelBody>Git is reachable.</PanelBody>
                </TabsContent>
            </Tabs>
        </Frame>
    ),
};

export const Controlled: Story = {
    render: () => {
        const [tab, setTab] = createSignal("a");
        return (
            <Frame label="controlled — value lives in the parent">
                <div class="flex items-center gap-2">
                    <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        external value
                    </span>
                    <Badge mono>{tab()}</Badge>
                    <Separator
                        orientation="vertical"
                        class="h-4"
                    />
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setTab("a")}
                    >
                        a
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setTab("b")}
                    >
                        b
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setTab("c")}
                    >
                        c
                    </Button>
                </div>
                <Tabs
                    value={tab()}
                    onValueChange={setTab}
                >
                    <TabsList aria-label="Controlled tabs">
                        <TabsTrigger value="a">Tab A</TabsTrigger>
                        <TabsTrigger value="b">Tab B</TabsTrigger>
                        <TabsTrigger value="c">Tab C</TabsTrigger>
                    </TabsList>
                    <TabsContent value="a">
                        <PanelBody>Panel A.</PanelBody>
                    </TabsContent>
                    <TabsContent value="b">
                        <PanelBody>Panel B.</PanelBody>
                    </TabsContent>
                    <TabsContent value="c">
                        <PanelBody>Panel C.</PanelBody>
                    </TabsContent>
                </Tabs>
            </Frame>
        );
    },
};

export const InContext: Story = {
    parameters: { layout: "fullscreen" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-4xl">
                <header class="mb-6">
                    <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-starlight-400">
                        moondust / project / settings
                    </p>
                    <h1 class="mt-2 text-3xl font-semibold tracking-tight text-void-50">
                        moondust-companion
                    </h1>
                    <code class="mt-1 block font-mono text-[12px] text-void-400">
                        ~/code/moondust-companion
                    </code>
                </header>

                <Tabs defaultValue="git">
                    <TabsList aria-label="Project settings">
                        <TabsTrigger value="general">
                            <Settings
                                class="size-3.5"
                                stroke-width={2}
                                aria-hidden
                            />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="git">
                            <GitBranch
                                class="size-3.5"
                                stroke-width={2}
                                aria-hidden
                            />
                            Git
                            <Badge
                                size="sm"
                                mono
                            >
                                12
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="agent">
                            <Bot
                                class="size-3.5"
                                stroke-width={2}
                                aria-hidden
                            />
                            Agent
                        </TabsTrigger>
                        <TabsTrigger value="env">
                            <Wrench
                                class="size-3.5"
                                stroke-width={2}
                                aria-hidden
                            />
                            Environment
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                        <PanelBody>
                            <SettingRow
                                label="Display name"
                                value="moondust-companion"
                            />
                            <SettingRow
                                label="Path"
                                value="~/code/moondust-companion"
                                mono
                            />
                            <SettingRow
                                label="Created"
                                value="3 days ago"
                                muted
                            />
                        </PanelBody>
                    </TabsContent>

                    <TabsContent value="git">
                        <PanelBody>
                            <SettingRow
                                label="Default branch"
                                value="main"
                                mono
                            />
                            <SettingRow
                                label="Worktree mode"
                                value="On every fork"
                            />
                            <SettingRow
                                label="Auto-stage"
                                value="Disabled"
                                muted
                            />
                            <Separator class="my-4" />
                            <p class="text-[12px] text-void-400">
                                12 file changes pending review.{" "}
                                <a
                                    href="#"
                                    class="text-nebula-300 underline-offset-4 hover:underline"
                                >
                                    Open Git review
                                </a>
                                .
                            </p>
                        </PanelBody>
                    </TabsContent>

                    <TabsContent value="agent">
                        <PanelBody>
                            <SettingRow
                                label="Default provider"
                                value="Anthropic"
                            />
                            <SettingRow
                                label="Default model"
                                value="claude-3.5-sonnet"
                                mono
                            />
                            <SettingRow
                                label="System prompt"
                                value="(project default)"
                                muted
                            />
                        </PanelBody>
                    </TabsContent>

                    <TabsContent value="env">
                        <PanelBody>
                            <SettingRow
                                label="Shell"
                                value="zsh"
                                mono
                            />
                            <SettingRow
                                label="Package manager"
                                value="bun@1.3.13"
                                mono
                            />
                            <SettingRow
                                label="Variables"
                                value="3 defined"
                            />
                        </PanelBody>
                    </TabsContent>
                </Tabs>

                <p class="mt-4 text-xs text-void-500">
                    Use{" "}
                    <code class="font-mono text-[11px] text-void-300">←</code>
                    {" / "}
                    <code class="font-mono text-[11px] text-void-300">
                        →
                    </code>{" "}
                    to move between tabs,{" "}
                    <code class="font-mono text-[11px] text-void-300">
                        Home
                    </code>
                    {" / "}
                    <code class="font-mono text-[11px] text-void-300">
                        End
                    </code>{" "}
                    for first/last.
                </p>
            </div>
        </div>
    ),
};

const SettingRow = (props: {
    label: string;
    value: string;
    mono?: boolean;
    muted?: boolean;
}) => (
    <div class="grid grid-cols-[160px_1fr] items-baseline gap-6 border-b border-void-700/60 py-2 last:border-b-0">
        <span class="font-mono text-[10px] uppercase tracking-[0.14em] text-void-500">
            {props.label}
        </span>
        <span
            class={
                (props.mono ? "font-mono text-[12px] " : "text-[13px] ") +
                (props.muted ? "text-void-500" : "text-void-100")
            }
        >
            {props.value}
        </span>
    </div>
);
