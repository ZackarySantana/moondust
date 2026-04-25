import ArrowLeft from "lucide-solid/icons/arrow-left";
import GitBranch from "lucide-solid/icons/git-branch";
import PanelBottom from "lucide-solid/icons/panel-bottom";
import PanelRight from "lucide-solid/icons/panel-right";
import Plus from "lucide-solid/icons/plus";
import RefreshCw from "lucide-solid/icons/refresh-cw";
import Settings from "lucide-solid/icons/settings";
import Trash2 from "lucide-solid/icons/trash-2";
import { For, type JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { PaneHeader } from "./pane-header";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { IconButton } from "../icon-button/icon-button";
import { StatusDot } from "../status-dot/status-dot";

const meta = {
    title: "UI/PaneHeader",
    component: PaneHeader,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof PaneHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = (props: { children: JSX.Element }) => (
    <div class="min-w-3xl bg-void-950 p-10">
        <div class="space-y-6">{props.children}</div>
    </div>
);

const Caption = (props: { children: JSX.Element }) => (
    <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
        {props.children}
    </p>
);

const Pane = (props: { children: JSX.Element }) => (
    <div class="overflow-hidden border border-void-700 bg-void-900">
        {props.children}
    </div>
);

export const Sizes: Story = {
    render: () => (
        <Frame>
            <Caption>default</Caption>
            <Pane>
                <PaneHeader
                    eyebrow="Thread"
                    title="Refactor router"
                    subtitle="in moondust · 24 messages"
                    actions={
                        <>
                            <IconButton aria-label="Settings">
                                <Settings aria-hidden />
                            </IconButton>
                            <IconButton aria-label="Delete" variant="danger">
                                <Trash2 aria-hidden />
                            </IconButton>
                        </>
                    }
                />
                <FakeBody />
            </Pane>

            <Caption>sm</Caption>
            <Pane>
                <PaneHeader
                    size="sm"
                    title="Files"
                    subtitle="12 changed"
                    actions={
                        <IconButton aria-label="Refresh" size="sm">
                            <RefreshCw aria-hidden />
                        </IconButton>
                    }
                />
                <FakeBody />
            </Pane>
        </Frame>
    ),
};

export const Composition: Story = {
    render: () => (
        <Frame>
            <Caption>title only</Caption>
            <Pane>
                <PaneHeader title="Settings" />
                <FakeBody />
            </Pane>

            <Caption>title + subtitle</Caption>
            <Pane>
                <PaneHeader
                    title="Refactor router"
                    subtitle="in moondust · 24 messages"
                />
                <FakeBody />
            </Pane>

            <Caption>eyebrow + title + actions</Caption>
            <Pane>
                <PaneHeader
                    eyebrow="Project"
                    title="moondust"
                    actions={
                        <Button size="sm" variant="ghost">
                            <Plus class="size-3.5" stroke-width={2} aria-hidden />
                            New thread
                        </Button>
                    }
                />
                <FakeBody />
            </Pane>

            <Caption>leading slot — back button</Caption>
            <Pane>
                <PaneHeader
                    leading={
                        <IconButton aria-label="Back" size="sm">
                            <ArrowLeft aria-hidden />
                        </IconButton>
                    }
                    title="Provider settings"
                />
                <FakeBody />
            </Pane>

            <Caption>leading slot — status dot + badge actions</Caption>
            <Pane>
                <PaneHeader
                    leading={
                        <StatusDot tone="starlight" size="default" pulse />
                    }
                    title="moondust"
                    subtitle="3 active threads"
                    actions={
                        <Badge tone="starlight" dot size="sm">
                            Live
                        </Badge>
                    }
                />
                <FakeBody />
            </Pane>
        </Frame>
    ),
};

export const Toolbars: Story = {
    render: () => (
        <Frame>
            <Caption>thread header — full toolbar</Caption>
            <Pane>
                <PaneHeader
                    eyebrow="Thread"
                    title="Refactor router"
                    subtitle="in moondust"
                    leading={
                        <StatusDot tone="nebula" pulse label="Streaming" />
                    }
                    actions={
                        <>
                            <Badge tone="nebula" mono size="sm">
                                claude-3.5-sonnet
                            </Badge>
                            <Badge tone="starlight" mono size="sm">
                                $0.0124
                            </Badge>
                            <span class="mx-1 h-4 w-px bg-void-700" />
                            <IconButton
                                aria-label="Toggle terminal"
                                size="sm"
                                tooltip="Terminal"
                                tooltipShortcut={["⌘", "J"]}
                            >
                                <PanelBottom aria-hidden />
                            </IconButton>
                            <IconButton
                                aria-label="Toggle git pane"
                                size="sm"
                                tooltip="Git pane"
                                tooltipShortcut={["⌘", "B"]}
                            >
                                <PanelRight aria-hidden />
                            </IconButton>
                            <IconButton
                                aria-label="Settings"
                                size="sm"
                                tooltip="Thread settings"
                            >
                                <Settings aria-hidden />
                            </IconButton>
                            <IconButton
                                aria-label="Delete"
                                variant="danger"
                                size="sm"
                                tooltip="Delete thread"
                            >
                                <Trash2 aria-hidden />
                            </IconButton>
                        </>
                    }
                />
                <FakeBody />
            </Pane>

            <Caption>diff pane — file context</Caption>
            <Pane>
                <PaneHeader
                    size="sm"
                    leading={
                        <GitBranch
                            class="size-3.5 text-nebula-300"
                            stroke-width={2}
                            aria-hidden
                        />
                    }
                    title="src/router.ts"
                    subtitle="+24 −8"
                    actions={
                        <>
                            <IconButton aria-label="Previous file" size="sm">
                                <ArrowLeft aria-hidden />
                            </IconButton>
                            <IconButton aria-label="Next file" size="sm">
                                <ArrowLeft
                                    class="rotate-180"
                                    aria-hidden
                                />
                            </IconButton>
                        </>
                    }
                />
                <FakeBody />
            </Pane>
        </Frame>
    ),
};

export const Sticky: Story = {
    render: () => (
        <Frame>
            <Caption>sticky — scroll the pane to see the header pin</Caption>
            <div class="h-72 overflow-auto border border-void-700 bg-void-900">
                <PaneHeader
                    sticky
                    eyebrow="Thread"
                    title="Refactor router"
                    subtitle="24 messages"
                    actions={
                        <Badge tone="starlight" dot size="sm">
                            Live
                        </Badge>
                    }
                />
                <div class="space-y-3 p-4 text-sm text-void-300">
                    <For each={Array.from({ length: 12 })}>
                        {(_, i) => (
                            <p class="leading-relaxed">
                                Message {i() + 1} — sample content to make this
                                pane scroll. Lorem ipsum dolor sit amet,
                                consectetur adipiscing elit. Quisque velit
                                nibh, gravida vel placerat eget.
                            </p>
                        )}
                    </For>
                </div>
            </div>
        </Frame>
    ),
};

const FakeBody = () => (
    <div class="space-y-2 p-4 text-xs text-void-500">
        <p>// pane body…</p>
        <p>// content lives here</p>
    </div>
);
