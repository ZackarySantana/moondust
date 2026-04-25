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
    args: { combo: "⌘K" },
};

export const Combo: Story = {
    args: { combo: "Ctrl+Shift+P" },
};

export const Inline: Story = {
    render: () => (
        <p class="text-sm text-slate-300">
            Press <Kbd combo="⌘K" /> to open the command palette.
        </p>
    ),
};

export const Row: Story = {
    render: () => (
        <div class="flex items-center gap-3 text-sm text-slate-300">
            <span>Move</span>
            <Kbd combo="↑" />
            <Kbd combo="↓" />
            <span>Open</span>
            <Kbd combo="Enter" />
            <span>Close</span>
            <Kbd combo="Esc" />
        </div>
    ),
};

export const Empty: Story = {
    args: { combo: "" },
    parameters: {
        docs: {
            description: { story: "Renders nothing when combo is empty." },
        },
    },
};
