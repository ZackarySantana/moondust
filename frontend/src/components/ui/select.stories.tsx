import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Label } from "./label";
import { Select } from "./select";

const meta = {
    title: "UI/Select",
    component: Select,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <div class="w-72 space-y-1">
            <Label for="story-select">Model</Label>
            <Select
                id="story-select"
                name="model"
            >
                <option value="">Choose a model…</option>
                <option value="gpt-4">gpt-4</option>
                <option value="claude-3-5-sonnet">claude-3.5-sonnet</option>
            </Select>
        </div>
    ),
};

export const Disabled: Story = {
    render: () => (
        <Select disabled>
            <option>Only option</option>
        </Select>
    ),
};
