import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal, For, type JSX } from "solid-js";
import GitBranch from "lucide-solid/icons/git-branch";
import Plus from "lucide-solid/icons/plus";
import Save from "lucide-solid/icons/save";
import Settings from "lucide-solid/icons/settings";
import Trash2 from "lucide-solid/icons/trash-2";

import { AssistantMessageForkButton } from "../assistant-message-fork-button/assistant-message-fork-button";
import { AssistantMessageMetadataButton } from "../assistant-message-metadata/assistant-message-metadata";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { FileChangeRow } from "../file-change-row/file-change-row";
import { Input } from "../input/input";
import { Kbd } from "../kbd/kbd";
import { Label } from "../label/label";
import { Select } from "../select/select";
import { Separator } from "../separator/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs/tabs";
import { Tooltip } from "../tooltip/tooltip";
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
                        <Tooltip content="Project settings" shortcut={["⌘", ","]}>
                            <Button size="icon" aria-label="settings">
                                <Settings
                                    class="size-4"
                                    stroke-width={2}
                                    aria-hidden
                                />
                            </Button>
                        </Tooltip>
                    </div>
                </Block>

                <Block label="with affordances">
                    <div class="flex flex-wrap items-center gap-3">
                        <Button>
                            <GitBranch
                                class="size-4"
                                stroke-width={2}
                                aria-hidden
                            />
                            Fork from here
                        </Button>
                        <Button variant="secondary">
                            <Save
                                class="size-4"
                                stroke-width={2}
                                aria-hidden
                            />
                            Save
                            <span class="inline-flex items-center gap-1">
                                <Kbd>⌘</Kbd>
                                <Kbd>S</Kbd>
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
                        <Trash2 class="size-4" stroke-width={2} aria-hidden />
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
                        <Badge tone="nebula" mono size="sm">
                            main
                        </Badge>
                    </div>
                    <div class="flex items-center gap-2">
                        <Tooltip content="Project settings" shortcut={["⌘", ","]}>
                            <Button variant="ghost" size="sm">
                                <Settings
                                    class="size-3.5"
                                    stroke-width={2}
                                    aria-hidden
                                />
                                Settings
                            </Button>
                        </Tooltip>
                        <Tooltip content="New thread" shortcut={["⌘", "N"]}>
                            <Button size="sm">
                                <Plus
                                    class="size-3.5"
                                    stroke-width={2}
                                    aria-hidden
                                />
                                New thread
                            </Button>
                        </Tooltip>
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
                                <Badge tone="nebula" mono size="sm">
                                    claude-3.5-sonnet
                                </Badge>
                                <Badge mono size="sm">
                                    12,481 tok
                                </Badge>
                                <Badge tone="starlight" mono size="sm">
                                    $0.0124
                                </Badge>
                            </div>
                        </header>

                        <article class="border border-void-700 bg-void-900">
                            <header class="flex items-center justify-between border-b border-void-700 px-4 py-2">
                                <div class="flex items-center gap-2">
                                    <span class="size-1.5 bg-starlight-400" />
                                    <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-400">
                                        assistant
                                    </span>
                                    <code class="font-mono text-[11px] text-nebula-300">
                                        claude-3.5-sonnet
                                    </code>
                                </div>
                                <div class="flex items-center gap-0.5">
                                    <AssistantMessageMetadataButton
                                        summary="$0.0124"
                                        sections={[
                                            {
                                                heading: "OpenRouter",
                                                subheading:
                                                    "anthropic/claude-3.5-sonnet",
                                                hero: {
                                                    label: "Total cost",
                                                    value: "$0.0124",
                                                },
                                                pills: [
                                                    {
                                                        label: "Input",
                                                        value: "1,420",
                                                    },
                                                    {
                                                        label: "Output",
                                                        value: "382",
                                                    },
                                                ],
                                                rows: [
                                                    {
                                                        label: "Native finish",
                                                        value: "stop",
                                                    },
                                                    {
                                                        label: "Latency",
                                                        value: "1.83s",
                                                    },
                                                ],
                                            },
                                        ]}
                                    />
                                    <AssistantMessageForkButton
                                        onFork={() =>
                                            new Promise((r) =>
                                                setTimeout(r, 500),
                                            )
                                        }
                                    />
                                </div>
                            </header>
                            <div class="space-y-3 border-l border-starlight-400/40 bg-void-850 p-5">
                                <p class="text-sm leading-relaxed text-void-100">
                                    The router currently lives at{" "}
                                    <code class="text-[12px] text-void-200">
                                        src/router.tsx
                                    </code>{" "}
                                    and pulls in{" "}
                                    <code class="text-[12px] text-nebula-300">
                                        @solidjs/router
                                    </code>
                                    . To make components portable we should
                                    lift navigation into a renderLink prop,
                                    then drop the dependency from the
                                    components package.
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
                            </div>
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

export const ReviewPanel: Story = {
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-5xl">
                <header class="mb-6">
                    <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-starlight-400">
                        moondust / review
                    </p>
                    <h1 class="mt-2 text-3xl font-semibold tracking-tight text-void-50">
                        Git review
                    </h1>
                    <p class="mt-1 text-sm text-void-400">
                        Inspect, stage, and commit changes from this thread.
                    </p>
                </header>

                <Tabs defaultValue="changes">
                    <TabsList aria-label="Review sections">
                        <TabsTrigger value="changes">
                            Changes
                            <Badge size="sm" mono>
                                12
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="commits">
                            Commits
                            <Badge size="sm" mono>
                                3
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="checks">
                            Checks
                            <Badge size="sm" tone="flare">
                                !2
                            </Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="changes">
                        <div class="grid grid-cols-[280px_1fr] border border-t-0 border-void-700 bg-void-900">
                            <div class="border-r border-void-700 p-2">
                                <p class="mb-1 px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                                    Staged
                                </p>
                                <FileChangeRow
                                    path="internal/v2/app/project.go"
                                    status="M"
                                    context="staged"
                                    onUnstage={() => {}}
                                />
                                <FileChangeRow
                                    path="packages/components/src/button/button.tsx"
                                    status="A"
                                    context="staged"
                                    onUnstage={() => {}}
                                />
                                <p class="mt-3 mb-1 px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                                    Unstaged
                                </p>
                                <FileChangeRow
                                    path="packages/studio/src/views/settings.tsx"
                                    status="M"
                                    context="unstaged"
                                    onStage={() => {}}
                                    onDiscard={() => {}}
                                />
                                <FileChangeRow
                                    path="packages/components/src/badge/badge.tsx"
                                    status="?"
                                    context="untracked"
                                    onStage={() => {}}
                                />
                            </div>
                            <div class="p-5">
                                <div class="mb-3 flex items-center justify-between">
                                    <code class="font-mono text-[12px] text-void-100">
                                        packages/components/src/button/button.tsx
                                    </code>
                                    <Badge tone="starlight" size="sm">
                                        Added
                                    </Badge>
                                </div>
                                <pre class="overflow-x-auto rounded-none border border-void-700 bg-void-950 p-3 font-mono text-[11px] leading-relaxed text-void-200">{`+ const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
+   default:
+     "bg-starlight-300 text-void-950 hover:bg-starlight-200 ...",
+   destructive:
+     "bg-flare-500 text-void-50 hover:bg-flare-400 ...",
+   ...
+ };`}</pre>
                                <div class="mt-4 flex items-center justify-end gap-2">
                                    <Tooltip
                                        content="Unstage this file"
                                        shortcut={["⌘", "U"]}
                                    >
                                        <Button variant="ghost" size="sm">
                                            Unstage
                                        </Button>
                                    </Tooltip>
                                    <Tooltip
                                        content="Open in editor"
                                        shortcut={["⌘", "O"]}
                                    >
                                        <Button variant="outline" size="sm">
                                            Open
                                        </Button>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="commits">
                        <div class="border border-t-0 border-void-700 bg-void-900 p-5 text-[13px] text-void-300">
                            <p>3 local commits ahead of origin.</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="checks">
                        <div class="border border-t-0 border-void-700 bg-void-900 p-5 text-[13px] text-void-300">
                            <p>2 checks failing on this branch.</p>
                        </div>
                    </TabsContent>
                </Tabs>
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
