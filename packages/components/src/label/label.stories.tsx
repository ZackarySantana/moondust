import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Input } from "../input/input";
import { Label } from "./label";

const meta = {
    title: "UI/Label",
    component: Label,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: "Repository URL",
    },
};

export const WithInput: Story = {
    render: () => (
        <div class="w-72">
            <Label for="story-label-input">Repository URL</Label>
            <Input
                id="story-label-input"
                placeholder="https://github.com/org/repo"
            />
        </div>
    ),
};

export const InGrid: Story = {
    render: () => (
        <div class="grid w-[28rem] grid-cols-[10rem_1fr] items-center gap-3">
            <Label
                for="grid-name"
                class="mb-0 text-right"
            >
                Name
            </Label>
            <Input
                id="grid-name"
                placeholder="My project"
            />
            <Label
                for="grid-branch"
                class="mb-0 text-right"
            >
                Default branch
            </Label>
            <Input
                id="grid-branch"
                placeholder="origin/main"
            />
        </div>
    ),
};

export const CustomTone: Story = {
    render: () => (
        <div class="space-y-3 w-72">
            <Label class="text-emerald-400">Highlighted</Label>
            <Label class="text-red-400">Validation error</Label>
            <Label class="text-slate-600">Muted</Label>
        </div>
    ),
};
