import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import {
    BranchCommitGitDialog,
    CommitStagedGitDialog,
    DiscardUnstagedGitDialog,
} from "./git-review-dialogs";

const meta = {
    title: "Modals/Git review",
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DiscardUnstaged: Story = {
    render: () => (
        <DiscardUnstagedGitDialog
            open
            pending={false}
            error=""
            onClose={() => {}}
            onConfirm={() => {}}
        />
    ),
};

export const DiscardUnstagedPending: Story = {
    name: "Discard unstaged (pending)",
    render: () => (
        <DiscardUnstagedGitDialog
            open
            pending
            error=""
            onClose={() => {}}
            onConfirm={() => {}}
        />
    ),
};

export const DiscardUnstagedError: Story = {
    name: "Discard unstaged (error)",
    render: () => (
        <DiscardUnstagedGitDialog
            open
            pending={false}
            error="git checkout failed: permission denied"
            onClose={() => {}}
            onConfirm={() => {}}
        />
    ),
};

export const CommitStaged: Story = {
    render: () => (
        <CommitStagedGitDialog
            open
            message="Fix typo in README"
            pending={false}
            error=""
            onMessage={() => {}}
            onClose={() => {}}
            onConfirm={() => {}}
        />
    ),
};

export const CommitStagedPending: Story = {
    name: "Commit staged (pending)",
    render: () => (
        <CommitStagedGitDialog
            open
            message="WIP"
            pending
            error=""
            onMessage={() => {}}
            onClose={() => {}}
            onConfirm={() => {}}
        />
    ),
};

export const BranchCommit: Story = {
    render: () => (
        <BranchCommitGitDialog
            open
            branchName="feature/thread-42"
            commitMessage="Initial commit on branch"
            pending={false}
            error=""
            onBranchName={() => {}}
            onCommitMessage={() => {}}
            onClose={() => {}}
            onConfirm={() => {}}
        />
    ),
};

export const BranchCommitInteractive: Story = {
    name: "Branch commit (interactive)",
    render: () => {
        const [branch, setBranch] = createSignal("feature/my-change");
        const [msg, setMsg] = createSignal("Describe your change");
        return (
            <BranchCommitGitDialog
                open
                branchName={branch()}
                commitMessage={msg()}
                pending={false}
                error=""
                onBranchName={setBranch}
                onCommitMessage={setMsg}
                onClose={() => {}}
                onConfirm={() => {}}
            />
        );
    },
};
