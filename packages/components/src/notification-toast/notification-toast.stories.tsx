import { createSignal, type JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import GitBranch from "lucide-solid/icons/git-branch";
import { Button } from "../button/button";
import { Badge } from "../badge/badge";
import { AssistantMessageMetadataButton } from "../assistant-message-metadata/assistant-message-metadata";
import { AssistantMessageForkButton } from "../assistant-message-fork-button/assistant-message-fork-button";
import {
    NotificationToastViewport,
    type NotificationToastItem,
} from "./notification-toast";

const meta = {
    title: "Feedback/NotificationToast",
    component: NotificationToastViewport,
    parameters: { layout: "fullscreen" },
    tags: ["autodocs"],
} satisfies Meta<typeof NotificationToastViewport>;

export default meta;
type Story = StoryObj<typeof meta>;

const Stage = (props: { label: string; children: JSX.Element }) => (
    <div class="relative h-screen bg-void-950 text-void-200">
        {/* Real-feeling app shell so the toasts appear over a believable backdrop */}
        <div class="absolute inset-0 grid grid-cols-[220px_1fr]">
            <aside class="flex flex-col border-r border-void-700 bg-void-900">
                <header class="border-b border-void-700 px-4 py-3">
                    <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        Project
                    </p>
                    <p class="mt-1 truncate text-sm font-medium text-void-50">
                        moondust-companion
                    </p>
                    <code class="block truncate font-mono text-[11px] text-void-400">
                        ~/code/moondust-companion
                    </code>
                </header>
                <div class="flex-1 overflow-y-auto p-3">
                    <p class="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        Threads
                    </p>
                    <nav class="space-y-px text-sm">
                        <ThreadItem active>Refactor router</ThreadItem>
                        <ThreadItem>Replace floating-ui</ThreadItem>
                        <ThreadItem>Investigate flaky test</ThreadItem>
                        <ThreadItem>Notes on theme tokens</ThreadItem>
                    </nav>
                </div>
                <div class="border-t border-void-700 px-3 py-3">
                    <Badge tone="starlight" size="sm" dot>
                        Connected
                    </Badge>
                </div>
            </aside>
            <main class="flex flex-col overflow-hidden">
                <header class="flex items-center justify-between border-b border-void-700 bg-void-850 px-5 py-3">
                    <div class="flex items-baseline gap-3">
                        <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-starlight-400">
                            thread
                        </span>
                        <span class="text-sm font-medium text-void-100">
                            Refactor router
                        </span>
                    </div>
                    <div class="flex items-center gap-2">
                        <Badge tone="nebula" mono size="sm">
                            main
                        </Badge>
                        <Badge mono size="sm">
                            12,481 tok
                        </Badge>
                    </div>
                </header>
                <div class="flex-1 overflow-y-auto p-6">
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
                                                { label: "Input", value: "1,420" },
                                                { label: "Output", value: "382" },
                                            ],
                                        },
                                    ]}
                                />
                                <AssistantMessageForkButton
                                    onFork={() =>
                                        new Promise((r) => setTimeout(r, 500))
                                    }
                                />
                            </div>
                        </header>
                        <div class="space-y-3 p-4 text-sm leading-relaxed text-void-200">
                            <p>
                                The router lives at{" "}
                                <code class="text-[12px] text-void-100">
                                    src/router.tsx
                                </code>{" "}
                                and pulls in{" "}
                                <code class="text-[12px] text-nebula-300">
                                    @solidjs/router
                                </code>
                                . Two ways forward:
                            </p>
                            <ul class="ml-4 list-disc text-void-300 marker:text-void-600">
                                <li>Custom hook (~30 LOC, no extra dep).</li>
                                <li>tanstack/router (composes with suspense).</li>
                            </ul>
                            <p>{props.label}</p>
                        </div>
                        <footer class="flex items-center justify-end border-t border-void-700 px-4 py-2">
                            <Button variant="ghost" size="sm">
                                <GitBranch
                                    class="size-3.5"
                                    stroke-width={2}
                                    aria-hidden
                                />
                                Fork from here
                            </Button>
                        </footer>
                    </article>
                </div>
            </main>
        </div>
        {props.children}
    </div>
);

const ThreadItem = (props: { active?: boolean; children: JSX.Element }) => (
    <a
        href="#"
        class={`block border-l-2 px-2 py-1.5 transition-colors duration-100 ${
            props.active
                ? "border-starlight-400 bg-void-800 text-void-50"
                : "border-transparent text-void-400 hover:bg-void-800/60 hover:text-void-100"
        }`}
    >
        {props.children}
    </a>
);

const SINGLE: NotificationToastItem[] = [
    {
        id: 1,
        title: "Worktree created",
        body: "Branch feature/login-flow is ready.",
        deepLink: "/project/demo/thread/abc",
    },
];

const MANY: NotificationToastItem[] = [
    {
        id: 1,
        title: "Provider connected",
        body: "Anthropic is now active.",
        deepLink: "/project/demo/settings/providers",
    },
    {
        id: 2,
        title: "Thread updated",
        body: "Run finished with 3 file changes.",
        deepLink: "/project/demo/thread/abc",
    },
    {
        id: 3,
        title: "Heads up",
        body: "Your usage is at 82% of this month's plan.",
    },
];

export const Empty: Story = {
    render: () => (
        <Stage label="No toasts. Push one to see the viewport in action.">
            <NotificationToastViewport
                toasts={[]}
                onDismiss={() => {}}
                onNavigate={() => {}}
            />
        </Stage>
    ),
};

export const Single: Story = {
    render: () => (
        <Stage label="A single toast over the app surface.">
            <NotificationToastViewport
                toasts={SINGLE}
                onDismiss={() => {}}
                onNavigate={() => {}}
            />
        </Stage>
    ),
};

export const Stacked: Story = {
    render: () => (
        <Stage label="Multiple toasts stack from the bottom right corner.">
            <NotificationToastViewport
                toasts={MANY}
                onDismiss={() => {}}
                onNavigate={() => {}}
            />
        </Stage>
    ),
};

export const InfoOnly: Story = {
    render: () => (
        <Stage label="Toasts without a deepLink omit the action button.">
            <NotificationToastViewport
                toasts={[
                    {
                        id: 1,
                        title: "Saved",
                        body: "Project settings have been saved.",
                    },
                    {
                        id: 2,
                        title: "Heads up",
                        body: "Your usage is at 82% of this month's plan.",
                    },
                ]}
                onDismiss={() => {}}
                onNavigate={() => {}}
            />
        </Stage>
    ),
};

export const CustomActionLabel: Story = {
    render: () => (
        <Stage label="actionLabel overrides the default verb derived from deepLink.">
            <NotificationToastViewport
                toasts={[
                    {
                        id: 1,
                        title: "Build complete",
                        body: "Storybook static built in 12.4s.",
                        deepLink: "/storybook",
                        actionLabel: "Open Storybook",
                    },
                    {
                        id: 2,
                        title: "Update available",
                        body: "Moondust 2.1.0 is ready to install.",
                        deepLink: "/updates",
                        actionLabel: "Install update",
                    },
                ]}
                onDismiss={() => {}}
                onNavigate={() => {}}
            />
        </Stage>
    ),
};

export const Interactive: Story = {
    render: () => {
        const [toasts, setToasts] = createSignal<NotificationToastItem[]>([]);
        let next = 0;

        function pushAction() {
            const id = ++next;
            setToasts((prev) => [
                ...prev,
                {
                    id,
                    title: "Worktree created",
                    body: `Branch feature/run-${id} is ready.`,
                    deepLink: "/project/demo/thread/abc",
                },
            ]);
        }

        function pushInfo() {
            const id = ++next;
            setToasts((prev) => [
                ...prev,
                {
                    id,
                    title: "Saved",
                    body: "Project settings have been saved.",
                },
            ]);
        }

        function clear() {
            setToasts([]);
        }

        return (
            <Stage label="Push toasts to see them stack. Dismiss with the X, or click an action to navigate.">
                <div class="absolute inset-0 flex items-start justify-center pt-10">
                    <div class="flex items-center gap-2 border border-void-700 bg-void-900 p-3">
                        <Button onClick={pushAction}>Push action toast</Button>
                        <Button variant="secondary" onClick={pushInfo}>
                            Push info toast
                        </Button>
                        <Button variant="ghost" onClick={clear}>
                            Clear all
                        </Button>
                    </div>
                </div>
                <NotificationToastViewport
                    toasts={toasts()}
                    onDismiss={(id) =>
                        setToasts((prev) => prev.filter((t) => t.id !== id))
                    }
                    onNavigate={(id) =>
                        setToasts((prev) => prev.filter((t) => t.id !== id))
                    }
                />
            </Stage>
        );
    },
};
