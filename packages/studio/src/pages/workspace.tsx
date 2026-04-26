import { useNavigate, useParams } from "@solidjs/router";
import {
    Button,
    Chip,
    EmptyState,
    HubCard,
    HubCardGrid,
    Spinner,
    Text,
} from "@moondust/components";
import GitBranch from "lucide-solid/icons/git-branch";
import Clock from "lucide-solid/icons/clock";
import MessageSquarePlus from "lucide-solid/icons/message-square-plus";
import { createMemo, For, Show, type Component } from "solid-js";
import { useUIState } from "@/lib/ui-state";
import {
    paths,
    sortThreadsForProject,
    useProjectQuery,
    useThreadsByProjectQuery,
} from "@/lib/workspace";
import { relativeTime } from "@/lib/time";

/**
 * Workspace overview. Lands the user inside a workspace without picking a
 * thread yet — useful for "open folder, see what's in flight." The shell
 * keeps the rail and breadcrumb mounted, so this page is the central
 * column only.
 */
export const WorkspacePage: Component = () => {
    const params = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { openCommandPalette } = useUIState();

    const projectQuery = useProjectQuery(() => params.projectId);
    const threadsQuery = useThreadsByProjectQuery(() => params.projectId);

    const sortedThreads = createMemo(() =>
        sortThreadsForProject(params.projectId, threadsQuery.data ?? []),
    );

    return (
        <div class="min-h-0 min-w-0 flex-1 overflow-y-auto">
            <Show
                when={projectQuery.data}
                fallback={
                    <Show
                        when={projectQuery.isPending}
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
                {(project) => (
                    <div class="mx-auto flex max-w-5xl flex-col gap-8 px-8 py-10">
                        <header class="flex flex-col gap-2">
                            <Text variant="eyebrow">Workspace</Text>
                            <h1 class="text-2xl font-semibold tracking-tight text-void-50">
                                {project().Name}
                            </h1>
                            <p class="text-[12px] font-mono text-void-500">
                                {project().Directory}
                            </p>
                            <div class="mt-2 flex flex-wrap items-center gap-2">
                                <Chip
                                    tone="outline"
                                    size="sm"
                                    icon={GitBranch}
                                >
                                    {project().Branch || "main"}
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
                                    onClick={openCommandPalette}
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
                                                onClick={openCommandPalette}
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
                                                            project().Branch ||
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
                                                            project().ID,
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
