import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Label } from "../label/label";
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
        <div class="w-72">
            <Select>
                <option>Default</option>
                <option>Compact</option>
                <option>Comfortable</option>
            </Select>
        </div>
    ),
};

export const WithLabel: Story = {
    render: () => (
        <div class="w-72 space-y-1">
            <Label for="select-provider">Provider</Label>
            <Select id="select-provider">
                <option value="openrouter">OpenRouter</option>
                <option value="cursor">Cursor</option>
                <option value="claude">Claude Code</option>
            </Select>
        </div>
    ),
};

export const Disabled: Story = {
    render: () => (
        <div class="w-72">
            <Select disabled>
                <option>Cannot change</option>
            </Select>
        </div>
    ),
};

export const ManyOptions: Story = {
    render: () => (
        <div class="w-72">
            <Select>
                {Array.from({ length: 12 }, (_, i) => (
                    <option value={`opt-${i}`}>Option {i + 1}</option>
                ))}
            </Select>
        </div>
    ),
};
