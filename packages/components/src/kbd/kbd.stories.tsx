import type { Meta, StoryObj } from "storybook-solidjs-vite";
import type { JSX } from "solid-js";
import Search from "lucide-solid/icons/search";

import { Kbd } from "./kbd";
import { Input } from "../input/input";
import { Button } from "../button/button";

const meta = {
    title: "UI/Kbd",
    component: Kbd,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

const Row = (props: { label: string; children: JSX.Element }) => (
    <div class="grid grid-cols-[110px_1fr] items-center gap-6">
        <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
            {props.label}
        </span>
        <div class="flex flex-wrap items-center gap-3">{props.children}</div>
    </div>
);

const Frame = (props: { children: JSX.Element }) => (
    <div class="min-w-3xl bg-void-950 p-10">
        <div class="space-y-6">{props.children}</div>
    </div>
);

const Combo = (props: { keys: string[] }) => (
    <span class="inline-flex items-center gap-1">
        {props.keys.map((k) => (
            <Kbd>{k}</Kbd>
        ))}
    </span>
);

export const Default: Story = {
    render: () => <Kbd>K</Kbd>,
};

export const SingleKeys: Story = {
    render: () => (
        <Frame>
            <Row label="letters">
                <Kbd>K</Kbd>
                <Kbd>O</Kbd>
                <Kbd>P</Kbd>
                <Kbd>S</Kbd>
            </Row>
            <Row label="modifiers">
                <Kbd>⌘</Kbd>
                <Kbd>⌥</Kbd>
                <Kbd>⌃</Kbd>
                <Kbd>⇧</Kbd>
            </Row>
            <Row label="navigation">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                <Kbd>←</Kbd>
                <Kbd>→</Kbd>
            </Row>
            <Row label="control">
                <Kbd>↵</Kbd>
                <Kbd>⇥</Kbd>
                <Kbd>Esc</Kbd>
                <Kbd>Space</Kbd>
            </Row>
        </Frame>
    ),
};

export const Combos: Story = {
    render: () => (
        <Frame>
            <Row label="palette">
                <Combo keys={["⌘", "K"]} />
            </Row>
            <Row label="open project">
                <Combo keys={["⌘", "O"]} />
            </Row>
            <Row label="send">
                <Combo keys={["⌘", "↵"]} />
            </Row>
            <Row label="fork">
                <Combo keys={["⌘", "⇧", "F"]} />
            </Row>
            <Row label="dev tools">
                <Combo keys={["⌥", "⌘", "I"]} />
            </Row>
            <Row label="windows">
                <Combo keys={["Ctrl", "Shift", "P"]} />
            </Row>
        </Frame>
    ),
};

export const InProse: Story = {
    render: () => (
        <Frame>
            <Row label="inline">
                <p class="text-sm text-void-200">
                    Press <Kbd>⌘</Kbd>
                    <Kbd>K</Kbd> to open the command palette.
                </p>
            </Row>
            <Row label="hint">
                <p class="text-sm text-void-300">
                    Hold <Kbd>⌥</Kbd> while clicking to keep the modal open.
                </p>
            </Row>
            <Row label="paragraph">
                <p class="max-w-md text-sm leading-relaxed text-void-200">
                    Use <Kbd>⌘</Kbd>
                    <Kbd>↵</Kbd> to send. <Kbd>Esc</Kbd> dismisses the
                    composer. <Kbd>⌘</Kbd>
                    <Kbd>K</Kbd> jumps to a thread or file.
                </p>
            </Row>
        </Frame>
    ),
};

export const InContext: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-3xl space-y-8">
                <section>
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        Command palette trigger
                    </p>
                    <div class="border border-void-700 bg-void-900 p-3">
                        <div class="relative">
                            <Search
                                size={14}
                                class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-void-500"
                            />
                            <Input
                                type="search"
                                placeholder="Search threads, files, providers"
                                class="px-9"
                            />
                            <span class="pointer-events-none absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1">
                                <Combo keys={["⌘", "K"]} />
                            </span>
                        </div>
                    </div>
                </section>

                <section>
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        Shortcut sheet
                    </p>
                    <div class="divide-y divide-void-700 border border-void-700 bg-void-900">
                        <ShortcutRow label="Open command palette" combo={["⌘", "K"]} />
                        <ShortcutRow label="Open project" combo={["⌘", "O"]} />
                        <ShortcutRow label="New thread" combo={["⌘", "N"]} />
                        <ShortcutRow label="Send message" combo={["⌘", "↵"]} />
                        <ShortcutRow label="Fork from message" combo={["⌘", "⇧", "F"]} />
                        <ShortcutRow label="Toggle sidebar" combo={["⌘", "B"]} />
                        <ShortcutRow label="Search in thread" combo={["⌘", "F"]} />
                        <ShortcutRow label="Close" combo={["Esc"]} />
                    </div>
                </section>

                <section>
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        Buttons with shortcuts
                    </p>
                    <div class="flex items-center gap-2">
                        <Button variant="secondary">
                            Open project
                            <Combo keys={["⌘", "O"]} />
                        </Button>
                        <Button>
                            Send
                            <Combo keys={["⌘", "↵"]} />
                        </Button>
                        <Button variant="ghost">
                            Cancel
                            <Kbd>Esc</Kbd>
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    ),
};

const ShortcutRow = (props: { label: string; combo: string[] }) => (
    <div class="flex items-center justify-between px-4 py-2.5">
        <span class="text-sm text-void-200">{props.label}</span>
        <Combo keys={props.combo} />
    </div>
);
