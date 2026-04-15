import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button } from "./button";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTitle,
} from "./dialog";

const meta = {
    title: "Modals/Dialog",
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Shell: Story = {
    render: () => (
        <Dialog open onEscapeKeyDown={() => {}}>
            <DialogOverlay aria-label="Close" onClick={() => {}} />
            <DialogContent>
                <DialogTitle>Example dialog</DialogTitle>
                <p class="mb-4 text-sm text-slate-400">
                    Low-level primitives: overlay, panel, title. Product modals
                    compose these with form content.
                </p>
                <div class="flex justify-end gap-2">
                    <Button type="button" variant="ghost">
                        Cancel
                    </Button>
                    <Button type="button">OK</Button>
                </div>
            </DialogContent>
        </Dialog>
    ),
};
