import { useNavigate, type RouteSectionProps } from "@solidjs/router";
import {
    AppShellFrame,
    ContextRailColumn,
    EmptyState,
    TabsContent,
    TabsList,
    TabsRoot,
    TabsTrigger,
} from "@moondust/components";
import Terminal from "lucide-solid/icons/terminal";
import FlaskConical from "lucide-solid/icons/flask-conical";
import ScrollText from "lucide-solid/icons/scroll-text";
import Bot from "lucide-solid/icons/bot";
import Layers from "lucide-solid/icons/layers";
import { onCleanup, type Component } from "solid-js";
import {
    THREAD_VIEW_ORDER,
    useShortcuts,
    type ShortcutActionId,
    type ThreadViewId,
} from "@/lib/shortcuts";
import { useUIState } from "@/lib/ui-state";
import {
    paths,
    railThreadOrder,
    useThreadsQuery,
    useWorkspacesQuery,
} from "@/lib/workspace";
import { StudioWorkspaceRail } from "./workspace-rail";
import { StudioTitleBar } from "./title-bar";

/**
 * The studio's persistent shell. Keeps the rail, title bar, right rail and
 * bottom dock mounted across navigation; only `props.children` swaps.
 */
export const AppShell: Component<RouteSectionProps> = (props) => {
    const ui = useUIState();
    const { onAction } = useShortcuts();
    const navigate = useNavigate();

    const workspacesQuery = useWorkspacesQuery();
    const threadsQuery = useThreadsQuery();

    const VIEW_TO_ACTION: Record<ThreadViewId, ShortcutActionId> = {
        chat: "view_chat",
        diff: "view_diff",
        files: "view_files",
        browser: "view_browser",
        terminal: "view_terminal",
        tests: "view_tests",
        review: "view_review",
        pr: "view_pr",
        git: "view_git",
    };

    for (const view of THREAD_VIEW_ORDER) {
        onCleanup(onAction(VIEW_TO_ACTION[view], () => ui.setActiveView(view)));
    }

    const SLOT_ACTIONS: ShortcutActionId[] = [
        "go_thread_slot_1",
        "go_thread_slot_2",
        "go_thread_slot_3",
        "go_thread_slot_4",
        "go_thread_slot_5",
        "go_thread_slot_6",
    ];

    function jumpToSlot(slot: number) {
        const order = railThreadOrder(
            workspacesQuery.data ?? [],
            threadsQuery.data ?? [],
        );
        const entry = order[slot];
        if (!entry) return;
        navigate(paths.thread(entry.workspaceId, entry.thread.ID));
    }

    SLOT_ACTIONS.forEach((id, i) => {
        onCleanup(onAction(id, () => jumpToSlot(i)));
    });

    onCleanup(onAction("toggle_context_rail", ui.toggleContextRail));
    onCleanup(onAction("toggle_bottom_dock", ui.toggleBottomDock));
    onCleanup(onAction("cycle_focus_region", ui.cycleFocusRegion));
    onCleanup(onAction("open_hub", () => navigate(paths.hub())));
    onCleanup(
        onAction("open_global_settings", () =>
            navigate(paths.globalSettings()),
        ),
    );
    onCleanup(onAction("open_command_palette", ui.openCommandPalette));
    onCleanup(onAction("new_workspace", ui.openNewWorkspaceDialog));

    return (
        <AppShellFrame
            titleBar={<StudioTitleBar />}
            leftRail={<StudioWorkspaceRail />}
            leftRailWidth={ui.leftRailWidth()}
            onLeftRailWidthChange={ui.setLeftRailWidth}
            rightRail={ui.contextRailVisible() ? <ContextRailDefault /> : false}
            rightRailWidth={ui.rightRailWidth()}
            onRightRailWidthChange={ui.setRightRailWidth}
            bottomDock={ui.bottomDockVisible() ? <BottomDockDefault /> : false}
            bottomDockHeight={ui.bottomDockHeight()}
            onBottomDockHeightChange={ui.setBottomDockHeight}
        >
            {props.children}
        </AppShellFrame>
    );
};

const ContextRailDefault: Component = () => {
    return (
        <ContextRailColumn
            eyebrow="Context"
            title="Agent scratchpad"
        >
            <EmptyState
                size="sm"
                icon={Bot}
                title="No active stream"
                description="Once an agent starts, its reasoning, tool calls, and token meter show up here."
            />
        </ContextRailColumn>
    );
};

const BottomDockDefault: Component = () => {
    return (
        <TabsRoot
            defaultValue="terminal"
            size="sm"
            class="h-full"
        >
            <div class="flex h-9 shrink-0 items-center justify-between border-b border-void-700 px-2">
                <TabsList aria-label="Bottom dock tabs">
                    <TabsTrigger value="terminal">
                        <Terminal
                            class="size-3.5"
                            stroke-width={1.75}
                        />
                        Terminal
                    </TabsTrigger>
                    <TabsTrigger value="tests">
                        <FlaskConical
                            class="size-3.5"
                            stroke-width={1.75}
                        />
                        Tests
                    </TabsTrigger>
                    <TabsTrigger value="logs">
                        <ScrollText
                            class="size-3.5"
                            stroke-width={1.75}
                        />
                        Logs
                    </TabsTrigger>
                    <TabsTrigger value="agent">
                        <Layers
                            class="size-3.5"
                            stroke-width={1.75}
                        />
                        Agent
                    </TabsTrigger>
                </TabsList>
            </div>
            <div class="min-h-0 flex-1 overflow-y-auto p-3">
                <TabsContent value="terminal">
                    <DockEmpty
                        icon={Terminal}
                        title="No terminal session"
                        copy="Open a thread and press ⌘5 to spin up a shell."
                    />
                </TabsContent>
                <TabsContent value="tests">
                    <DockEmpty
                        icon={FlaskConical}
                        title="No test run yet"
                        copy="Configure the workspace test command in Workspace settings."
                    />
                </TabsContent>
                <TabsContent value="logs">
                    <DockEmpty
                        icon={ScrollText}
                        title="Logs are quiet"
                        copy="Backend events will stream here once the Wails runtime is running."
                    />
                </TabsContent>
                <TabsContent value="agent">
                    <DockEmpty
                        icon={Layers}
                        title="No agent activity"
                        copy="Start a thread, then watch the agent's stream live in this dock."
                    />
                </TabsContent>
            </div>
        </TabsRoot>
    );
};

interface DockEmptyProps {
    icon: Parameters<typeof EmptyState>[0]["icon"];
    title: string;
    copy: string;
}

const DockEmpty: Component<DockEmptyProps> = (props) => {
    return (
        <EmptyState
            icon={props.icon}
            size="sm"
            title={props.title}
            description={props.copy}
        />
    );
};
