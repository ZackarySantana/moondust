import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Label } from "./label";
import { Input } from "./input";

const meta = {
    title: "UI/Input",
    component: Input,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        placeholder: "Type something…",
    },
};

export const WithValue: Story = {
    args: {
        value: "Read-only value",
        readOnly: true,
    },
};

export const Disabled: Story = {
    args: {
        placeholder: "Disabled",
        disabled: true,
    },
};

export const WithLabel: Story = {
    render: () => (
        <div class="w-72 space-y-1">
            <Label for="story-input">Repository URL</Label>
            <Input
                id="story-input"
                placeholder="https://github.com/org/repo"
            />
        </div>
    ),
};
