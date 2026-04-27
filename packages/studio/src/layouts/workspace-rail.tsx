import { A, useLocation, useNavigate, useParams } from "@solidjs/router";
import {
    Button,
    CommandLauncher,
    EmptyState,
    HoverReveal,
    IconButton,
    KbdHint,
    Spinner,
    WorkspaceRail,
    WorkspaceRailProject,
    WorkspaceRailSection,
    WorkspaceRailThread,
    type ThreadStreamPhase,
} from "@moondust/components";
import Plus from "lucide-solid/icons/plus";
import Settings from "lucide-solid/icons/settings";
import Moon from "lucide-solid/icons/moon";
import {
    createMemo,
    createSignal,
    For,
    Show,
    onCleanup,
    type Component,
} from "solid-js";
import { useQueryClient } from "@tanstack/solid-query";
import { queryKeys } from "@/lib/query-client";
import { type ShortcutActionId, useShortcuts } from "@/lib/shortcuts";
import { useToast } from "@/lib/toast";
import { useUIState } from "@/lib/ui-state";
import { RenameThread } from "@/lib/wails";
import {
    createThreadInWorkspace,
    paths,
    railThreadOrder,
    railThreadSlotIndex,
    sortThreadsForWorkspace,
    sortWorkspacesByLatestThread,
    type Thread,
    useThreadsQuery,
    useWorkspacesQuery,
} from "@/lib/workspace";
import { relativeTime } from "@/lib/time";

function errMsg(e: unknown): string {
    if (e instanceof Error) return e.message;
    return String(e);
}

const TICK_INTERVAL_MS = 60_000;

const SLOT_ACTION_IDS: readonly ShortcutActionId[] = [
    "go_thread_slot_1",
    "go_thread_slot_2",
    "go_thread_slot_3",
    "go_thread_slot_4",
    "go_thread_slot_5",
    "go_thread_slot_6",
];

/**
 * The persistent left rail. Wires the headless `WorkspaceRail` primitives
 * (from `@moondust/components`) to live workspace + thread data and pipes
 * keyboard actions (⌘N, ⌘⇧N, ⌘⇧, etc.) through the shortcut bus.
 */
export const StudioWorkspaceRail: Component = () => {
    const workspacesQuery = useWorkspacesQuery();
    const threadsQuery = useThreadsQuery();
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams<{ workspaceId?: string; threadId?: string }>();
    const { formatCaps, onAction } = useShortcuts();
    const { openCommandPalette, openNewWorkspaceDialog } = useUIState();
    const queryClient = useQueryClient();
    const toast = useToast();

    const [tick, setTick] = createSignal(0);
    const [renamingThreadId, setRenamingThreadId] = createSignal<string | null>(
        null,
    );
    const [renameDraft, setRenameDraft] = createSignal("");
    const timer = setInterval(() => setTick((n) => n + 1), TICK_INTERVAL_MS);
    onCleanup(() => clearInterval(timer));

    const workspaces = () => workspacesQuery.data ?? [];
    const threads = () => threadsQuery.data ?? [];

    const sortedWorkspaces = createMemo(() =>
        sortWorkspacesByLatestThread(workspaces(), threads()),
    );
    const slotByThread = createMemo(() =>
        railThreadSlotIndex(workspaces(), threads()),
    );
    const recentThreads = createMemo(() =>
        railThreadOrder(workspaces(), threads()).slice(0, 5),
    );

    const focusedWorkspaceId = createMemo(() => {
        const m = location.pathname.match(/^\/w\/([^/]+)/);
        return m?.[1] ?? null;
    });

    async function newThread() {
        const wid = focusedWorkspaceId();
        if (!wid) {
            toast.showToast({
                title: "No workspace in focus",
                body: "Open a workspace from the hub or sidebar, then try again.",
            });
            return;
        }
        try {
            await createThreadInWorkspace(queryClient, navigate, wid);
        } catch (e) {
            toast.showToast({
                title: "Could not create thread",
                body: errMsg(e),
            });
        }
    }

    function newWorkspace() {
        openNewWorkspaceDialog();
    }

    onCleanup(onAction("new_thread", newThread));

    const phaseFor = (threadId: string): ThreadStreamPhase => {
        // Placeholder: chat stream subsystem will set this per-thread once it
        // lands; keep the wiring point obvious.
        void threadId;
        return "idle";
    };

    function startRenameThread(thread: Thread) {
        setRenamingThreadId(thread.ID);
        setRenameDraft(thread.Title);
    }

    function cancelRenameThread() {
        setRenamingThreadId(null);
    }

    async function commitRenameThread() {
        const id = renamingThreadId();
        if (!id) return;
        const thread = threads().find((t) => t.ID === id);
        if (!thread) {
            setRenamingThreadId(null);
            return;
        }
        const prev = thread.Title;
        const next = renameDraft().trim();
        setRenamingThreadId(null);
        if (next === prev) return;
        try {
            await RenameThread(id, next);
            await queryClient.invalidateQueries({
                queryKey: queryKeys.threads.all,
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.threads.detail(id),
            });
        } catch (err) {
            toast.showToast({
                title: "Could not rename thread",
                body: errMsg(err),
            });
        }
    }

    function railThreadRow(
        workspaceId: string,
        thread: Thread,
        slotShortcut: readonly string[] | undefined,
    ) {
        const renaming = () => renamingThreadId() === thread.ID;
        return (
            <WorkspaceRailThread
                href={paths.thread(workspaceId, thread.ID)}
                title={thread.Title || "Untitled thread"}
                timeLabel={
                    (tick(),
                    relativeTime(thread.UpdatedAt || thread.CreatedAt))
                }
                phase={phaseFor(thread.ID)}
                shortcut={slotShortcut}
                active={params.threadId === thread.ID}
                renaming={renaming()}
                renameDraft={renameDraft()}
                onRenameDraft={setRenameDraft}
                onRenameCommit={() => void commitRenameThread()}
                onRenameCancel={cancelRenameThread}
                onDblClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    startRenameThread(thread);
                }}
                renderLink={(p) => (
                    <A
                        href={p.href}
                        class={p.class}
                        activeClass="bg-void-800 text-void-50"
                        onDblClick={p.onDblClick}
                    >
                        {p.children}
                    </A>
                )}
            />
        );
    }

    return (
        <WorkspaceRail
            header={
                <div class="flex flex-col gap-2 border-b border-void-700/60 px-3 py-3">
                    <A
                        href={paths.hub()}
                        end
                        class="group flex items-center gap-2 text-[13px] font-semibold tracking-tight text-void-100 no-underline transition-colors hover:text-void-50"
                    >
                        <Moon
                            class="size-4 text-starlight-300"
                            stroke-width={1.75}
                        />
                        <span>Moondust</span>
                        <span class="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                            <KbdHint combo={formatCaps("open_hub")} />
                        </span>
                    </A>
                    <CommandLauncher
                        onClick={openCommandPalette}
                        shortcut={formatCaps("open_command_palette")}
                    />
                </div>
            }
            footer={
                <div class="flex flex-col gap-1 px-2 py-2">
                    <Show when={workspacesQuery.isPending}>
                        <div class="flex items-center justify-center py-2">
                            <Spinner />
                        </div>
                    </Show>
                    <A
                        href={paths.globalSettings()}
                        class="group/settings flex h-7 items-center gap-2 px-2 text-[12.5px] text-void-400 no-underline transition-colors hover:bg-void-800/60 hover:text-void-100"
                        activeClass="bg-void-800 text-void-100"
                    >
                        <Settings
                            class="size-3.5"
                            stroke-width={1.75}
                        />
                        <span class="flex-1">Settings</span>
                        <span class="opacity-0 transition-opacity group-hover/settings:opacity-100">
                            <KbdHint
                                combo={formatCaps("open_global_settings")}
                            />
                        </span>
                    </A>
                </div>
            }
        >
            <Show when={recentThreads().length > 0}>
                <WorkspaceRailSection label="Recent">
                    <For each={recentThreads()}>
                        {(entry) =>
                            railThreadRow(
                                entry.workspaceId,
                                entry.thread,
                                undefined,
                            )
                        }
                    </For>
                </WorkspaceRailSection>
            </Show>

            <WorkspaceRailSection
                label="All workspaces"
                actions={
                    <HoverReveal>
                        <IconButton
                            aria-label="New workspace"
                            size="xs"
                            onClick={newWorkspace}
                        >
                            <Plus
                                class="size-3.5"
                                stroke-width={2}
                            />
                        </IconButton>
                    </HoverReveal>
                }
            >
                <Show
                    when={sortedWorkspaces().length > 0}
                    fallback={
                        <EmptyState
                            size="sm"
                            title="No workspaces yet"
                            description="Open a folder to start working."
                            actions={
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={newWorkspace}
                                >
                                    New workspace
                                </Button>
                            }
                        />
                    }
                >
                    <For each={sortedWorkspaces()}>
                        {(workspace) => (
                            <WorkspaceRailProject
                                name={workspace.Name || workspace.ID}
                                pathLabel={workspace.Directory}
                                actions={
                                    <>
                                        <IconButton
                                            aria-label={`New thread in ${workspace.Name}`}
                                            size="xs"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                void (async () => {
                                                    try {
                                                        await createThreadInWorkspace(
                                                            queryClient,
                                                            navigate,
                                                            workspace.ID,
                                                        );
                                                    } catch (err) {
                                                        toast.showToast({
                                                            title: "Could not create thread",
                                                            body: errMsg(err),
                                                        });
                                                    }
                                                })();
                                            }}
                                        >
                                            <Plus
                                                class="size-3.5"
                                                stroke-width={2}
                                            />
                                        </IconButton>
                                        <IconButton
                                            aria-label={`Settings for ${workspace.Name}`}
                                            size="xs"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                navigate(
                                                    paths.workspaceSettings(
                                                        workspace.ID,
                                                    ),
                                                );
                                            }}
                                        >
                                            <Settings
                                                class="size-3.5"
                                                stroke-width={1.75}
                                            />
                                        </IconButton>
                                    </>
                                }
                            >
                                <For
                                    each={sortThreadsForWorkspace(
                                        workspace.ID,
                                        threads(),
                                    )}
                                >
                                    {(thread) => {
                                        const slot = slotByThread().get(
                                            thread.ID,
                                        );
                                        const slotShortcut =
                                            slot != null &&
                                            slot < SLOT_ACTION_IDS.length
                                                ? formatCaps(
                                                      SLOT_ACTION_IDS[slot],
                                                  )
                                                : undefined;
                                        return railThreadRow(
                                            workspace.ID,
                                            thread,
                                            slotShortcut,
                                        );
                                    }}
                                </For>
                            </WorkspaceRailProject>
                        )}
                    </For>
                </Show>
            </WorkspaceRailSection>
        </WorkspaceRail>
    );
};
