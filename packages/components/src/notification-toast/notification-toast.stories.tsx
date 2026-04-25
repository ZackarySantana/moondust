import { createSignal } from "solid-js";
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
        body: "OpenRouter is now active.",
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
    args: {
        toasts: [],
        onDismiss: () => {},
        onNavigate: () => {},
    },
};

export const Single: Story = {
    args: {
        toasts: SINGLE,
        onDismiss: () => {},
        onNavigate: () => {},
    },
};

export const Multiple: Story = {
    args: {
        toasts: MANY,
        onDismiss: () => {},
        onNavigate: () => {},
    },
};

export const Interactive: Story = {
    render: () => {
        const [toasts, setToasts] = createSignal<NotificationToastItem[]>([]);
        let next = 0;

        function push() {
            const id = ++next;
            setToasts((prev) => [
                ...prev,
                {
                    id,
                    title: `Notification #${id}`,
                    body: "Click the action button to navigate, or X to dismiss.",
                    deepLink: id % 2 === 0 ? "/project/demo/thread/abc" : undefined,
                },
            ]);
        }

        return (
            <div class="flex h-screen items-center justify-center">
                <Button onClick={push}>Push toast</Button>
                <NotificationToastViewport
                    toasts={toasts()}
                    onDismiss={(id) =>
                        setToasts((prev) => prev.filter((t) => t.id !== id))
                    }
                    onNavigate={(id, path) => {
                        console.log("navigate to", path);
                        setToasts((prev) => prev.filter((t) => t.id !== id));
                    }}
                />
            </div>
        );
    },
};

export const CustomActionLabel: Story = {
    args: {
        toasts: [
            {
                id: 1,
                title: "Build complete",
                body: "Storybook static built in 12.4s.",
                deepLink: "/storybook",
                actionLabel: "Open Storybook",
            },
        ],
        onDismiss: () => {},
        onNavigate: () => {},
    },
};
