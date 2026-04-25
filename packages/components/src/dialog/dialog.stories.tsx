import { createSignal, For, type JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import AlertTriangle from "lucide-solid/icons/alert-triangle";
import GitBranch from "lucide-solid/icons/git-branch";
import KeyRound from "lucide-solid/icons/key-round";
import Trash2 from "lucide-solid/icons/trash-2";

import { Button } from "../button/button";
import { Input } from "../input/input";
import { Label } from "../label/label";
import { Select } from "../select/select";
import { Kbd } from "../kbd/kbd";
import { Separator } from "../separator/separator";
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

const Stage = (props: { children: JSX.Element }) => (
    <div class="relative h-screen bg-void-950">
        {/* Background app surface for visual context */}
        <div class="absolute inset-0 grid grid-cols-[220px_1fr] opacity-50">
            <aside class="border-r border-void-700 bg-void-900 p-4">
                <p class="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    Threads
                </p>
                <div class="space-y-px text-sm text-void-400">
                    <div class="border-l-2 border-starlight-400 bg-void-800 px-2 py-1.5 text-void-50">
                        Refactor router
                    </div>
                    <div class="border-l-2 border-transparent px-2 py-1.5">
                        Replace floating-ui
                    </div>
                    <div class="border-l-2 border-transparent px-2 py-1.5">
                        Investigate flaky test
                    </div>
                </div>
            </aside>
            <main class="p-6">
                <div class="border border-void-700 bg-void-850 p-5">
                    <p class="text-sm text-void-300">
                        moondust-companion / settings
                    </p>
                </div>
            </main>
        </div>
        {props.children}
    </div>
);

export const Shell: Story = {
    render: () => (
        <Stage>
            <Dialog open onEscapeKeyDown={() => {}}>
                <DialogOverlay aria-label="Close" onClick={() => {}} />
                <DialogContent>
                    <DialogTitle>Example dialog</DialogTitle>
                    <p class="mb-5 text-sm leading-relaxed text-void-300">
                        Low level primitives: overlay, panel, title. Product
                        modals compose these with form content.
                    </p>
                    <div class="flex items-center justify-end gap-2">
                        <Button variant="ghost">Cancel</Button>
                        <Button>Confirm</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Stage>
    ),
};

export const Destructive: Story = {
    render: () => (
        <Stage>
            <Dialog open onEscapeKeyDown={() => {}}>
                <DialogOverlay aria-label="Close" onClick={() => {}} />
                <DialogContent>
                    <div class="mb-4 flex items-start gap-3">
                        <div class="flex size-8 shrink-0 items-center justify-center bg-flare-500/15 text-flare-400">
                            <AlertTriangle size={16} />
                        </div>
                        <div>
                            <DialogTitle class="mb-1">
                                Delete project moondust-companion?
                            </DialogTitle>
                            <p class="text-sm leading-relaxed text-void-300">
                                This removes the project and all of its
                                threads from Moondust. Your files on disk are
                                not touched.
                            </p>
                        </div>
                    </div>
                    <div class="mb-5 border border-void-700 bg-void-850 p-3">
                        <p class="font-mono text-[12px] text-void-200">
                            ~/code/moondust-companion
                        </p>
                        <p class="mt-1 font-mono text-[11px] text-void-500">
                            12 threads, 3 forks, 2.4 MB
                        </p>
                    </div>
                    <div class="flex items-center justify-end gap-2">
                        <Button variant="ghost">
                            Cancel <Kbd>Esc</Kbd>
                        </Button>
                        <Button variant="destructive">
                            <Trash2 size={14} />
                            Delete project
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Stage>
    ),
};

export const DiscardFiles: Story = {
    render: () => (
        <Stage>
            <Dialog open onEscapeKeyDown={() => {}}>
                <DialogOverlay aria-label="Close" onClick={() => {}} />
                <DialogContent>
                    <DialogTitle>Discard 3 unstaged files?</DialogTitle>
                    <p class="mb-5 text-sm leading-relaxed text-void-300">
                        The following changes will be permanently lost.
                    </p>
                    <ul class="mb-6 space-y-1 border border-void-700 bg-void-850 p-3">
                        <For
                            each={[
                                "internal/v2/app/project.go",
                                "packages/components/src/button/button.tsx",
                                "packages/studio/src/views/settings.tsx",
                            ]}
                        >
                            {(p) => (
                                <li class="flex items-baseline gap-3">
                                    <span class="font-mono text-[10px] tracking-wider text-flare-400">
                                        D
                                    </span>
                                    <span class="font-mono text-[12px] text-void-200">
                                        {p}
                                    </span>
                                </li>
                            )}
                        </For>
                    </ul>
                    <div class="flex items-center justify-end gap-2">
                        <Button variant="ghost">Cancel</Button>
                        <Button variant="destructive">
                            <Trash2 size={14} />
                            Discard files
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Stage>
    ),
};

export const NewProject: Story = {
    render: () => (
        <Stage>
            <Dialog open onEscapeKeyDown={() => {}}>
                <DialogOverlay aria-label="Close" onClick={() => {}} />
                <DialogContent class="max-w-lg">
                    <DialogTitle>New project</DialogTitle>
                    <form class="space-y-4">
                        <div>
                            <Label for="np-name">Name</Label>
                            <Input
                                id="np-name"
                                placeholder="moondust-companion"
                            />
                        </div>
                        <div>
                            <Label for="np-url">Repository URL</Label>
                            <Input
                                id="np-url"
                                placeholder="https://github.com/org/repo"
                                class="font-mono"
                            />
                        </div>
                        <div>
                            <Label for="np-provider">Default provider</Label>
                            <Select id="np-provider">
                                <option>Anthropic</option>
                                <option>OpenAI</option>
                                <option>Google</option>
                            </Select>
                        </div>
                        <Separator class="!my-5" />
                        <div class="flex items-center justify-end gap-2">
                            <Button type="button" variant="ghost">
                                Cancel
                            </Button>
                            <Button type="submit">Create project</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </Stage>
    ),
};

export const NewThread: Story = {
    render: () => (
        <Stage>
            <Dialog open onEscapeKeyDown={() => {}}>
                <DialogOverlay aria-label="Close" onClick={() => {}} />
                <DialogContent>
                    <div class="mb-4 flex items-start gap-3">
                        <div class="flex size-8 shrink-0 items-center justify-center bg-starlight-400/15 text-starlight-300">
                            <GitBranch size={16} />
                        </div>
                        <div>
                            <DialogTitle class="mb-1">
                                Fork from this message
                            </DialogTitle>
                            <p class="text-sm leading-relaxed text-void-300">
                                Creates a new thread that branches from this
                                point.
                            </p>
                        </div>
                    </div>
                    <div class="mb-5">
                        <Label for="nt-name">Thread name</Label>
                        <Input
                            id="nt-name"
                            placeholder="Try Solid Router replacement"
                        />
                    </div>
                    <div class="mb-6 border border-void-700 bg-void-850 p-3">
                        <p class="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                            Forking from
                        </p>
                        <p class="text-sm text-void-200">
                            "The router currently lives at..."
                        </p>
                        <p class="mt-2 font-mono text-[11px] text-void-500">
                            <code class="text-nebula-400">a1b2c3d</code> ·
                            12,481 tok
                        </p>
                    </div>
                    <div class="flex items-center justify-end gap-2">
                        <Button variant="ghost">
                            Cancel <Kbd>Esc</Kbd>
                        </Button>
                        <Button>
                            <GitBranch size={14} />
                            Fork thread
                            <Kbd>↵</Kbd>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Stage>
    ),
};

export const ApiKeyEntry: Story = {
    render: () => (
        <Stage>
            <Dialog open onEscapeKeyDown={() => {}}>
                <DialogOverlay aria-label="Close" onClick={() => {}} />
                <DialogContent>
                    <div class="mb-4 flex items-start gap-3">
                        <div class="flex size-8 shrink-0 items-center justify-center bg-nebula-400/15 text-nebula-300">
                            <KeyRound size={16} />
                        </div>
                        <div>
                            <DialogTitle class="mb-1">
                                Connect Anthropic
                            </DialogTitle>
                            <p class="text-sm leading-relaxed text-void-300">
                                Stored in your system keychain, never sent to
                                Moondust.
                            </p>
                        </div>
                    </div>
                    <div class="mb-5">
                        <Label for="ak-key">API key</Label>
                        <Input
                            id="ak-key"
                            type="password"
                            placeholder="sk-ant-api03-"
                            class="font-mono"
                        />
                    </div>
                    <div class="flex items-center justify-end gap-2">
                        <Button variant="ghost">Cancel</Button>
                        <Button>Connect</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Stage>
    ),
};

export const Toggle: Story = {
    render: () => {
        const [open, setOpen] = createSignal(false);
        return (
            <Stage>
                <div class="absolute inset-0 flex items-center justify-center">
                    <Button onClick={() => setOpen(true)}>Open dialog</Button>
                </div>
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
                        <p class="mb-5 text-sm leading-relaxed text-void-300">
                            Press <Kbd>Esc</Kbd>, click the overlay, or use
                            the cancel button.
                        </p>
                        <div class="flex items-center justify-end gap-2">
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
            </Stage>
        );
    },
};

export const Closed: Story = {
    render: () => (
        <Stage>
            <Dialog open={false} onEscapeKeyDown={() => {}}>
                <DialogContent>
                    <DialogTitle>Hidden</DialogTitle>
                    <p class="text-sm text-void-400">
                        This story renders nothing because the dialog is
                        closed.
                    </p>
                </DialogContent>
            </Dialog>
        </Stage>
    ),
};
