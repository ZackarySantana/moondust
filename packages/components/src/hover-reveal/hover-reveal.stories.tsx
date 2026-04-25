import GitBranch from "lucide-solid/icons/git-branch";
import Pencil from "lucide-solid/icons/pencil";
import Plus from "lucide-solid/icons/plus";
import Trash2 from "lucide-solid/icons/trash-2";
import { For, type JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { HoverReveal } from "./hover-reveal";
import { IconButton } from "../icon-button/icon-button";
import { KbdHint } from "../kbd-hint/kbd-hint";

const meta = {
    title: "UI/HoverReveal",
    component: HoverReveal,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof HoverReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = (props: { children: JSX.Element }) => (
    <div class="min-w-3xl bg-void-950 p-10">
        <div class="space-y-8">{props.children}</div>
    </div>
);

const Caption = (props: { children: JSX.Element }) => (
    <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
        {props.children}
    </p>
);

export const Modes: Story = {
    render: () => (
        <Frame>
            <Caption>hover-focus (default)</Caption>
            <RowDemo mode="hover-focus" />

            <Caption>hover only</Caption>
            <RowDemo mode="hover" />

            <Caption>focus only — tab into the row</Caption>
            <RowDemo mode="focus" />
        </Frame>
    ),
};

export const Transitions: Story = {
    render: () => (
        <Frame>
            <Caption>opacity (default)</Caption>
            <RowDemo transition="opacity" />

            <Caption>fade-up</Caption>
            <RowDemo transition="fade-up" />

            <Caption>none</Caption>
            <RowDemo transition="none" />
        </Frame>
    ),
};

export const InContext: Story = {
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-2xl space-y-8">
                <Caption>sidebar list — hover any row</Caption>
                <ul class="border border-void-700 bg-void-900">
                    <SidebarRow name="Refactor router" branch="feature/router" />
                    <SidebarRow name="Fix flake in CI" branch="ci/retry" />
                    <SidebarRow
                        name="Wire up new auth flow"
                        branch="feature/login"
                    />
                </ul>

                <Caption>section header — hover for shortcut + add</Caption>
                <div class="border border-void-700 bg-void-900 p-2">
                    <div class="group flex items-center justify-between rounded-none px-2 py-1.5">
                        <span class="text-[11px] font-semibold uppercase tracking-widest text-void-500">
                            Projects
                        </span>
                        <span class="relative inline-flex items-center">
                            <HoverReveal class="mr-2">
                                <KbdHint combo="⌘+Shift+N" />
                            </HoverReveal>
                            <IconButton
                                aria-label="New project"
                                size="xs"
                            >
                                <Plus aria-hidden />
                            </IconButton>
                        </span>
                    </div>
                </div>

                <Caption>inline-editable affordance</Caption>
                <div class="border border-void-700 bg-void-900 p-3">
                    <div class="group flex items-center gap-2">
                        <span class="text-[13px] font-medium text-void-50">
                            Untitled thread
                        </span>
                        <HoverReveal>
                            <IconButton
                                aria-label="Rename"
                                size="xs"
                                tooltip="Rename"
                            >
                                <Pencil aria-hidden />
                            </IconButton>
                        </HoverReveal>
                    </div>
                </div>
            </div>
        </div>
    ),
};

const RowDemo = (props: {
    mode?: "hover" | "focus" | "hover-focus";
    transition?: "opacity" | "fade-up" | "none";
}) => (
    <div class="border border-void-700 bg-void-900">
        <For each={[1, 2, 3]}>
            {(i) => (
                <div class="group flex items-center justify-between border-b border-void-700 px-3 py-2 last:border-b-0 hover:bg-void-800/40">
                    <span class="text-[13px] text-void-200">
                        Row {i} — hover or focus me
                    </span>
                    <HoverReveal
                        mode={props.mode}
                        transition={props.transition}
                    >
                        <IconButton
                            aria-label="Delete"
                            size="xs"
                            variant="danger"
                        >
                            <Trash2 aria-hidden />
                        </IconButton>
                    </HoverReveal>
                </div>
            )}
        </For>
    </div>
);

const SidebarRow = (props: { name: string; branch: string }) => (
    <li class="group flex items-center gap-3 border-b border-void-700 px-3 py-2 last:border-b-0 hover:bg-void-800/40">
        <span class="min-w-0 flex-1">
            <span class="block truncate text-[13px] text-void-100">
                {props.name}
            </span>
            <span class="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-void-500">
                <GitBranch class="size-2.5" stroke-width={2} aria-hidden />
                {props.branch}
            </span>
        </span>
        <HoverReveal class="gap-1">
            <IconButton aria-label="Rename" size="xs" tooltip="Rename">
                <Pencil aria-hidden />
            </IconButton>
            <IconButton
                aria-label="Delete"
                size="xs"
                variant="danger"
                tooltip="Delete"
            >
                <Trash2 aria-hidden />
            </IconButton>
        </HoverReveal>
    </li>
);
