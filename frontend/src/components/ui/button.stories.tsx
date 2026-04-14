import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button } from "./button";

const meta = {
    title: "UI/Button",
    component: Button,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: [
                "default",
                "destructive",
                "outline",
                "secondary",
                "ghost",
                "link",
                "icon",
            ],
        },
        size: {
            control: "select",
            options: ["default", "sm", "lg", "icon"],
        },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: "Button",
    },
};

export const Destructive: Story = {
    args: {
        variant: "destructive",
        children: "Delete",
    },
};

export const Outline: Story = {
    args: {
        variant: "outline",
        children: "Outline",
    },
};
