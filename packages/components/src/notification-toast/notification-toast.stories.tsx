import { createSignal, type JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button } from "../button/button";
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
    <div class="relative h-screen bg-void-950">
        {/* Faux app surface so the toasts appear over a real-feeling backdrop */}
        <div class="absolute inset-0 grid grid-cols-[220px_1fr] opacity-60">
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
                </div>
            </aside>
            <main class="p-6">
                <div class="border border-void-700 bg-void-850 p-5 text-sm text-void-300">
                    {props.label}
                </div>
            </main>
        </div>
        {props.children}
    </div>
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
