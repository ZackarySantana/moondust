import type { JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import GitBranch from "lucide-solid/icons/git-branch";
import Save from "lucide-solid/icons/save";
import Trash2 from "lucide-solid/icons/trash-2";
import Settings from "lucide-solid/icons/settings";
import Info from "lucide-solid/icons/info";
import Plus from "lucide-solid/icons/plus";
import { Tooltip, type TooltipProps } from "./tooltip";
import { Button } from "../button/button";

const meta = {
    title: "UI/Tooltip",
    component: Tooltip,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    args: {
        content: "Tooltip body",
        side: "top",
        openDelay: 400,
        closeDelay: 80,
    },
    argTypes: {
        side: {
            control: { type: "select" },
            options: ["top", "right", "bottom", "left"],
        },
        openDelay: { control: { type: "number" } },
        closeDelay: { control: { type: "number" } },
        disabled: { control: { type: "boolean" } },
    },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = (props: { children: JSX.Element }) => (
    <div class="min-w-3xl bg-void-950 p-12">
        <div class="space-y-12">{props.children}</div>
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

export const Playground: Story = {
    render: (args: TooltipProps) => (
        <Tooltip {...args}>
            <Button>Hover me</Button>
        </Tooltip>
    ),
};

export const Sides: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="top">
                <Tooltip content="Above the trigger" side="top">
                    <Button variant="secondary">Top</Button>
                </Tooltip>
            </Row>
            <Row label="bottom">
                <Tooltip content="Below the trigger" side="bottom">
                    <Button variant="secondary">Bottom</Button>
                </Tooltip>
            </Row>
            <Row label="left">
                <Tooltip content="To the left of the trigger" side="left">
                    <Button variant="secondary">Left</Button>
                </Tooltip>
            </Row>
            <Row label="right">
                <Tooltip content="To the right of the trigger" side="right">
                    <Button variant="secondary">Right</Button>
                </Tooltip>
            </Row>
        </Frame>
    ),
};

export const WithShortcut: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="single key">
                <Tooltip content="Open command palette" shortcut={["⌘", "K"]}>
                    <Button>Command</Button>
                </Tooltip>
            </Row>
            <Row label="save">
                <Tooltip content="Save thread" shortcut={["⌘", "S"]}>
                    <Button>
                        <Save class="size-4" stroke-width={2} aria-hidden />
                        Save
                    </Button>
                </Tooltip>
            </Row>
            <Row label="three keys">
                <Tooltip
                    content="Force-fork from this point"
                    shortcut={["⌘", "⇧", "F"]}
                >
                    <Button variant="secondary">
                        <GitBranch
                            class="size-4"
                            stroke-width={2}
                            aria-hidden
                        />
                        Fork
                    </Button>
                </Tooltip>
            </Row>
            <Row label="destructive">
                <Tooltip
                    content="Delete project (cannot be undone)"
                    shortcut={["⌘", "⌫"]}
                >
                    <Button variant="destructive">
                        <Trash2 class="size-4" stroke-width={2} aria-hidden />
                        Delete
                    </Button>
                </Tooltip>
            </Row>
        </Frame>
    ),
};

export const IconButtons: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="toolbar">
                <div class="flex items-center gap-1 border border-void-700 bg-void-900 p-1">
                    <Tooltip content="New thread" shortcut={["⌘", "N"]}>
                        <Button variant="ghost" size="icon">
                            <Plus
                                class="size-4"
                                stroke-width={2}
                                aria-hidden
                            />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Fork from here" shortcut={["⌘", "F"]}>
                        <Button variant="ghost" size="icon">
                            <GitBranch
                                class="size-4"
                                stroke-width={2}
                                aria-hidden
                            />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Project settings" shortcut={["⌘", ","]}>
                        <Button variant="ghost" size="icon">
                            <Settings
                                class="size-4"
                                stroke-width={2}
                                aria-hidden
                            />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Show metadata" shortcut={["⌘", "I"]}>
                        <Button variant="ghost" size="icon">
                            <Info
                                class="size-4"
                                stroke-width={2}
                                aria-hidden
                            />
                        </Button>
                    </Tooltip>
                </div>
            </Row>
            <Row label="rich content">
                <Tooltip
                    content={
                        <span>
                            Pricing for{" "}
                            <code class="font-mono text-nebula-300">
                                claude-3.5-sonnet
                            </code>
                        </span>
                    }
                    shortcut={["⌘", "I"]}
                >
                    <Button variant="ghost" size="sm">
                        <Info
                            class="size-3.5"
                            stroke-width={2}
                            aria-hidden
                        />
                        $0.0124
                    </Button>
                </Tooltip>
            </Row>
        </Frame>
    ),
};

export const Delay: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="instant">
                <Tooltip content="Shows immediately" openDelay={0}>
                    <Button variant="secondary">openDelay = 0</Button>
                </Tooltip>
            </Row>
            <Row label="quick">
                <Tooltip content="Shows after 150ms" openDelay={150}>
                    <Button variant="secondary">openDelay = 150</Button>
                </Tooltip>
            </Row>
            <Row label="default">
                <Tooltip content="Shows after 400ms (default)">
                    <Button variant="secondary">default</Button>
                </Tooltip>
            </Row>
            <Row label="slow">
                <Tooltip content="Shows after 1000ms" openDelay={1000}>
                    <Button variant="secondary">openDelay = 1000</Button>
                </Tooltip>
            </Row>
        </Frame>
    ),
};

export const Disabled: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="enabled">
                <Tooltip content="This tooltip is enabled">
                    <Button>Hover</Button>
                </Tooltip>
            </Row>
            <Row label="disabled">
                <Tooltip content="This tooltip is disabled" disabled>
                    <Button>Hover (no tooltip)</Button>
                </Tooltip>
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
                    in context — toolbar over an assistant message
                </p>
                <article class="border border-void-700 bg-void-900">
                    <header class="flex items-center justify-between border-b border-void-700 px-4 py-2">
                        <div class="flex items-center gap-2">
                            <span class="size-1.5 bg-starlight-400" />
                            <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-400">
                                assistant
                            </span>
                            <code class="font-mono text-[11px] text-nebula-300">
                                claude-3.5-sonnet
                            </code>
                        </div>
                        <div class="flex items-center gap-0.5">
                            <Tooltip
                                content="Show usage details"
                                shortcut={["⌘", "I"]}
                                side="bottom"
                            >
                                <Button variant="ghost" size="icon">
                                    <Info
                                        class="size-3.5"
                                        stroke-width={2}
                                        aria-hidden
                                    />
                                </Button>
                            </Tooltip>
                            <Tooltip
                                content="Fork from this point"
                                shortcut={["⌘", "F"]}
                                side="bottom"
                            >
                                <Button variant="ghost" size="icon">
                                    <GitBranch
                                        class="size-3.5"
                                        stroke-width={2}
                                        aria-hidden
                                    />
                                </Button>
                            </Tooltip>
                        </div>
                    </header>
                    <div class="p-4 text-sm leading-relaxed text-void-200">
                        <p>
                            Hover the icons in the header to see tooltips.
                            They show the affordance name and a keyboard
                            shortcut, and shrug away on mouse-leave or Escape.
                        </p>
                    </div>
                </article>
                <p class="text-xs text-void-500">
                    Tooltips are CSS-positioned. If you anchor one near the
                    viewport edge, pass{" "}
                    <code class="font-mono text-[11px] text-void-300">
                        side="left"
                    </code>{" "}
                    or{" "}
                    <code class="font-mono text-[11px] text-void-300">
                        side="bottom"
                    </code>{" "}
                    to flip it. No floating-ui dependency.
                </p>
            </div>
        </div>
    ),
};
