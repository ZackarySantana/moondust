import { createSignal, type JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { ConfirmDialog } from "./confirm-dialog";
import { Button } from "../button/button";
import { Code } from "../code/code";

const meta = {
    title: "UI/ConfirmDialog",
    component: ConfirmDialog,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = (props: { children: JSX.Element }) => (
    <div class="min-h-screen min-w-3xl bg-void-950 p-10">
        <div class="space-y-6">{props.children}</div>
    </div>
);

const Caption = (props: { children: JSX.Element }) => (
    <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
        {props.children}
    </p>
);

export const Neutral: Story = {
    render: () => {
        const [open, setOpen] = createSignal(true);
        return (
            <Frame>
                <Caption>neutral confirm</Caption>
                <Button onClick={() => setOpen(true)}>Open</Button>
                <ConfirmDialog
                    open={open()}
                    title="Reset chat history?"
                    confirmLabel="Reset"
                    onConfirm={() => setOpen(false)}
                    onClose={() => setOpen(false)}
                >
                    The thread history will be cleared. Saved snapshots in{" "}
                    <Code tone="nebula">.moondust/</Code> are not affected.
                </ConfirmDialog>
            </Frame>
        );
    },
};

export const Danger: Story = {
    render: () => {
        const [open, setOpen] = createSignal(true);
        return (
            <Frame>
                <Caption>danger</Caption>
                <Button variant="destructive" onClick={() => setOpen(true)}>
                    Open
                </Button>
                <ConfirmDialog
                    open={open()}
                    tone="danger"
                    title="Delete this thread?"
                    confirmLabel="Delete"
                    onConfirm={() => setOpen(false)}
                    onClose={() => setOpen(false)}
                >
                    This will permanently remove{" "}
                    <Code tone="flare">refactor-router</Code> and its 24
                    messages. This action cannot be undone.
                </ConfirmDialog>
            </Frame>
        );
    },
};

export const Pending: Story = {
    render: () => (
        <Frame>
            <Caption>pending — buttons disabled, spinner shown</Caption>
            <ConfirmDialog
                open={true}
                tone="danger"
                title="Force-push to origin/main?"
                confirmLabel="Force-push"
                pending
                onConfirm={() => {
                    /* noop */
                }}
                onClose={() => {
                    /* noop */
                }}
            >
                Rewriting history on a shared branch can break other
                collaborators' work. Proceed only if you're sure.
            </ConfirmDialog>
        </Frame>
    ),
};

export const WithError: Story = {
    render: () => {
        const [open, setOpen] = createSignal(true);
        return (
            <Frame>
                <Caption>error from a previous attempt</Caption>
                <Button onClick={() => setOpen(true)}>Open</Button>
                <ConfirmDialog
                    open={open()}
                    tone="danger"
                    title="Discard unsaved changes?"
                    confirmLabel="Discard"
                    error="Could not stash changes — working tree is dirty in 3 files."
                    onConfirm={() => setOpen(false)}
                    onClose={() => setOpen(false)}
                >
                    Discarding will lose edits in{" "}
                    <Code tone="flare">src/router.ts</Code> and 2 other files.
                </ConfirmDialog>
            </Frame>
        );
    },
};

export const TitleOnly: Story = {
    render: () => {
        const [open, setOpen] = createSignal(true);
        return (
            <Frame>
                <Caption>compact — title only</Caption>
                <Button onClick={() => setOpen(true)}>Open</Button>
                <ConfirmDialog
                    open={open()}
                    title="Cancel rebase?"
                    confirmLabel="Cancel rebase"
                    cancelLabel="Keep going"
                    onConfirm={() => setOpen(false)}
                    onClose={() => setOpen(false)}
                />
            </Frame>
        );
    },
};

export const Interactive: Story = {
    render: () => {
        const [open, setOpen] = createSignal(false);
        return (
            <Frame>
                <Caption>full interactive flow</Caption>
                <Button variant="destructive" onClick={() => setOpen(true)}>
                    Delete thread
                </Button>
                <ConfirmDialog
                    open={open()}
                    tone="danger"
                    title="Delete this thread?"
                    confirmLabel="Delete"
                    onConfirm={() => setOpen(false)}
                    onClose={() => setOpen(false)}
                >
                    This will permanently remove{" "}
                    <Code tone="flare">refactor-router</Code> and its 24
                    messages.
                </ConfirmDialog>
            </Frame>
        );
    },
};
