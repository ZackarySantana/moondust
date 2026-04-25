import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Kbd } from "./kbd";

const meta = {
    title: "UI/Kbd",
    component: Kbd,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <Kbd>⌘K</Kbd>,
};

export const Combo: Story = {
    render: () => (
        <span class="inline-flex items-center gap-1">
            <Kbd>Ctrl</Kbd>
            <Kbd>Shift</Kbd>
            <Kbd>P</Kbd>
        </span>
    ),
};

export const Inline: Story = {
    render: () => (
        <p class="text-sm text-void-300">
            Press <Kbd>⌘</Kbd>
            <Kbd>K</Kbd> to open the command palette.
        </p>
    ),
};

export const Row: Story = {
    render: () => (
        <div class="flex items-center gap-3 text-sm text-void-300">
            <span>Move</span>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <span>Open</span>
            <Kbd>Enter</Kbd>
            <span>Close</span>
            <Kbd>Esc</Kbd>
        </div>
    ),
};
