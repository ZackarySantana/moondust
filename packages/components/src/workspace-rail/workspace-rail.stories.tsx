import type { Meta, StoryObj } from "storybook-solidjs-vite";
import Plus from "lucide-solid/icons/plus";
import Settings from "lucide-solid/icons/settings";
import Moon from "lucide-solid/icons/moon";
import Search from "lucide-solid/icons/search";

import {
    WorkspaceRail,
    WorkspaceRailProject,
    WorkspaceRailSection,
    WorkspaceRailThread,
} from "./workspace-rail";
import { IconButton } from "../icon-button/icon-button";
import { KbdHint } from "../kbd-hint/kbd-hint";
import { StatusDot } from "../status-dot/status-dot";
import { Kbd } from "../kbd/kbd";

const meta = {
    title: "Layout/WorkspaceRail",
    component: WorkspaceRail,
    parameters: {
        layout: "fullscreen",
        backgrounds: { value: "panel" },
    },
    tags: ["autodocs"],
} satisfies Meta<typeof WorkspaceRail>;

export default meta;
type Story = StoryObj<typeof meta>;

function Frame(props: { children: import("solid-js").JSX.Element }) {
    return (
        <div class="flex h-screen w-full bg-void-950">
            <div class="flex h-full w-64 shrink-0 border-r border-void-700 bg-void-900">
                {props.children}
            </div>
            <div class="flex-1" />
        </div>
    );
}

export const Default: Story = {
    render: () => (
        <Frame>
            <WorkspaceRail
                header={
                    <div class="space-y-2 p-3">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <Moon
                                    class="size-4 text-void-300"
                                    stroke-width={1.75}
                                />
                                <span class="text-sm font-medium text-void-100">
                                    Moondust
                                </span>
                            </div>
                            <IconButton
                                size="xs"
                                aria-label="Settings"
                                tooltip="Settings"
                                tooltipShortcut={["⌘", ","]}
                            >
                                <Settings class="size-3.5" />
                            </IconButton>
                        </div>
                        <button
                            type="button"
                            class="flex h-8 w-full cursor-pointer items-center gap-2 border border-void-700 bg-void-950 px-2 text-left text-[12px] text-void-400 hover:border-void-600 hover:text-void-200"
                        >
                            <Search
                                class="size-3.5"
                                stroke-width={1.75}
                            />
                            <span class="flex-1">Search</span>
                            <span class="flex items-center gap-0.5">
                                <Kbd>⌘</Kbd>
                                <Kbd>K</Kbd>
                            </span>
                        </button>
                    </div>
                }
                footer={
                    <div class="flex items-center justify-between p-3">
                        <span class="flex items-center gap-1.5 text-[10px] text-void-500">
                            <StatusDot
                                tone="starlight"
                                size="xs"
                            />
                            Connected
                        </span>
                        <KbdHint
                            combo={["⌘", ","]}
                            size="xs"
                        />
                    </div>
                }
            >
                <WorkspaceRailSection
                    label="Recent"
                    actions={
                        <IconButton
                            size="xs"
                            aria-label="New thread"
                            tooltip="New thread"
                            tooltipShortcut={["⌘", "N"]}
                        >
                            <Plus class="size-3.5" />
                        </IconButton>
                    }
                >
                    <WorkspaceRailProject
                        name="moondust"
                        pathLabel="~/code/moondust"
                        actions={
                            <IconButton
                                size="xs"
                                aria-label="New thread"
                            >
                                <Plus class="size-3" />
                            </IconButton>
                        }
                    >
                        <WorkspaceRailThread
                            href="#"
                            title="Refactor router"
                            timeLabel="3m"
                            phase="responding"
                            shortcut={["⌘", "⌥", "1"]}
                            active
                        />
                        <WorkspaceRailThread
                            href="#"
                            title="Replace floating-ui with anchor positioning"
                            timeLabel="2h"
                            phase="thinking"
                            shortcut={["⌘", "⌥", "2"]}
                        />
                        <WorkspaceRailThread
                            href="#"
                            title="Investigate flaky test in store"
                            timeLabel="1d"
                            phase="done"
                        />
                        <WorkspaceRailThread
                            href="#"
                            title="Notes on theme tokens"
                            timeLabel="3d"
                        />
                    </WorkspaceRailProject>

                    <WorkspaceRailProject
                        name="hub"
                        pathLabel="~/code/hub"
                    >
                        <WorkspaceRailThread
                            href="#"
                            title="Add idempotency keys to webhooks"
                            timeLabel="6h"
                            phase="error"
                        />
                    </WorkspaceRailProject>
                </WorkspaceRailSection>

                <WorkspaceRailSection
                    label="All workspaces"
                    actions={
                        <IconButton
                            size="xs"
                            aria-label="Add workspace"
                            tooltip="New workspace"
                            tooltipShortcut={["⌘", "⇧", "N"]}
                        >
                            <Plus class="size-3.5" />
                        </IconButton>
                    }
                >
                    <WorkspaceRailProject
                        name="infra"
                        pathLabel="~/code/infra"
                        defaultOpen={false}
                    >
                        <WorkspaceRailThread
                            href="#"
                            title="Migrate alerts"
                            timeLabel="5d"
                        />
                    </WorkspaceRailProject>
                    <WorkspaceRailProject
                        name="docs"
                        pathLabel="~/code/docs"
                        defaultOpen={false}
                    >
                        <WorkspaceRailThread
                            href="#"
                            title="Storybook deploy"
                            timeLabel="2d"
                        />
                    </WorkspaceRailProject>
                </WorkspaceRailSection>
            </WorkspaceRail>
        </Frame>
    ),
};

export const Empty: Story = {
    render: () => (
        <Frame>
            <WorkspaceRail
                header={
                    <div class="p-3">
                        <span class="text-sm font-medium text-void-100">
                            Moondust
                        </span>
                    </div>
                }
            >
                <WorkspaceRailSection label="All workspaces">
                    <p class="px-3 py-6 text-center text-[12px] text-void-500">
                        No workspaces yet. Open a folder to get started.
                    </p>
                </WorkspaceRailSection>
            </WorkspaceRail>
        </Frame>
    ),
};
