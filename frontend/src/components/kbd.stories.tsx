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

export const Shortcut: Story = {
    args: {
        combo: "⌘K",
    },
};

export const Empty: Story = {
    args: {
        combo: "",
    },
};

export const InSentence: Story = {
    render: () => (
        <p class="text-sm text-slate-300">
            Press
            <Kbd combo="Ctrl+Shift+P" />
            to open the palette.
        </p>
    ),
};
