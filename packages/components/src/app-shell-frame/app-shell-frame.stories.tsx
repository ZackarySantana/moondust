import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal, type Component } from "solid-js";
import Moon from "lucide-solid/icons/moon";
import Search from "lucide-solid/icons/search";
import GitBranch from "lucide-solid/icons/git-branch";
import Activity from "lucide-solid/icons/activity";

import {
    AppShellFrame,
    AppShellTitleBar,
    ContextRailColumn,
} from "./app-shell-frame";
import { Badge } from "../badge/badge";
import { Kbd } from "../kbd/kbd";
import { StatusDot } from "../status-dot/status-dot";

const meta = {
    title: "Layout/AppShellFrame",
    component: AppShellFrame,
    parameters: {
        layout: "fullscreen",
        backgrounds: { value: "void" },
    },
    tags: ["autodocs"],
} satisfies Meta<typeof AppShellFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

const FakeRail: Component = () => (
    <div class="flex h-full flex-col">
        <div class="flex items-center gap-2 px-3 py-2.5 border-b border-void-700">
            <Moon class="size-4 text-void-300" />
            <span class="text-sm font-medium text-void-100">Moondust</span>
        </div>
        <button
            type="button"
            class="mx-3 my-3 flex h-8 cursor-pointer items-center gap-2 border border-void-700 bg-void-950 px-2 text-left text-[12px] text-void-400 hover:border-void-600 hover:text-void-200"
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
        <div class="px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-void-500 font-mono">
            Recent
        </div>
        <ul class="space-y-px px-2 text-[13px] text-void-300">
            <li class="px-2 py-1.5 hover:bg-void-800/60 cursor-pointer">
                moondust
            </li>
            <li class="px-2 py-1.5 hover:bg-void-800/60 cursor-pointer">hub</li>
            <li class="px-2 py-1.5 hover:bg-void-800/60 cursor-pointer">
                infra
            </li>
        </ul>
        <div class="mt-auto border-t border-void-700 px-3 py-2.5 text-[10px] text-void-500">
            v0.0.0-dev
        </div>
    </div>
);

const FakeMain: Component = () => (
    <div class="flex h-full w-full flex-col">
        <div class="flex-1 overflow-auto p-8">
            <h1 class="text-xl font-semibold text-void-50 mb-2">Hub</h1>
            <p class="text-sm text-void-400 max-w-prose">
                The center pane is unconditionally mounted. Toggle the right
                rail and bottom dock to see the layout adjust without unmounting
                this content.
            </p>
        </div>
    </div>
);

const FakeDock: Component = () => (
    <div class="h-full w-full p-3 font-mono text-[11px] text-void-300">
        $ go test ./...
        <br />
        ok moondust/internal/v2/store
        <br />
        ok moondust/internal/v2/service
    </div>
);

const FakeTitle: Component = () => (
    <AppShellTitleBar
        leading={
            <span class="flex items-center gap-2 text-[12px] text-void-300">
                <span class="text-void-100">moondust</span>
                <span class="text-void-600">/</span>
                <span class="text-void-100">refactor router</span>
                <span class="text-void-600">/</span>
                <span class="text-starlight-300">chat</span>
            </span>
        }
        trailing={
            <>
                <Badge
                    tone="nebula"
                    mono
                    size="sm"
                >
                    <GitBranch class="size-3" />
                    main
                </Badge>
                <Badge
                    tone="starlight"
                    size="sm"
                >
                    Cursor
                </Badge>
                <span class="flex items-center gap-1 text-[11px] text-void-400">
                    <StatusDot
                        tone="starlight"
                        pulse
                    />
                    Streaming
                </span>
            </>
        }
    />
);

export const Default: Story = {
    render: () => {
        const [leftWidth, setLeftWidth] = createSignal(240);
        const [rightWidth, setRightWidth] = createSignal(320);
        const [dockHeight, setDockHeight] = createSignal(220);
        return (
            <AppShellFrame
                leftRailWidth={leftWidth()}
                onLeftRailWidthChange={setLeftWidth}
                rightRailWidth={rightWidth()}
                onRightRailWidthChange={setRightWidth}
                bottomDockHeight={dockHeight()}
                onBottomDockHeightChange={setDockHeight}
                titleBar={<FakeTitle />}
                leftRail={<FakeRail />}
                rightRail={
                    <ContextRailColumn
                        eyebrow="Context"
                        title="Agent thinking"
                        actions={
                            <Activity
                                class="size-3.5 text-void-500"
                                stroke-width={1.75}
                            />
                        }
                    >
                        <div class="p-3 font-mono text-[11px] leading-relaxed text-void-400">
                            tool: file_read('app-shell-frame.tsx')
                            <br />
                            tool: grep('AppShellFrame')
                            <br />⏵ thinking…
                        </div>
                    </ContextRailColumn>
                }
                bottomDock={<FakeDock />}
            >
                <FakeMain />
            </AppShellFrame>
        );
    },
};

export const NoRightRail: Story = {
    render: () => {
        const [leftWidth, setLeftWidth] = createSignal(240);
        const [dockHeight, setDockHeight] = createSignal(220);
        return (
            <AppShellFrame
                leftRailWidth={leftWidth()}
                onLeftRailWidthChange={setLeftWidth}
                bottomDockHeight={dockHeight()}
                onBottomDockHeightChange={setDockHeight}
                titleBar={<FakeTitle />}
                leftRail={<FakeRail />}
                rightRail={false}
                bottomDock={<FakeDock />}
            >
                <FakeMain />
            </AppShellFrame>
        );
    },
};

export const NoDock: Story = {
    render: () => {
        const [leftWidth, setLeftWidth] = createSignal(240);
        const [rightWidth, setRightWidth] = createSignal(320);
        return (
            <AppShellFrame
                leftRailWidth={leftWidth()}
                onLeftRailWidthChange={setLeftWidth}
                rightRailWidth={rightWidth()}
                onRightRailWidthChange={setRightWidth}
                titleBar={<FakeTitle />}
                leftRail={<FakeRail />}
                rightRail={
                    <ContextRailColumn
                        eyebrow="Context"
                        title="File changes"
                    >
                        <ul class="divide-y divide-void-800/60 text-[12px] text-void-300">
                            <li class="px-3 py-2">src/lib/queries.ts</li>
                            <li class="px-3 py-2">src/pages/hub.tsx</li>
                            <li class="px-3 py-2">src/pages/thread.tsx</li>
                        </ul>
                    </ContextRailColumn>
                }
                bottomDock={false}
            >
                <FakeMain />
            </AppShellFrame>
        );
    },
};

export const RailOnly: Story = {
    render: () => (
        <AppShellFrame
            leftRail={<FakeRail />}
            rightRail={false}
            bottomDock={false}
        >
            <FakeMain />
        </AppShellFrame>
    ),
};
