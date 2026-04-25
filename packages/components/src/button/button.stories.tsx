import type { Meta, StoryObj } from "storybook-solidjs-vite";
import type { JSX } from "solid-js";
import ArrowRight from "lucide-solid/icons/arrow-right";
import Check from "lucide-solid/icons/check";
import FolderOpen from "lucide-solid/icons/folder-open";
import GitBranch from "lucide-solid/icons/git-branch";
import Plus from "lucide-solid/icons/plus";
import Save from "lucide-solid/icons/save";
import Send from "lucide-solid/icons/send";
import Settings from "lucide-solid/icons/settings";
import Trash2 from "lucide-solid/icons/trash-2";
import X from "lucide-solid/icons/x";

import { Button } from "./button";
import { Kbd } from "../kbd/kbd";

const meta = {
    title: "UI/Button",
    component: Button,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: [
                "default",
                "destructive",
                "outline",
                "secondary",
                "ghost",
                "link",
                "icon",
            ],
        },
        size: {
            control: "select",
            options: ["default", "sm", "lg", "icon"],
        },
        disabled: { control: "boolean" },
    },
} satisfies Meta<typeof Button>;

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

export const Playground: Story = {
    args: {
        children: "Save thread",
        variant: "default",
        size: "default",
        disabled: false,
    },
};

export const Variants: Story = {
    render: () => (
        <Frame>
            <Row label="default">
                <Button>Save thread</Button>
            </Row>
            <Row label="destructive">
                <Button variant="destructive">
                    <Trash2 size={14} />
                    Delete project
                </Button>
            </Row>
            <Row label="outline">
                <Button variant="outline">Cancel</Button>
            </Row>
            <Row label="secondary">
                <Button variant="secondary">
                    <FolderOpen size={14} />
                    Open project
                </Button>
            </Row>
            <Row label="ghost">
                <Button variant="ghost">Skip for now</Button>
            </Row>
            <Row label="link">
                <Button variant="link">View on GitHub</Button>
            </Row>
            <Row label="icon">
                <Button variant="icon" size="icon" aria-label="Settings">
                    <Settings size={14} />
                </Button>
            </Row>
        </Frame>
    ),
};

export const Sizes: Story = {
    render: () => (
        <Frame>
            <Row label="sm">
                <Button size="sm">Save</Button>
                <Button size="sm" variant="secondary">
                    <Plus size={12} />
                    Add file
                </Button>
                <Button size="sm" variant="outline">
                    Cancel
                </Button>
            </Row>
            <Row label="default">
                <Button>Save thread</Button>
                <Button variant="secondary">
                    <Plus size={14} />
                    Add file
                </Button>
                <Button variant="outline">Cancel</Button>
            </Row>
            <Row label="lg">
                <Button size="lg">Continue</Button>
                <Button size="lg" variant="secondary">
                    <FolderOpen size={16} />
                    Open project
                </Button>
                <Button size="lg" variant="outline">
                    Cancel
                </Button>
            </Row>
            <Row label="icon">
                <Button size="icon" aria-label="Confirm">
                    <Check size={14} />
                </Button>
                <Button
                    size="icon"
                    variant="secondary"
                    aria-label="Settings"
                >
                    <Settings size={14} />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Close"
                >
                    <X size={14} />
                </Button>
                <Button
                    size="icon"
                    variant="destructive"
                    aria-label="Delete"
                >
                    <Trash2 size={14} />
                </Button>
            </Row>
        </Frame>
    ),
};

export const WithIcon: Story = {
    render: () => (
        <Frame>
            <Row label="leading">
                <Button>
                    <Save size={14} />
                    Save thread
                </Button>
                <Button variant="secondary">
                    <GitBranch size={14} />
                    New thread
                </Button>
                <Button variant="outline">
                    <Plus size={14} />
                    Add provider
                </Button>
            </Row>
            <Row label="trailing">
                <Button>
                    Continue
                    <ArrowRight size={14} />
                </Button>
                <Button variant="link">
                    Read more
                    <ArrowRight size={12} />
                </Button>
            </Row>
            <Row label="both">
                <Button variant="secondary">
                    <FolderOpen size={14} />
                    moondust-companion
                    <ArrowRight size={14} />
                </Button>
            </Row>
        </Frame>
    ),
};

export const WithShortcut: Story = {
    render: () => (
        <Frame>
            <Row label="trailing kbd">
                <Button variant="secondary">
                    Open project
                    <span class="inline-flex items-center gap-1">
                        <Kbd>⌘</Kbd>
                        <Kbd>O</Kbd>
                    </span>
                </Button>
                <Button>
                    <Send size={14} />
                    Send
                    <span class="inline-flex items-center gap-1">
                        <Kbd>⌘</Kbd>
                        <Kbd>↵</Kbd>
                    </span>
                </Button>
            </Row>
            <Row label="ghost row">
                <Button variant="ghost">
                    Fork from here
                    <span class="inline-flex items-center gap-1">
                        <Kbd>⌘</Kbd>
                        <Kbd>K</Kbd>
                    </span>
                </Button>
                <Button variant="ghost">
                    Discard
                    <Kbd>Esc</Kbd>
                </Button>
            </Row>
        </Frame>
    ),
};

export const IconOnly: Story = {
    render: () => (
        <Frame>
            <Row label="primary">
                <Button size="icon" aria-label="Confirm">
                    <Check size={14} />
                </Button>
            </Row>
            <Row label="secondary">
                <Button
                    size="icon"
                    variant="secondary"
                    aria-label="New thread"
                >
                    <GitBranch size={14} />
                </Button>
            </Row>
            <Row label="outline">
                <Button
                    size="icon"
                    variant="outline"
                    aria-label="Add file"
                >
                    <Plus size={14} />
                </Button>
            </Row>
            <Row label="ghost">
                <Button size="icon" variant="ghost" aria-label="Settings">
                    <Settings size={14} />
                </Button>
                <Button size="icon" variant="ghost" aria-label="Close">
                    <X size={14} />
                </Button>
            </Row>
            <Row label="icon">
                <Button size="icon" variant="icon" aria-label="Settings">
                    <Settings size={14} />
                </Button>
            </Row>
            <Row label="destructive">
                <Button
                    size="icon"
                    variant="destructive"
                    aria-label="Delete"
                >
                    <Trash2 size={14} />
                </Button>
            </Row>
        </Frame>
    ),
};

export const States: Story = {
    render: () => (
        <Frame>
            <Row label="default">
                <Button>Save thread</Button>
                <Button disabled>Save thread</Button>
            </Row>
            <Row label="destructive">
                <Button variant="destructive">
                    <Trash2 size={14} />
                    Delete project
                </Button>
                <Button variant="destructive" disabled>
                    <Trash2 size={14} />
                    Delete project
                </Button>
            </Row>
            <Row label="secondary">
                <Button variant="secondary">Open project</Button>
                <Button variant="secondary" disabled>
                    Open project
                </Button>
            </Row>
            <Row label="outline">
                <Button variant="outline">Cancel</Button>
                <Button variant="outline" disabled>
                    Cancel
                </Button>
            </Row>
            <Row label="ghost">
                <Button variant="ghost">Skip</Button>
                <Button variant="ghost" disabled>
                    Skip
                </Button>
            </Row>
            <Row label="link">
                <Button variant="link">View on GitHub</Button>
                <Button variant="link" disabled>
                    View on GitHub
                </Button>
            </Row>
        </Frame>
    ),
};

export const InContext: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-2xl space-y-8">
                <div>
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        Toolbar
                    </p>
                    <div class="flex items-center justify-between border border-void-700 bg-void-900 px-4 py-2">
                        <div class="flex items-center gap-1">
                            <Button size="sm" variant="ghost">
                                File
                            </Button>
                            <Button size="sm" variant="ghost">
                                Edit
                            </Button>
                            <Button size="sm" variant="ghost">
                                View
                            </Button>
                        </div>
                        <div class="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                                <GitBranch size={12} />
                                main
                            </Button>
                            <Button size="sm">
                                <Send size={12} />
                                Send
                            </Button>
                        </div>
                    </div>
                </div>

                <div>
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        Form actions
                    </p>
                    <div class="flex items-center justify-between border-t border-void-700 bg-void-900 px-5 py-4">
                        <Button variant="ghost">
                            <X size={14} />
                            Cancel
                        </Button>
                        <div class="flex items-center gap-2">
                            <Button variant="outline">Save draft</Button>
                            <Button>
                                <Save size={14} />
                                Create project
                            </Button>
                        </div>
                    </div>
                </div>

                <div>
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        Destructive confirm
                    </p>
                    <div class="border border-void-700 bg-void-900 p-5">
                        <h3 class="mb-2 text-sm font-semibold tracking-tight text-void-50">
                            Delete project moondust-companion?
                        </h3>
                        <p class="mb-5 text-sm leading-relaxed text-void-300">
                            This removes the project from Moondust. Your files
                            on disk are not touched.
                        </p>
                        <div class="flex items-center justify-end gap-2">
                            <Button variant="ghost">Cancel</Button>
                            <Button variant="destructive">
                                <Trash2 size={14} />
                                Delete project
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ),
};
