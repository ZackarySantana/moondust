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

export const Default: Story = {
    args: {
        onFork: () => {},
    },
};

export const SlowFork: Story = {
    args: {
        onFork: () => new Promise((r) => setTimeout(r, 1500)),
    },
};

export const CustomCopy: Story = {
    args: {
        onFork: () => new Promise((r) => setTimeout(r, 600)),
        title: "Branch from here?",
        description:
            "We'll spin up a fresh worktree from this message so you can explore an alternate path.",
        confirmLabel: "Branch",
    },
};

export const InMessageRow: Story = {
    render: () => (
        <div class="flex max-w-md items-center gap-2 rounded-lg border border-slate-800/40 bg-app-panel px-3 py-2 text-sm text-slate-300">
            <span class="flex-1">Sure, here's the refactor you asked for…</span>
            <AssistantMessageForkButton
                onFork={() => new Promise((r) => setTimeout(r, 700))}
            />
        </div>
    ),
};
