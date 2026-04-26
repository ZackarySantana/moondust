import type { Meta, StoryObj } from "storybook-solidjs-vite";
import GitBranch from "lucide-solid/icons/git-branch";
import Clock from "lucide-solid/icons/clock";
import FileDiff from "lucide-solid/icons/file-diff";
import MessageSquare from "lucide-solid/icons/message-square";
import { HubCard, HubCardGrid } from "./hub-card";

const meta = {
    title: "Hub/HubCard",
    component: HubCard,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof HubCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
    render: () => (
        <div class="bg-void-950 p-4 max-w-sm">
            <HubCard
                eyebrow="Recent thread"
                title="Refactor router and replace floating-ui"
                preview="Pulled the router into a thread context and started replacing the legacy floating-ui usage with a custom popover primitive. Currently waiting on tests."
                status={{ tone: "starlight", label: "Streaming", pulse: true }}
                meta={[
                    {
                        id: "branch",
                        icon: GitBranch,
                        label: "moon/refactor-router",
                    },
                    { id: "diff", icon: FileDiff, label: "12 files" },
                    { id: "time", icon: Clock, label: "3m ago" },
                ]}
                onClick={() => alert("open thread")}
            />
        </div>
    ),
};

export const Grid: Story = {
    render: () => (
        <div class="bg-void-950 p-4">
            <HubCardGrid>
                <HubCard
                    eyebrow="Workspace"
                    title="moondust"
                    preview="~/code/moondust · main · 4 active threads"
                    meta={[
                        { id: "branch", icon: GitBranch, label: "main" },
                        { id: "threads", icon: MessageSquare, label: "4" },
                    ]}
                    onClick={() => {}}
                />
                <HubCard
                    eyebrow="Workspace"
                    title="frontend-archive"
                    preview="~/code/frontend-archive · main · No active threads"
                    meta={[
                        { id: "branch", icon: GitBranch, label: "main" },
                        { id: "threads", icon: MessageSquare, label: "0" },
                    ]}
                    onClick={() => {}}
                />
                <HubCard
                    eyebrow="Recent thread"
                    title="Wire Wails IPC into studio"
                    preview="Added Project + Thread bindings, hand-rolled wailsjs shim, and stubbed the dev mock for window.go."
                    status={{ tone: "nebula", label: "Thinking", pulse: true }}
                    meta={[
                        {
                            id: "branch",
                            icon: GitBranch,
                            label: "moon/studio-ipc",
                        },
                        { id: "diff", icon: FileDiff, label: "8 files" },
                    ]}
                    onClick={() => {}}
                />
                <HubCard
                    eyebrow="Recent thread"
                    title="Tests for thread store"
                    preview="Cover ListByProject, Rename, ordering, and tombstones."
                    status={{ tone: "flare", label: "Failed" }}
                    meta={[
                        {
                            id: "branch",
                            icon: GitBranch,
                            label: "moon/thread-tests",
                        },
                        { id: "time", icon: Clock, label: "1h ago" },
                    ]}
                    onClick={() => {}}
                />
            </HubCardGrid>
        </div>
    ),
};
