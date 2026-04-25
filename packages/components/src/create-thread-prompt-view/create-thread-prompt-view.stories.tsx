import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { CreateThreadPromptView } from "./create-thread-prompt-view";

const meta = {
    title: "Modals/CreateThreadPromptView",
    component: CreateThreadPromptView,
    parameters: { layout: "fullscreen" },
    tags: ["autodocs"],
} satisfies Meta<typeof CreateThreadPromptView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Prompt: Story = {
    args: {
        open: true,
        phase: "prompt",
        useWorktree: true,
        error: "",
        pending: false,
        onWorktreeChange: () => {},
        onConfirm: () => {},
        onCancel: () => {},
        onOverlayClick: () => {},
    },
};

export const PromptNoWorktree: Story = {
    args: {
        open: true,
        phase: "prompt",
        useWorktree: false,
        error: "",
        pending: false,
        onWorktreeChange: () => {},
        onConfirm: () => {},
        onCancel: () => {},
        onOverlayClick: () => {},
    },
};

export const PromptWithError: Story = {
    args: {
        open: true,
        phase: "prompt",
        useWorktree: true,
        error: "Could not create worktree: branch already exists.",
        pending: false,
        onWorktreeChange: () => {},
        onConfirm: () => {},
        onCancel: () => {},
        onOverlayClick: () => {},
    },
};

export const Creating: Story = {
    args: {
        open: true,
        phase: "creating",
        useWorktree: true,
        error: "",
        pending: true,
        onWorktreeChange: () => {},
        onConfirm: () => {},
        onCancel: () => {},
        onOverlayClick: () => {},
    },
};

export const WithHelper: Story = {
    args: {
        open: true,
        phase: "prompt",
        useWorktree: true,
        error: "",
        pending: false,
        helperHint: (
            <>
                You can set a default in{" "}
                <a
                    href="#settings"
                    class="text-emerald-500 hover:underline"
                >
                    Settings → Git
                </a>
                .
            </>
        ),
        onWorktreeChange: () => {},
        onConfirm: () => {},
        onCancel: () => {},
        onOverlayClick: () => {},
    },
};

export const Interactive: Story = {
    render: () => {
        const [useWorktree, setUseWorktree] = createSignal(true);
        const [phase, setPhase] = createSignal<"prompt" | "creating">("prompt");
        return (
            <CreateThreadPromptView
                open
                phase={phase()}
                useWorktree={useWorktree()}
                error=""
                pending={phase() === "creating"}
                onWorktreeChange={setUseWorktree}
                onConfirm={() => {
                    setPhase("creating");
                    setTimeout(() => setPhase("prompt"), 1500);
                }}
                onCancel={() => {}}
                onOverlayClick={() => {}}
            />
        );
    },
};
