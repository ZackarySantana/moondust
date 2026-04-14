import type { Meta, StoryObj } from "storybook-solidjs-vite";
import type { CreateThreadPromptViewProps } from "./create-thread-prompt-view";
import { CreateThreadPromptView } from "./create-thread-prompt-view";

/**
 * Do not wrap in `MemoryRouter` for Storybook: Solid Router only mounts children
 * via `<Routes>` / `Route`. Arbitrary components as direct children of `MemoryRouter`
 * never render, so the dialog would stay blank.
 *
 * This view uses a plain `<a href="/settings/git">`; no router is required for preview.
 */

const meta = {
    title: "Modals/CreateThreadPromptView",
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

function story(props: CreateThreadPromptViewProps) {
    return <CreateThreadPromptView {...props} />;
}

export const Prompt: Story = {
    render: () =>
        story({
            open: true,
            phase: "prompt",
            useWorktree: false,
            error: "",
            pending: false,
            onWorktreeChange: noop,
            onConfirm: noop,
            onCancel: noop,
            onOverlayClick: noop,
        }),
};

export const PromptWorktree: Story = {
    name: "Prompt (worktree)",
    render: () =>
        story({
            open: true,
            phase: "prompt",
            useWorktree: true,
            error: "",
            pending: false,
            onWorktreeChange: noop,
            onConfirm: noop,
            onCancel: noop,
            onOverlayClick: noop,
        }),
};

export const PromptWithError: Story = {
    render: () =>
        story({
            open: true,
            phase: "prompt",
            useWorktree: false,
            error: "Could not reach Git: connection refused.",
            pending: false,
            onWorktreeChange: noop,
            onConfirm: noop,
            onCancel: noop,
            onOverlayClick: noop,
        }),
};

export const PromptPending: Story = {
    render: () =>
        story({
            open: true,
            phase: "prompt",
            useWorktree: false,
            error: "",
            pending: true,
            onWorktreeChange: noop,
            onConfirm: noop,
            onCancel: noop,
            onOverlayClick: noop,
        }),
};

export const Creating: Story = {
    render: () =>
        story({
            open: true,
            phase: "creating",
            useWorktree: false,
            error: "",
            pending: true,
            onWorktreeChange: noop,
            onConfirm: noop,
            onCancel: noop,
            onOverlayClick: noop,
        }),
};

export const CreatingWithWorktree: Story = {
    name: "Creating (worktree)",
    render: () =>
        story({
            open: true,
            phase: "creating",
            useWorktree: true,
            error: "",
            pending: true,
            onWorktreeChange: noop,
            onConfirm: noop,
            onCancel: noop,
            onOverlayClick: noop,
        }),
};
