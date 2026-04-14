import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Input } from "./input";
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
    render: () => <Label for="story-label-field">Field label</Label>,
};

export const WithInput: Story = {
    render: () => (
        <div class="w-72 space-y-1">
            <Label for="lbl-in">API key</Label>
            <Input
                id="lbl-in"
                type="password"
                placeholder="sk-or-…"
                autocomplete="off"
            />
        </div>
    ),
};
