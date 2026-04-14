import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { AssistantMessageForkButton } from "./assistant-message-fork-button";

const meta = {
    title: "Chat/AssistantMessageForkButton",
    component: AssistantMessageForkButton,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof AssistantMessageForkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WorktreeThread: Story = {
    args: {
        sourceUsesWorktree: true,
        forkPending: false,
        forkError: null,
        fork: async () => ({}),
    },
};

export const ProjectFolderThread: Story = {
    args: {
        sourceUsesWorktree: false,
        forkPending: false,
        forkError: null,
        fork: async () => ({}),
    },
};

export const Pending: Story = {
    args: {
        sourceUsesWorktree: true,
        forkPending: true,
        forkError: null,
        fork: async () => ({}),
    },
};

export const WithError: Story = {
    args: {
        sourceUsesWorktree: false,
        forkPending: false,
        forkError: new Error("Could not create worktree: branch exists"),
        fork: async () => {
            throw new Error("failed");
        },
    },
};
