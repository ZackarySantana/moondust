import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal } from "solid-js";
import MessageSquare from "lucide-solid/icons/message-square";
import GitDiff from "lucide-solid/icons/file-diff";
import Folder from "lucide-solid/icons/folder";
import Globe from "lucide-solid/icons/globe";
import Terminal from "lucide-solid/icons/terminal";
import FlaskConical from "lucide-solid/icons/flask-conical";

import { ViewSwitcher } from "./view-switcher";

const meta = {
    title: "Layout/ViewSwitcher",
    component: ViewSwitcher,
    parameters: { layout: "padded", backgrounds: { value: "panel" } },
    tags: ["autodocs"],
} satisfies Meta<typeof ViewSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS = [
    {
        id: "chat",
        label: "Chat",
        icon: MessageSquare,
        shortcut: ["⌘", "1"] as const,
    },
    { id: "diff", label: "Diff", icon: GitDiff, shortcut: ["⌘", "2"] as const },
    {
        id: "files",
        label: "Files",
        icon: Folder,
        shortcut: ["⌘", "3"] as const,
    },
    {
        id: "browser",
        label: "Browser",
        icon: Globe,
        shortcut: ["⌘", "4"] as const,
    },
    {
        id: "terminal",
        label: "Terminal",
        icon: Terminal,
        shortcut: ["⌘", "5"] as const,
    },
    {
        id: "tests",
        label: "Tests",
        icon: FlaskConical,
        shortcut: ["⌘", "6"] as const,
        disabled: true,
    },
];

export const Chip: Story = {
    render: () => {
        const [active, setActive] = createSignal("chat");
        return (
            <div class="bg-void-900 border border-void-700 p-2 max-w-3xl">
                <ViewSwitcher
                    aria-label="Thread views"
                    items={ITEMS}
                    activeId={active()}
                    onChange={setActive}
                />
            </div>
        );
    },
};

export const Tab: Story = {
    render: () => {
        const [active, setActive] = createSignal("diff");
        return (
            <div class="bg-void-900 border border-void-700 max-w-3xl">
                <ViewSwitcher
                    aria-label="Thread views"
                    items={ITEMS}
                    activeId={active()}
                    onChange={setActive}
                    variant="tab"
                />
            </div>
        );
    },
};

export const NoIcons: Story = {
    render: () => {
        const [active, setActive] = createSignal("self");
        return (
            <div class="bg-void-900 border border-void-700 p-2 max-w-3xl">
                <ViewSwitcher
                    aria-label="Review tabs"
                    items={[
                        { id: "self", label: "Self-review" },
                        { id: "cross", label: "Cross-review" },
                        { id: "human", label: "Human comments" },
                    ]}
                    activeId={active()}
                    onChange={setActive}
                />
            </div>
        );
    },
};
