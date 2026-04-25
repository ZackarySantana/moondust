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
        <div class="w-72 space-y-3 text-sm text-slate-300">
            <p>Section above</p>
            <Separator />
            <p>Section below</p>
        </div>
    ),
};

export const Vertical: Story = {
    render: () => (
        <div class="flex h-10 items-center gap-3 text-sm text-slate-300">
            <span>Left</span>
            <Separator orientation="vertical" />
            <span>Middle</span>
            <Separator orientation="vertical" />
            <span>Right</span>
        </div>
    ),
};

export const InCard: Story = {
    render: () => (
        <div class="w-80 rounded-xl border border-slate-800/60 bg-app-panel p-5">
            <h3 class="text-sm font-semibold text-slate-100">Settings</h3>
            <p class="mt-1 text-xs text-slate-500">Group divider example</p>
            <Separator class="my-4" />
            <div class="space-y-2 text-[13px] text-slate-300">
                <p>Item one</p>
                <p>Item two</p>
                <p>Item three</p>
            </div>
        </div>
    ),
};

export const StrongContrast: Story = {
    render: () => (
        <div class="w-72 space-y-3 text-sm text-slate-300">
            <p>Above</p>
            <Separator class="bg-slate-700/70" />
            <p>Below</p>
        </div>
    ),
};
