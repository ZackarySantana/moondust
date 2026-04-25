import Bell from "lucide-solid/icons/bell";
import Copy from "lucide-solid/icons/copy";
import GitBranch from "lucide-solid/icons/git-branch";
import PanelBottom from "lucide-solid/icons/panel-bottom";
import PanelRight from "lucide-solid/icons/panel-right";
import Plus from "lucide-solid/icons/plus";
import RefreshCw from "lucide-solid/icons/refresh-cw";
import Search from "lucide-solid/icons/search";
import Settings from "lucide-solid/icons/settings";
import Trash2 from "lucide-solid/icons/trash-2";
import X from "lucide-solid/icons/x";
import type { JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { IconButton } from "./icon-button";

const meta = {
    title: "UI/IconButton",
    component: IconButton,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    args: {
        "aria-label": "Refresh",
        variant: "ghost",
        size: "default",
    },
    argTypes: {
        variant: {
            control: { type: "select" },
            options: ["ghost", "solid", "outline", "danger"],
        },
        size: {
            control: { type: "select" },
            options: ["xs", "sm", "default", "lg"],
        },
        loading: { control: { type: "boolean" } },
        disabled: { control: { type: "boolean" } },
        tooltip: { control: { type: "text" } },
    },
    render: (args) => (
        <IconButton {...args}>
            <RefreshCw aria-hidden />
        </IconButton>
    ),
} satisfies Meta<typeof IconButton>;

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
    args: {
        "aria-label": "Refresh",
        tooltip: "Refresh",
    },
};

export const Variants: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="ghost">
                <IconButton aria-label="Search" variant="ghost">
                    <Search aria-hidden />
                </IconButton>
                <IconButton aria-label="Refresh" variant="ghost">
                    <RefreshCw aria-hidden />
                </IconButton>
                <IconButton aria-label="Open settings" variant="ghost">
                    <Settings aria-hidden />
                </IconButton>
            </Row>
            <Row label="solid">
                <IconButton aria-label="Search" variant="solid">
                    <Search aria-hidden />
                </IconButton>
                <IconButton aria-label="Refresh" variant="solid">
                    <RefreshCw aria-hidden />
                </IconButton>
                <IconButton aria-label="Open settings" variant="solid">
                    <Settings aria-hidden />
                </IconButton>
            </Row>
            <Row label="outline">
                <IconButton aria-label="Search" variant="outline">
                    <Search aria-hidden />
                </IconButton>
                <IconButton aria-label="Refresh" variant="outline">
                    <RefreshCw aria-hidden />
                </IconButton>
                <IconButton aria-label="Open settings" variant="outline">
                    <Settings aria-hidden />
                </IconButton>
            </Row>
            <Row label="danger">
                <IconButton aria-label="Delete" variant="danger">
                    <Trash2 aria-hidden />
                </IconButton>
                <IconButton aria-label="Dismiss" variant="danger">
                    <X aria-hidden />
                </IconButton>
            </Row>
        </Frame>
    ),
};

export const Sizes: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="xs">
                <IconButton aria-label="Plus" size="xs">
                    <Plus aria-hidden />
                </IconButton>
                <IconButton aria-label="Plus" size="xs" variant="solid">
                    <Plus aria-hidden />
                </IconButton>
            </Row>
            <Row label="sm">
                <IconButton aria-label="Plus" size="sm">
                    <Plus aria-hidden />
                </IconButton>
                <IconButton aria-label="Plus" size="sm" variant="solid">
                    <Plus aria-hidden />
                </IconButton>
            </Row>
            <Row label="default">
                <IconButton aria-label="Plus" size="default">
                    <Plus aria-hidden />
                </IconButton>
                <IconButton aria-label="Plus" size="default" variant="solid">
                    <Plus aria-hidden />
                </IconButton>
            </Row>
            <Row label="lg">
                <IconButton aria-label="Plus" size="lg">
                    <Plus aria-hidden />
                </IconButton>
                <IconButton aria-label="Plus" size="lg" variant="solid">
                    <Plus aria-hidden />
                </IconButton>
            </Row>
        </Frame>
    ),
};

export const States: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="idle">
                <IconButton aria-label="Refresh">
                    <RefreshCw aria-hidden />
                </IconButton>
                <IconButton aria-label="Refresh" variant="solid">
                    <RefreshCw aria-hidden />
                </IconButton>
            </Row>
            <Row label="loading">
                <IconButton aria-label="Refreshing" loading>
                    <RefreshCw aria-hidden />
                </IconButton>
                <IconButton aria-label="Refreshing" variant="solid" loading>
                    <RefreshCw aria-hidden />
                </IconButton>
            </Row>
            <Row label="disabled">
                <IconButton aria-label="Refresh" disabled>
                    <RefreshCw aria-hidden />
                </IconButton>
                <IconButton aria-label="Refresh" variant="solid" disabled>
                    <RefreshCw aria-hidden />
                </IconButton>
            </Row>
        </Frame>
    ),
};

export const WithTooltip: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                hover or focus the buttons
            </p>
            <Row label="label">
                <IconButton aria-label="Search" tooltip="Search">
                    <Search aria-hidden />
                </IconButton>
                <IconButton aria-label="Refresh" tooltip="Refresh threads">
                    <RefreshCw aria-hidden />
                </IconButton>
            </Row>
            <Row label="with shortcut">
                <IconButton
                    aria-label="New project"
                    tooltip="New project"
                    tooltipShortcut={["⌘", "N"]}
                >
                    <Plus aria-hidden />
                </IconButton>
                <IconButton
                    aria-label="Toggle terminal"
                    tooltip="Toggle terminal"
                    tooltipShortcut={["⌘", "J"]}
                >
                    <PanelBottom aria-hidden />
                </IconButton>
                <IconButton
                    aria-label="Toggle git pane"
                    tooltip="Toggle git pane"
                    tooltipShortcut={["⌘", "B"]}
                >
                    <PanelRight aria-hidden />
                </IconButton>
            </Row>
            <Row label="sides">
                <IconButton
                    aria-label="Top"
                    tooltip="Top"
                    tooltipSide="top"
                >
                    <Bell aria-hidden />
                </IconButton>
                <IconButton
                    aria-label="Right"
                    tooltip="Right"
                    tooltipSide="right"
                >
                    <Bell aria-hidden />
                </IconButton>
                <IconButton
                    aria-label="Bottom"
                    tooltip="Bottom"
                    tooltipSide="bottom"
                >
                    <Bell aria-hidden />
                </IconButton>
                <IconButton
                    aria-label="Left"
                    tooltip="Left"
                    tooltipSide="left"
                >
                    <Bell aria-hidden />
                </IconButton>
            </Row>
        </Frame>
    ),
};

export const InContext: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-3xl space-y-6">
                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    in context — toolbars and headers
                </p>

                <header class="flex items-center justify-between border border-void-700 bg-void-900 px-4 py-2.5">
                    <div class="min-w-0">
                        <p class="text-sm font-medium text-void-50">
                            Refactor router
                        </p>
                        <p class="mt-0.5 text-xs text-void-500">
                            in <span class="text-void-300">moondust</span>
                        </p>
                    </div>
                    <div class="flex shrink-0 items-center gap-1">
                        <IconButton
                            aria-label="Toggle terminal"
                            size="sm"
                            tooltip="Toggle terminal"
                            tooltipShortcut={["⌘", "J"]}
                        >
                            <PanelBottom aria-hidden />
                        </IconButton>
                        <IconButton
                            aria-label="Toggle git pane"
                            size="sm"
                            tooltip="Toggle git pane"
                            tooltipShortcut={["⌘", "B"]}
                        >
                            <PanelRight aria-hidden />
                        </IconButton>
                        <IconButton
                            aria-label="Thread settings"
                            size="sm"
                            tooltip="Thread settings"
                        >
                            <Settings aria-hidden />
                        </IconButton>
                        <IconButton
                            aria-label="Delete thread"
                            size="sm"
                            variant="danger"
                            tooltip="Delete thread"
                        >
                            <Trash2 aria-hidden />
                        </IconButton>
                    </div>
                </header>

                <div class="border border-void-700 bg-void-900 p-4">
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        copy field with action
                    </p>
                    <div class="flex items-center gap-2">
                        <code class="flex h-9 min-w-0 flex-1 items-center border border-void-700 bg-void-950 px-3 font-mono text-xs text-void-300">
                            sk-or-v1-•••••••••••••••••••••••••••••
                        </code>
                        <IconButton
                            aria-label="Copy API key"
                            tooltip="Copy"
                            variant="outline"
                        >
                            <Copy aria-hidden />
                        </IconButton>
                    </div>
                </div>

                <div class="border border-void-700 bg-void-900 p-4">
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        sidebar group with hover affordance
                    </p>
                    <div class="group/group flex items-center justify-between rounded-none px-2 py-1.5 transition-colors hover:bg-void-800/40">
                        <span class="flex items-center gap-2 text-sm text-void-100">
                            <GitBranch
                                class="size-3.5 text-void-400"
                                stroke-width={2}
                                aria-hidden
                            />
                            <span>moondust</span>
                        </span>
                        <span class="opacity-0 transition-opacity group-hover/group:opacity-100">
                            <IconButton
                                aria-label="New thread in moondust"
                                size="xs"
                                tooltip="New thread"
                                tooltipShortcut={["⌘", "T"]}
                            >
                                <Plus aria-hidden />
                            </IconButton>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    ),
};
