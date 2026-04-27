import { useNavigate, useParams } from "@solidjs/router";
import {
    Chip,
    EmptyState,
    Spinner,
    ViewSwitcher,
    type ViewSwitcherItem,
} from "@moondust/components";
import MessageSquare from "lucide-solid/icons/message-square";
import GitDiff from "lucide-solid/icons/file-diff";
import Folder from "lucide-solid/icons/folder";
import Globe from "lucide-solid/icons/globe";
import Terminal from "lucide-solid/icons/terminal";
import FlaskConical from "lucide-solid/icons/flask-conical";
import ListChecks from "lucide-solid/icons/list-checks";
import GitPullRequest from "lucide-solid/icons/git-pull-request";
import Network from "lucide-solid/icons/network";
import Bot from "lucide-solid/icons/bot";
import {
    createEffect,
    createMemo,
    createSignal,
    Match,
    Show,
    Switch,
    type Component,
} from "solid-js";
import { paths, useThreadQuery, useWorkspaceQuery } from "@/lib/workspace";
import {
    type ShortcutActionId,
    type ThreadViewId,
    useShortcuts,
} from "@/lib/shortcuts";
import { useUIState } from "@/lib/ui-state";
import { ThreadComposer } from "@/layouts/thread-composer";

const VIEWS: readonly {
    id: ThreadViewId;
    label: string;
    icon: ViewSwitcherItem["icon"];
    actionId: ShortcutActionId;
}[] = [
    { id: "chat", label: "Chat", icon: MessageSquare, actionId: "view_chat" },
    { id: "diff", label: "Diff", icon: GitDiff, actionId: "view_diff" },
    { id: "files", label: "Files", icon: Folder, actionId: "view_files" },
    { id: "browser", label: "Browser", icon: Globe, actionId: "view_browser" },
    {
        id: "terminal",
        label: "Terminal",
        icon: Terminal,
        actionId: "view_terminal",
    },
    { id: "tests", label: "Tests", icon: FlaskConical, actionId: "view_tests" },
    {
        id: "review",
        label: "Review",
        icon: ListChecks,
        actionId: "view_review",
    },
    { id: "pr", label: "PR", icon: GitPullRequest, actionId: "view_pr" },
    { id: "git", label: "Git", icon: Network, actionId: "view_git" },
];

/**
 * Stub thread page. The chat view is the default; switching views never
 * unmounts the chat stream because the chat container stays mounted via
 * `<Show keepAlive />` (see `ChatViewStub`). All other views are
 * placeholder cards for now.
 */
export const ThreadPage: Component = () => {
    const params = useParams<{ workspaceId: string; threadId: string }>();
    const navigate = useNavigate();
    const ui = useUIState();
    const { formatCaps } = useShortcuts();

    const workspaceQuery = useWorkspaceQuery(() => params.workspaceId);
    const threadQuery = useThreadQuery(() => params.threadId);

    const items = createMemo<ViewSwitcherItem[]>(() =>
        VIEWS.map((v) => ({
            id: v.id,
            label: v.label,
            icon: v.icon,
            shortcut: formatCaps(v.actionId),
        })),
    );

    return (
        <div class="flex min-h-0 min-w-0 flex-1 flex-col">
            <div class="flex h-10 shrink-0 items-center gap-2 border-b border-void-700 bg-void-900 px-3">
                <ViewSwitcher
                    aria-label="Thread views"
                    items={items()}
                    activeId={ui.activeView()}
                    onChange={(id) => ui.setActiveView(id as ThreadViewId)}
                />
            </div>

            <div class="flex min-h-0 min-w-0 flex-1 flex-col">
                <div class="min-h-0 min-w-0 flex-1 overflow-hidden">
                    <Switch>
                        <Match when={ui.activeView() === "chat"}>
                            <ChatViewStub />
                        </Match>
                        <Match when={ui.activeView() === "diff"}>
                            <PlaceholderView
                                view="Diff"
                                copy="Hunks for the current branch will render here. Right rail surfaces the file change list."
                                icon={GitDiff}
                            />
                        </Match>
                        <Match when={ui.activeView() === "files"}>
                            <PlaceholderView
                                view="Files"
                                copy="Inline file tree + read-only viewer scoped to the worktree."
                                icon={Folder}
                            />
                        </Match>
                        <Match when={ui.activeView() === "browser"}>
                            <PlaceholderView
                                view="Browser"
                                copy="Embedded webview tied to this thread, with DevTools in the right rail."
                                icon={Globe}
                            />
                        </Match>
                        <Match when={ui.activeView() === "terminal"}>
                            <PlaceholderView
                                view="Terminal"
                                copy="Full-screen terminal session for the thread's worktree."
                                icon={Terminal}
                            />
                        </Match>
                        <Match when={ui.activeView() === "tests"}>
                            <PlaceholderView
                                view="Tests"
                                copy="Run the workspace test command and inspect failures."
                                icon={FlaskConical}
                            />
                        </Match>
                        <Match when={ui.activeView() === "review"}>
                            <PlaceholderView
                                view="Review"
                                copy="AI self-review and human comments live side by side."
                                icon={ListChecks}
                            />
                        </Match>
                        <Match when={ui.activeView() === "pr"}>
                            <PlaceholderView
                                view="Pull request"
                                copy="Inline PR description, checks, and reviewer comments via the gh CLI."
                                icon={GitPullRequest}
                            />
                        </Match>
                        <Match when={ui.activeView() === "git"}>
                            <PlaceholderView
                                view="Git log"
                                copy="Commit graph, blame, and cherry-pick tools for this worktree."
                                icon={Network}
                            />
                        </Match>
                    </Switch>
                </div>
                <ThreadComposer
                    threadTitle={threadQuery.data?.Title ?? "this thread"}
                    activeAgent={
                        threadQuery.data?.ChatProvider ?? "Cursor Agent"
                    }
                    activeModel={
                        threadQuery.data?.ChatModel ?? "claude-sonnet-4.6"
                    }
                    collapsed={ui.activeView() !== "chat"}
                />
            </div>

            <Show when={workspaceQuery.isPending || threadQuery.isPending}>
                <div class="absolute right-4 top-4 z-10">
                    <Spinner />
                </div>
            </Show>

            <NotFoundEffect
                show={Boolean(
                    !workspaceQuery.isPending &&
                    !threadQuery.isPending &&
                    (!workspaceQuery.data || !threadQuery.data),
                )}
                onMissing={() => navigate(paths.hub())}
            />
        </div>
    );
};

interface NotFoundEffectProps {
    show: boolean;
    onMissing: () => void;
}

const NotFoundEffect: Component<NotFoundEffectProps> = (props) => {
    createEffect(() => {
        if (props.show) props.onMissing();
    });
    return null;
};

const ChatViewStub: Component = () => {
    return (
        <div class="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <Bot
                class="size-8 text-starlight-300"
                stroke-width={1.5}
            />
            <p class="max-w-sm text-[13px] text-void-300">
                The chat stream lives here. Once the agent runtime is wired up,
                messages will replace this placeholder while the composer below
                stays anchored to the bottom.
            </p>
            <div class="flex items-center gap-1.5 text-[11px] text-void-500">
                <Chip
                    tone="outline"
                    size="sm"
                >
                    Idle
                </Chip>
                <span>Press </span>
                <Chip
                    tone="neutral"
                    size="sm"
                >
                    ⌘ L
                </Chip>
                <span> to focus the composer.</span>
            </div>
        </div>
    );
};

interface PlaceholderViewProps {
    view: string;
    copy: string;
    icon: ViewSwitcherItem["icon"];
}

const PlaceholderView: Component<PlaceholderViewProps> = (props) => {
    const [seed] = createSignal(props.view);
    return (
        <div class="flex min-h-0 min-w-0 flex-1 items-center justify-center p-8">
            <EmptyState
                icon={props.icon}
                title={`${seed()} view`}
                description={props.copy}
                size="default"
            />
        </div>
    );
};
