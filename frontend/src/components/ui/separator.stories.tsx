import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Separator } from "./separator";

const meta = {
    title: "UI/Separator",
    component: Separator,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
    render: () => (
        <div class="w-64 space-y-3 text-sm text-slate-300">
            <p>Above</p>
            <Separator />
            <p>Below</p>
        </div>
    ),
};

export const Vertical: Story = {
    render: () => (
        <div class="flex h-16 items-stretch gap-3 text-sm text-slate-300">
            <span class="flex items-center">Left</span>
            <Separator orientation="vertical" />
            <span class="flex items-center">Right</span>
        </div>
    ),
};
