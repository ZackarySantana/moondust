import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal, For, type JSX } from "solid-js";
import { Button } from "../button/button";
import { Input } from "../input/input";
import { Label } from "../label/label";
import { Select } from "../select/select";
import { Separator } from "../separator/separator";
import { Kbd } from "../kbd/kbd";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTitle,
} from "../dialog/dialog";

const meta: Meta = {
    title: "Kitchen Sink/Composition",
};

export default meta;
type Story = StoryObj;

export const Buttons: Story = {
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-3xl space-y-10">
                <header>
                    <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-starlight-400">
                        moondust / buttons
                    </p>
                    <h1 class="mt-2 text-3xl font-semibold tracking-tight text-void-50">
                        Action surface
                    </h1>
                </header>

                <Block label="variants">
                    <div class="flex flex-wrap items-center gap-3">
                        <Button>Save thread</Button>
                        <Button variant="secondary">Discard</Button>
                        <Button variant="outline">Cancel</Button>
                        <Button variant="ghost">Skip</Button>
                        <Button variant="destructive">Delete project</Button>
                        <Button variant="link">View on GitHub</Button>
                    </div>
                </Block>

                <Block label="sizes">
                    <div class="flex flex-wrap items-center gap-3">
                        <Button size="sm">Small</Button>
                        <Button>Default</Button>
                        <Button size="lg">Large</Button>
                        <Button size="icon" aria-label="settings">
                            <IconCog />
                        </Button>
                    </div>
                </Block>

                <Block label="with affordances">
                    <div class="flex flex-wrap items-center gap-3">
                        <Button>
                            <IconBranch />
                            Fork from here
                        </Button>
                        <Button variant="secondary">
                            Open project
                            <span class="inline-flex items-center gap-1">
                                <Kbd>⌘</Kbd>
                                <Kbd>O</Kbd>
                            </span>
                        </Button>
                        <Button variant="outline" disabled>
                            Disabled
                        </Button>
                    </div>
                </Block>
            </div>
        </div>
    ),
};

export const Forms: Story = {
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-2xl">
                <header class="mb-8">
                    <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-starlight-400">
                        moondust / forms
                    </p>
                    <h1 class="mt-2 text-3xl font-semibold tracking-tight text-void-50">
                        New project
                    </h1>
                </header>

                <div class="border border-void-700 bg-void-900 p-6">
                    <div class="mb-5">
                        <Label for="ks-name">Name</Label>
                        <Input
                            id="ks-name"
                            placeholder="moondust-companion"
                            value="moondust-companion"
                        />
                        <p class="mt-1.5 text-xs text-void-400">
                            Used for the project folder and as a default
                            display name.
                        </p>
                    </div>

                    <div class="mb-5">
                        <Label for="ks-path">Local path</Label>
                        <Input
                            id="ks-path"
                            value="/Users/leo/code/moondust-companion"
                            readonly
                        />
                    </div>

                    <div class="mb-5">
                        <Label for="ks-provider">Default provider</Label>
                        <Select id="ks-provider">
                            <option>Anthropic</option>
                            <option>OpenAI</option>
                            <option>Google</option>
                            <option>Local (Ollama)</option>
                        </Select>
                    </div>

                    <div class="mb-6">
                        <Label for="ks-model">Default model</Label>
                        <Select id="ks-model">
                            <option>claude-3.5-sonnet</option>
                            <option>claude-3.5-haiku</option>
                            <option>claude-3-opus</option>
                        </Select>
                    </div>

                    <Separator class="mb-6" />

                    <div class="flex items-center justify-end gap-2">
                        <Button variant="ghost">Cancel</Button>
                        <Button>Create project</Button>
                    </div>
                </div>
            </div>
        </div>
    ),
};

export const DialogShowcase: Story = {
    render: () => {
        const [open, setOpen] = createSignal(true);
        return (
            <div class="min-h-screen bg-void-950 p-10">
                <div class="mx-auto max-w-2xl">
                    <header class="mb-8">
                        <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-starlight-400">
                            moondust / dialog
                        </p>
                        <h1 class="mt-2 text-3xl font-semibold tracking-tight text-void-50">
                            Confirm destructive action
                        </h1>
                    </header>
                    <Button
                        variant="destructive"
                        onClick={() => setOpen(true)}
                    >
                        Open dialog
                    </Button>
                </div>

                <Dialog open={open()} onEscapeKeyDown={() => setOpen(false)}>
                    <DialogOverlay onClick={() => setOpen(false)} />
                    <DialogContent>
                        <DialogTitle>Discard 3 unstaged files?</DialogTitle>
                        <p class="mb-5 text-sm leading-relaxed text-void-300">
                            The following changes will be permanently lost:
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
                                    <li class="font-mono text-[12px] text-void-200">
                                        {p}
                                    </li>
                                )}
                            </For>
                        </ul>
                        <div class="flex items-center justify-end gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button variant="destructive">
                                Discard files
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        );
    },
};

export const ProjectPanel: Story = {
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-5xl border border-void-700 bg-void-900">
                {/* Top bar */}
                <div class="flex items-center justify-between border-b border-void-700 bg-void-850 px-5 py-3">
                    <div class="flex items-baseline gap-3">
                        <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-starlight-400">
                            project
                        </span>
                        <span class="text-sm font-medium text-void-100">
                            moondust-companion
                        </span>
                        <code class="text-[12px] text-void-400">
                            ~/code/moondust-companion
                        </code>
                    </div>
                    <div class="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                            Settings
                        </Button>
                        <Button size="sm">
                            <IconBranch />
                            New thread
                        </Button>
                    </div>
                </div>

                <div class="grid grid-cols-[220px_1fr]">
                    {/* Sidebar */}
                    <aside class="border-r border-void-700 bg-void-900 p-4">
                        <p class="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                            Threads
                        </p>
                        <nav class="space-y-px">
                            <NavItem active>Refactor router</NavItem>
                            <NavItem>Replace floating-ui</NavItem>
                            <NavItem>Investigate flaky test</NavItem>
                            <NavItem>Notes on theme tokens</NavItem>
                        </nav>
                    </aside>

                    {/* Main */}
                    <main class="p-6">
                        <header class="mb-6">
                            <h2 class="text-xl font-semibold tracking-tight text-void-50">
                                Refactor router
                            </h2>
                            <div class="mt-2 flex items-center gap-3 text-xs text-void-400">
                                <span>2 minutes ago</span>
                                <Separator orientation="vertical" class="h-3" />
                                <code class="text-[12px] text-nebula-300">
                                    claude-3.5-sonnet
                                </code>
                                <Separator orientation="vertical" class="h-3" />
                                <span class="font-mono tabular-nums">
                                    12,481 tok
                                </span>
                                <span class="font-mono tabular-nums text-starlight-300">
                                    $0.0124
                                </span>
                            </div>
                        </header>

                        <article class="space-y-4 border-l border-starlight-400/40 bg-void-850 p-5">
                            <p class="text-sm leading-relaxed text-void-100">
                                The router currently lives at{" "}
                                <code class="text-[12px] text-void-200">
                                    src/router.tsx
                                </code>{" "}
                                and pulls in{" "}
                                <code class="text-[12px] text-nebula-300">
                                    @solidjs/router
                                </code>
                                . To make components portable we should lift
                                navigation into a renderLink prop, then drop
                                the dependency from the components package.
                            </p>
                            <pre class="rounded-none border border-void-700 bg-void-900 p-3 text-[12px] leading-relaxed text-void-200">{`export interface NavItemProps {
    href: string;
    label: string;
    renderLink: (p: { href: string; class?: string }) => JSX.Element;
}`}</pre>
                            <p class="text-sm leading-relaxed text-void-200">
                                Press{" "}
                                <span class="inline-flex items-center gap-1 align-middle">
                                    <Kbd>⌘</Kbd>
                                    <Kbd>K</Kbd>
                                </span>{" "}
                                to fork from this point.
                            </p>
                        </article>

                        <footer class="mt-6 flex items-center justify-between border-t border-void-700 pt-4">
                            <p class="text-xs text-void-500">
                                Composer is read-only in this story.
                            </p>
                            <div class="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                    Discard reply
                                </Button>
                                <Button size="sm">Send</Button>
                            </div>
                        </footer>
                    </main>
                </div>
            </div>
        </div>
    ),
};

const Block = (props: { label: string; children: JSX.Element }) => (
    <section>
        <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
            {props.label}
        </p>
        {props.children}
    </section>
);

const NavItem = (props: { active?: boolean; children: JSX.Element }) => (
    <a
        class={`block cursor-pointer rounded-none px-2 py-1.5 text-sm transition-colors duration-100 ${
            props.active
                ? "border-l-2 border-starlight-400 bg-void-800 text-void-50"
                : "border-l-2 border-transparent text-void-300 hover:bg-void-800 hover:text-void-100"
        }`}
        href="#"
    >
        {props.children}
    </a>
);

const IconCog = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const IconBranch = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    >
        <line x1="6" x2="6" y1="3" y2="15" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
);
