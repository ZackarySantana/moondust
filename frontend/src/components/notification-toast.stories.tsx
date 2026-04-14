import type { Meta, StoryObj } from "storybook-solidjs-vite";
import type { NotificationToastItem } from "./notification-toast";
import { NotificationToastViewport } from "./notification-toast";

const sample: NotificationToastItem[] = [
    {
        id: 1,
        title: "Thread finished",
        body: "The agent completed summarizing the diff.",
        deepLink: "/project/p1/thread/t1",
    },
    {
        id: 2,
        title: "No deep link",
        body: "Dismiss-only toast.",
        deepLink: "",
    },
];

const meta = {
    title: "UI/NotificationToast",
    component: NotificationToastViewport,
    parameters: { layout: "fullscreen" },
    tags: ["autodocs"],
} satisfies Meta<typeof NotificationToastViewport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
    render: () => (
        <div class="relative min-h-[12rem] bg-slate-950 p-4">
            <NotificationToastViewport
                toasts={[sample[0]!]}
                onDismiss={() => {}}
                onNavigate={() => {}}
            />
        </div>
    ),
};

export const WithBodyAndLink: Story = {
    render: () => (
        <div class="relative min-h-[14rem] bg-slate-950 p-4">
            <NotificationToastViewport
                toasts={sample}
                onDismiss={() => {}}
                onNavigate={() => {}}
            />
        </div>
    ),
};
