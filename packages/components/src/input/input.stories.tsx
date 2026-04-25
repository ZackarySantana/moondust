import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Input, type InputProps } from "./input";

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
    render: (args: InputProps) => (
        <div class="w-72">
            <Input {...args} />
        </div>
    ),
};

export const WithValue: Story = {
    args: {
        value: "Read-only value",
        readOnly: true,
    },
    render: (args: InputProps) => (
        <div class="w-72">
            <Input {...args} />
        </div>
    ),
};

export const Disabled: Story = {
    args: {
        placeholder: "Disabled",
        disabled: true,
    },
    render: (args: InputProps) => (
        <div class="w-72">
            <Input {...args} />
        </div>
    ),
};

export const Email: Story = {
    args: {
        type: "email",
        placeholder: "you@example.com",
    },
    render: (args: InputProps) => (
        <div class="w-72">
            <Input {...args} />
        </div>
    ),
};

export const Password: Story = {
    args: {
        type: "password",
        value: "supersecret",
    },
    render: (args: InputProps) => (
        <div class="w-72">
            <Input {...args} />
        </div>
    ),
};

export const Stacked: Story = {
    render: () => (
        <div class="flex w-80 flex-col gap-3">
            <Input placeholder="Project name" />
            <Input placeholder="https://github.com/org/repo" />
            <Input
                value="origin/main"
                readOnly
            />
            <Input
                placeholder="Disabled"
                disabled
            />
        </div>
    ),
};
