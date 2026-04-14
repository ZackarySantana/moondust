import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { FileChangeRow } from "./file-change-row";

const meta = {
    title: "Review/FileChangeRow",
    component: FileChangeRow,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof FileChangeRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Modified: Story = {
    args: {
        path: "src/app/main.go",
        status: "M",
    },
};

export const Added: Story = {
    args: {
        path: "internal/newpkg/handler.go",
        status: "A",
    },
};

export const Untracked: Story = {
    args: {
        path: "notes.txt",
        status: "untracked",
    },
};
