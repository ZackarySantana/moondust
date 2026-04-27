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
import FolderPlus from "lucide-solid/icons/folder-plus";
import {
    createMemo,
    createSignal,
    For,
    Show,
    onCleanup,
    type Component,
} from "solid-js";
import { type ShortcutActionId, useShortcuts } from "@/lib/shortcuts";
import { useUIState } from "@/lib/ui-state";
import {
    paths,
    railThreadOrder,
    railThreadSlotIndex,
    sortProjectsByLatestThread,
    sortThreadsForProject,
    useProjectsQuery,
    useThreadsQuery,
} from "@/lib/workspace";
import { relativeTime } from "@/lib/time";

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
 * (from `@moondust/components`) to live project + thread data and pipes
 * keyboard actions (⌘N, ⌘⇧N, ⌘⇧, etc.) through the shortcut bus.
 */
export const StudioWorkspaceRail: Component = () => {
    const projectsQuery = useProjectsQuery();
    const threadsQuery = useThreadsQuery();
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams<{ projectId?: string; threadId?: string }>();
    const { formatCaps, onAction } = useShortcuts();
    const { openCommandPalette, openNewWorkspaceDialog } = useUIState();

    const [tick, setTick] = createSignal(0);
    const timer = setInterval(() => setTick((n) => n + 1), TICK_INTERVAL_MS);
    onCleanup(() => clearInterval(timer));

    const projects = () => projectsQuery.data ?? [];
    const threads = () => threadsQuery.data ?? [];

    const sortedProjects = createMemo(() =>
        sortProjectsByLatestThread(projects(), threads()),
    );
    const slotByThread = createMemo(() =>
        railThreadSlotIndex(projects(), threads()),
    );
    const recentThreads = createMemo(() =>
        railThreadOrder(projects(), threads()).slice(0, 5),
    );

    const focusedProjectId = createMemo(() => {
        const m = location.pathname.match(/^\/w\/([^/]+)/);
        return m?.[1] ?? null;
    });

    function newThread() {
        const pid = focusedProjectId();
        void pid;
        // TODO: wire to a real "New thread" modal flow. For now, surface
        // discoverability via the command palette.
        openCommandPalette();
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
                    <Show when={projectsQuery.isPending}>
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
                    <Button
                        variant="ghost"
                        size="sm"
                        class="!h-7 !px-2 justify-start gap-2 text-[12.5px]"
                        onClick={newWorkspace}
                    >
                        <FolderPlus
                            class="size-3.5"
                            stroke-width={1.75}
                        />
                        <span class="flex-1 text-left">New workspace</span>
                        <KbdHint combo={formatCaps("new_workspace")} />
                    </Button>
                </div>
            }
        >
            <Show when={recentThreads().length > 0}>
                <WorkspaceRailSection label="Recent">
                    <For each={recentThreads()}>
                        {(entry) => (
                            <WorkspaceRailThread
                                href={paths.thread(
                                    entry.projectId,
                                    entry.thread.ID,
                                )}
                                title={entry.thread.Title || "Untitled thread"}
                                timeLabel={
                                    (tick(),
                                    relativeTime(
                                        entry.thread.UpdatedAt ||
                                            entry.thread.CreatedAt,
                                    ))
                                }
                                phase={phaseFor(entry.thread.ID)}
                                active={params.threadId === entry.thread.ID}
                                renderLink={(p) => (
                                    <A
                                        href={p.href}
                                        class={p.class}
                                        activeClass="bg-void-800 text-void-50"
                                    >
                                        {p.children}
                                    </A>
                                )}
                            />
                        )}
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
                    when={sortedProjects().length > 0}
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
                    <For each={sortedProjects()}>
                        {(project) => (
                            <WorkspaceRailProject
                                name={project.Name || project.ID}
                                pathLabel={project.Directory}
                                actions={
                                    <>
                                        <IconButton
                                            aria-label={`New thread in ${project.Name}`}
                                            size="xs"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                navigate(
                                                    paths.workspace(project.ID),
                                                );
                                                newThread();
                                            }}
                                        >
                                            <Plus
                                                class="size-3.5"
                                                stroke-width={2}
                                            />
                                        </IconButton>
                                        <IconButton
                                            aria-label={`Settings for ${project.Name}`}
                                            size="xs"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                navigate(
                                                    paths.workspaceSettings(
                                                        project.ID,
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
                                    each={sortThreadsForProject(
                                        project.ID,
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
                                        return (
                                            <WorkspaceRailThread
                                                href={paths.thread(
                                                    project.ID,
                                                    thread.ID,
                                                )}
                                                title={
                                                    thread.Title ||
                                                    "Untitled thread"
                                                }
                                                timeLabel={
                                                    (tick(),
                                                    relativeTime(
                                                        thread.UpdatedAt ||
                                                            thread.CreatedAt,
                                                    ))
                                                }
                                                phase={phaseFor(thread.ID)}
                                                shortcut={slotShortcut}
                                                active={
                                                    params.threadId ===
                                                    thread.ID
                                                }
                                                renderLink={(p) => (
                                                    <A
                                                        href={p.href}
                                                        class={p.class}
                                                        activeClass="bg-void-800 text-void-50"
                                                    >
                                                        {p.children}
                                                    </A>
                                                )}
                                            />
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
