import { useNavigate, useParams } from "@solidjs/router";
import {
    Button,
    Chip,
    EmptyState,
    HubCard,
    HubCardGrid,
    IconButton,
    Spinner,
    Text,
} from "@moondust/components";
import GitBranch from "lucide-solid/icons/git-branch";
import Settings from "lucide-solid/icons/settings";
import Clock from "lucide-solid/icons/clock";
import MessageSquarePlus from "lucide-solid/icons/message-square-plus";
import { useQueryClient } from "@tanstack/solid-query";
import { createMemo, For, Show, type Component } from "solid-js";
import { useToast } from "@/lib/toast";
import {
    createThreadInWorkspace,
    paths,
    sortThreadsForWorkspace,
    useThreadsByWorkspaceQuery,
    useWorkspaceQuery,
} from "@/lib/workspace";
import { relativeTime } from "@/lib/time";

function errMsg(e: unknown): string {
    if (e instanceof Error) return e.message;
    return String(e);
}

/**
 * Workspace overview. Lands the user inside a workspace without picking a
 * thread yet — useful for "open folder, see what's in flight." The shell
 * keeps the rail and breadcrumb mounted, so this page is the central
 * column only.
 */
export const WorkspacePage: Component = () => {
    const params = useParams<{ workspaceId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    const workspaceQuery = useWorkspaceQuery(() => params.workspaceId);
    const threadsQuery = useThreadsByWorkspaceQuery(() => params.workspaceId);

    const sortedThreads = createMemo(() =>
        sortThreadsForWorkspace(params.workspaceId, threadsQuery.data ?? []),
    );

    async function addThread() {
        const wid = params.workspaceId;
        if (!wid) return;
        try {
            await createThreadInWorkspace(queryClient, navigate, wid);
        } catch (e) {
            toast.showToast({
                title: "Could not create thread",
                body: errMsg(e),
            });
        }
    }

    return (
        <div class="min-h-0 min-w-0 flex-1 overflow-y-auto">
            <Show
                when={workspaceQuery.data}
                fallback={
                    <Show
                        when={workspaceQuery.isPending}
                        fallback={
                            <div class="flex h-full items-center justify-center p-10">
                                <EmptyState
                                    title="Workspace not found"
                                    description="It may have been removed; head back to the Hub."
                                    actions={
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                navigate(paths.hub())
                                            }
                                        >
                                            Back to Hub
                                        </Button>
                                    }
                                    bordered
                                />
                            </div>
                        }
                    >
                        <div class="flex h-full items-center justify-center p-10">
                            <Spinner />
                        </div>
                    </Show>
                }
            >
                {(workspace) => (
                    <div class="mx-auto flex max-w-5xl flex-col gap-8 px-8 py-10">
                        <header class="flex flex-col gap-2">
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0 flex-1 flex flex-col gap-2">
                                    <Text variant="eyebrow">Workspace</Text>
                                    <h1 class="text-2xl font-semibold tracking-tight text-void-50">
                                        {workspace().Name}
                                    </h1>
                                    <p class="text-[12px] font-mono text-void-500">
                                        {workspace().Directory}
                                    </p>
                                </div>
                                <IconButton
                                    aria-label="Workspace settings"
                                    size="sm"
                                    tooltip="Workspace settings"
                                    onClick={() =>
                                        navigate(
                                            paths.workspaceSettings(
                                                workspace().ID,
                                            ),
                                        )
                                    }
                                >
                                    <Settings
                                        class="size-3.5"
                                        stroke-width={1.75}
                                    />
                                </IconButton>
                            </div>
                            <div class="mt-2 flex flex-wrap items-center gap-2">
                                <Chip
                                    tone="outline"
                                    size="sm"
                                    icon={GitBranch}
                                >
                                    {workspace().Branch || "main"}
                                </Chip>
                                <Chip
                                    tone="neutral"
                                    size="sm"
                                >
                                    {sortedThreads().length} thread
                                    {sortedThreads().length === 1 ? "" : "s"}
                                </Chip>
                            </div>
                        </header>

                        <section class="flex flex-col gap-3">
                            <div class="flex items-end justify-between gap-3">
                                <div>
                                    <Text variant="eyebrow">Threads</Text>
                                    <p class="text-[12px] text-void-500">
                                        Newest first.
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => void addThread()}
                                >
                                    <MessageSquarePlus class="size-3.5" />
                                    New thread
                                </Button>
                            </div>

                            <Show
                                when={sortedThreads().length > 0}
                                fallback={
                                    <EmptyState
                                        icon={MessageSquarePlus}
                                        title="No threads yet"
                                        description="Start a thread to begin a conversation in this workspace."
                                        actions={
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => void addThread()}
                                            >
                                                New thread
                                            </Button>
                                        }
                                        bordered
                                    />
                                }
                            >
                                <HubCardGrid minCardWidth={280}>
                                    <For each={sortedThreads()}>
                                        {(thread) => (
                                            <HubCard
                                                eyebrow="Thread"
                                                title={
                                                    thread.Title ||
                                                    "Untitled thread"
                                                }
                                                preview={
                                                    <span>
                                                        {thread.ChatProvider}
                                                        <Show
                                                            when={
                                                                thread.ChatModel
                                                            }
                                                        >
                                                            <span class="text-void-500">
                                                                {" "}
                                                                ·{" "}
                                                                {
                                                                    thread.ChatModel
                                                                }
                                                            </span>
                                                        </Show>
                                                    </span>
                                                }
                                                meta={[
                                                    {
                                                        id: "branch",
                                                        icon: GitBranch,
                                                        label:
                                                            workspace()
                                                                .Branch ||
                                                            "main",
                                                    },
                                                    {
                                                        id: "time",
                                                        icon: Clock,
                                                        label: relativeTime(
                                                            thread.UpdatedAt ||
                                                                thread.CreatedAt,
                                                        ),
                                                    },
                                                ]}
                                                onClick={() =>
                                                    navigate(
                                                        paths.thread(
                                                            workspace().ID,
                                                            thread.ID,
                                                        ),
                                                    )
                                                }
                                            />
                                        )}
                                    </For>
                                </HubCardGrid>
                            </Show>
                        </section>
                    </div>
                )}
            </Show>
        </div>
    );
};
