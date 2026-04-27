import { useLocation, useNavigate } from "@solidjs/router";
import {
    Button,
    Chip,
    EmptyState,
    HubCard,
    HubCardGrid,
    KbdHint,
    Spinner,
    Text,
} from "@moondust/components";
import GitBranch from "lucide-solid/icons/git-branch";
import Clock from "lucide-solid/icons/clock";
import MessageSquare from "lucide-solid/icons/message-square";
import FolderPlus from "lucide-solid/icons/folder-plus";
import Plus from "lucide-solid/icons/plus";
import { useQueryClient } from "@tanstack/solid-query";
import { createMemo, For, Show, type Component, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { useShortcuts } from "@/lib/shortcuts";
import { useToast } from "@/lib/toast";
import { useUIState } from "@/lib/ui-state";
import {
    createThreadInWorkspace,
    paths,
    recentThreadOrder,
    sortWorkspacesByLatestThread,
    useThreadsQuery,
    useWorkspacesQuery,
    type Thread,
    type Workspace,
} from "@/lib/workspace";
import { relativeTime } from "@/lib/time";

function errMsg(e: unknown): string {
    if (e instanceof Error) return e.message;
    return String(e);
}

const KEYBOARD_TIPS = [
    { caps: ["⌘", "K"], copy: "Run any command from the launcher." },
    {
        caps: ["⌘", "1"],
        copy: "Switch to the Chat view in the focused thread.",
    },
    { caps: ["⌘", "B"], copy: "Toggle the right context rail." },
    {
        caps: ["⌘", "`"],
        copy: "Toggle the bottom dock (terminal / tests / logs).",
    },
    { caps: ["F6"], copy: "Cycle focus between rail / main / context / dock." },
];

/**
 * The Hub. Renders three sections: continue (recent threads), workspaces,
 * and quick create. The composer is intentionally absent here — the Hub is
 * a navigation surface, not a chat surface.
 */
export const HomePage: Component = () => {
    const workspacesQuery = useWorkspacesQuery();
    const threadsQuery = useThreadsQuery();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const toast = useToast();
    const { formatCaps } = useShortcuts();
    const { openCommandPalette, openNewWorkspaceDialog } = useUIState();

    const workspaces = () => workspacesQuery.data ?? [];
    const threads = () => threadsQuery.data ?? [];

    const recent = createMemo(() => recentThreadOrder(workspaces(), threads()));
    const sortedWorkspaces = createMemo(() =>
        sortWorkspacesByLatestThread(workspaces(), threads()),
    );

    const workspaceThreadCount = (id: string): number =>
        threads().filter((t) => t.WorkspaceID === id).length;

    async function quickNewThread() {
        const m = location.pathname.match(/^\/w\/([^/]+)/);
        let pid = m?.[1];
        if (!pid) {
            const list = sortedWorkspaces();
            if (list.length === 0) {
                toast.showToast({
                    title: "No workspaces yet",
                    body: "Add a workspace first, then create a thread.",
                });
                return;
            }
            if (list.length === 1) {
                pid = list[0].ID;
            } else {
                toast.showToast({
                    title: "Pick a workspace",
                    body: "Open a workspace from the list below, then create a thread there.",
                });
                return;
            }
        }
        try {
            await createThreadInWorkspace(queryClient, navigate, pid);
        } catch (e) {
            toast.showToast({
                title: "Could not create thread",
                body: errMsg(e),
            });
        }
    }

    return (
        <div class="min-h-0 min-w-0 flex-1 overflow-y-auto">
            <div class="mx-auto flex max-w-6xl flex-col gap-10 px-8 py-10">
                <header class="flex flex-col gap-2">
                    <Text variant="eyebrow">Hub</Text>
                    <h1 class="text-2xl font-semibold tracking-tight text-void-50">
                        Welcome back.
                    </h1>
                    <p class="max-w-xl text-[13px] text-void-400">
                        Pick up where you left off, jump into a workspace, or
                        spin up something new.
                    </p>
                </header>

                <Show
                    when={workspacesQuery.isPending || threadsQuery.isPending}
                >
                    <div class="flex items-center justify-center py-10">
                        <Spinner />
                    </div>
                </Show>

                <Show when={recent().length > 0}>
                    <section class="flex flex-col gap-3">
                        <SectionHeader
                            label="Continue where you left off"
                            hint="Most recently active threads."
                        />
                        <HubCardGrid minCardWidth={300}>
                            <For each={recent()}>
                                {(entry) => (
                                    <RecentThreadCard
                                        thread={entry.thread}
                                        workspace={
                                            workspaces().find(
                                                (w) =>
                                                    w.ID === entry.workspaceId,
                                            ) ?? null
                                        }
                                        onOpen={() =>
                                            navigate(
                                                paths.thread(
                                                    entry.workspaceId,
                                                    entry.thread.ID,
                                                ),
                                            )
                                        }
                                    />
                                )}
                            </For>
                        </HubCardGrid>
                    </section>
                </Show>

                <section class="flex flex-col gap-3">
                    <SectionHeader
                        label="Workspaces"
                        hint="All folders you've opened."
                        actions={
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={openNewWorkspaceDialog}
                            >
                                <FolderPlus class="size-3.5" />
                                Open folder
                                <KbdHint
                                    combo={formatCaps("new_workspace")}
                                    class="opacity-70"
                                />
                            </Button>
                        }
                    />

                    <Show
                        when={sortedWorkspaces().length > 0}
                        fallback={
                            <EmptyState
                                icon={FolderPlus}
                                title="No workspaces yet"
                                description="Open a folder to start working with Moondust."
                                actions={
                                    <Button
                                        variant="default"
                                        onClick={openNewWorkspaceDialog}
                                    >
                                        Open a folder
                                    </Button>
                                }
                                bordered
                            />
                        }
                    >
                        <HubCardGrid minCardWidth={260}>
                            <For each={sortedWorkspaces()}>
                                {(workspace) => (
                                    <WorkspaceCard
                                        workspace={workspace}
                                        threadCount={workspaceThreadCount(
                                            workspace.ID,
                                        )}
                                        onOpen={() =>
                                            navigate(
                                                paths.workspace(workspace.ID),
                                            )
                                        }
                                    />
                                )}
                            </For>
                        </HubCardGrid>
                    </Show>
                </section>

                <section class="flex flex-col gap-3">
                    <SectionHeader
                        label="Quick create"
                        hint="One keystroke is enough."
                    />
                    <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <QuickCreateButton
                            icon={FolderPlus}
                            title="Open folder as workspace"
                            shortcut={formatCaps("new_workspace")}
                            onClick={openNewWorkspaceDialog}
                        />
                        <QuickCreateButton
                            icon={Plus}
                            title="New thread in focused workspace"
                            shortcut={formatCaps("new_thread")}
                            onClick={() => void quickNewThread()}
                        />
                        <QuickCreateButton
                            icon={MessageSquare}
                            title="Run a command"
                            shortcut={formatCaps("open_command_palette")}
                            onClick={openCommandPalette}
                        />
                    </div>
                </section>

                <footer class="flex flex-col gap-2 border-t border-void-700/60 pt-4">
                    <Text variant="eyebrow">Keyboard tips</Text>
                    <ul class="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <For each={KEYBOARD_TIPS}>
                            {(tip) => (
                                <li class="flex items-center gap-2 text-[12px] text-void-400">
                                    <KbdHint combo={tip.caps} />
                                    <span>{tip.copy}</span>
                                </li>
                            )}
                        </For>
                    </ul>
                </footer>
            </div>
        </div>
    );
};

interface SectionHeaderProps {
    label: string;
    hint?: string;
    actions?: JSX.Element;
}

const SectionHeader: Component<SectionHeaderProps> = (props) => (
    <div class="flex items-end justify-between gap-3">
        <div class="flex flex-col">
            <Text variant="eyebrow">{props.label}</Text>
            <Show when={props.hint}>
                <p class="text-[12px] text-void-500">{props.hint}</p>
            </Show>
        </div>
        <Show when={props.actions}>{props.actions}</Show>
    </div>
);

interface RecentThreadCardProps {
    thread: Thread;
    workspace: Workspace | null;
    onOpen: () => void;
}

const RecentThreadCard: Component<RecentThreadCardProps> = (props) => (
    <HubCard
        eyebrow={
            <span class="inline-flex items-center gap-1.5">
                {props.workspace?.Name ?? "Workspace"}
                <Chip
                    size="sm"
                    tone="outline"
                >
                    Thread
                </Chip>
            </span>
        }
        title={props.thread.Title || "Untitled thread"}
        preview={
            <span>
                {props.thread.ChatProvider}
                {props.thread.ChatModel ? (
                    <span class="text-void-500">
                        {" "}
                        · {props.thread.ChatModel}
                    </span>
                ) : null}
            </span>
        }
        meta={[
            {
                id: "branch",
                icon: GitBranch,
                label: props.workspace?.Branch || "main",
            },
            {
                id: "time",
                icon: Clock,
                label: relativeTime(
                    props.thread.UpdatedAt || props.thread.CreatedAt,
                ),
            },
        ]}
        onClick={() => props.onOpen()}
    />
);

interface WorkspaceCardProps {
    workspace: Workspace;
    threadCount: number;
    onOpen: () => void;
}

const WorkspaceCard: Component<WorkspaceCardProps> = (props) => (
    <HubCard
        eyebrow="Workspace"
        title={props.workspace.Name || props.workspace.ID}
        preview={props.workspace.Directory}
        meta={[
            {
                id: "branch",
                icon: GitBranch,
                label: props.workspace.Branch || "main",
            },
            {
                id: "threads",
                icon: MessageSquare,
                label: `${props.threadCount} thread${props.threadCount === 1 ? "" : "s"}`,
            },
            {
                id: "updated",
                icon: Clock,
                label: relativeTime(
                    props.workspace.UpdatedAt || props.workspace.CreatedAt,
                ),
            },
        ]}
        onClick={() => props.onOpen()}
    />
);

type LucideIcon = Component<
    JSX.SvgSVGAttributes<SVGSVGElement> & { "stroke-width"?: number }
>;

interface QuickCreateButtonProps {
    icon: LucideIcon;
    title: string;
    shortcut: readonly string[];
    onClick: () => void;
}

const QuickCreateButton: Component<QuickCreateButtonProps> = (props) => {
    return (
        <button
            type="button"
            class="group/qc flex h-24 cursor-pointer flex-col justify-between border border-void-700 bg-void-900 p-3 text-left text-void-200 transition-colors hover:border-void-600 hover:bg-void-850 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-starlight-400/60"
            onClick={() => props.onClick()}
        >
            <div class="flex items-center gap-2 text-[13px] font-medium text-void-50">
                <Dynamic
                    component={props.icon}
                    class="size-4 text-starlight-300"
                    stroke-width={1.75}
                />
                <span>{props.title}</span>
            </div>
            <div class="flex items-center justify-end">
                <KbdHint combo={props.shortcut} />
            </div>
        </button>
    );
};
