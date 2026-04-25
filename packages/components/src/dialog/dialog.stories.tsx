import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button } from "../button/button";
import { Input } from "../input/input";
import { Label } from "../label/label";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTitle,
} from "./dialog";

const meta = {
    title: "Modals/Dialog",
    parameters: { layout: "fullscreen" },
    tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Shell: Story = {
    render: () => (
        <Dialog
            open
            onEscapeKeyDown={() => {}}
        >
            <DialogOverlay
                aria-label="Close"
                onClick={() => {}}
            />
            <DialogContent>
                <DialogTitle>Example dialog</DialogTitle>
                <p class="mb-4 text-sm text-slate-400">
                    Low-level primitives: overlay, panel, title. Product modals
                    compose these with form content.
                </p>
                <div class="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                    >
                        Cancel
                    </Button>
                    <Button type="button">OK</Button>
                </div>
            </DialogContent>
        </Dialog>
    ),
};

export const Destructive: Story = {
    render: () => (
        <Dialog
            open
            onEscapeKeyDown={() => {}}
        >
            <DialogOverlay
                aria-label="Close"
                onClick={() => {}}
            />
            <DialogContent>
                <DialogTitle>Delete project?</DialogTitle>
                <p class="mb-4 text-sm text-slate-400">
                    This will remove the project and all of its threads from
                    Moondust. This cannot be undone.
                </p>
                <div class="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                    >
                        Delete project
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    ),
};

export const WithForm: Story = {
    render: () => (
        <Dialog
            open
            onEscapeKeyDown={() => {}}
        >
            <DialogOverlay
                aria-label="Close"
                onClick={() => {}}
            />
            <DialogContent>
                <DialogTitle>New project</DialogTitle>
                <form class="space-y-4">
                    <div class="space-y-1.5">
                        <Label for="dlg-name">Name</Label>
                        <Input
                            id="dlg-name"
                            placeholder="My project"
                        />
                    </div>
                    <div class="space-y-1.5">
                        <Label for="dlg-url">Repository URL</Label>
                        <Input
                            id="dlg-url"
                            placeholder="https://github.com/org/repo"
                        />
                    </div>
                    <div class="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Create</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    ),
};

export const Closed: Story = {
    render: () => (
        <Dialog
            open={false}
            onEscapeKeyDown={() => {}}
        >
            <DialogContent>
                <DialogTitle>Hidden</DialogTitle>
                <p class="text-sm text-slate-400">
                    This story renders nothing because the dialog is closed.
                </p>
            </DialogContent>
        </Dialog>
    ),
};

export const Toggle: Story = {
    render: () => {
        const [open, setOpen] = createSignal(false);
        return (
            <div class="flex h-screen items-center justify-center">
                <Button onClick={() => setOpen(true)}>Open dialog</Button>
                <Dialog
                    open={open()}
                    onEscapeKeyDown={() => setOpen(false)}
                >
                    <DialogOverlay
                        aria-label="Close"
                        onClick={() => setOpen(false)}
                    />
                    <DialogContent>
                        <DialogTitle>Interactive dialog</DialogTitle>
                        <p class="mb-4 text-sm text-slate-400">
                            Press Escape, click the overlay, or use the close
                            button.
                        </p>
                        <div class="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={() => setOpen(false)}>
                                Confirm
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        );
    },
};
