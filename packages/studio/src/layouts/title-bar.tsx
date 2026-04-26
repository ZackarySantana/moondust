import { A, useLocation, useParams } from "@solidjs/router";
import {
    AppShellTitleBar,
    Breadcrumb,
    Chip,
    IconButton,
    StatusDot,
    type BreadcrumbSegment,
} from "@moondust/components";
import GitBranch from "lucide-solid/icons/git-branch";
import PanelRight from "lucide-solid/icons/panel-right";
import PanelBottom from "lucide-solid/icons/panel-bottom";
import { createMemo, Show, type Component } from "solid-js";
import { THREAD_VIEW_ORDER, useShortcuts } from "@/lib/shortcuts";
import { useUIState } from "@/lib/ui-state";
import { paths, useProjectQuery, useThreadQuery } from "@/lib/workspace";

const VIEW_LABELS: Record<(typeof THREAD_VIEW_ORDER)[number], string> = {
    chat: "Chat",
    diff: "Diff",
    files: "Files",
    browser: "Browser",
    terminal: "Terminal",
    tests: "Tests",
    review: "Review",
    pr: "PR",
    git: "Git",
};

/**
 * 32px pinned title strip. Renders a breadcrumb on the left
 * (Workspace ▸ Thread ▸ View) and status chips on the right (branch +
 * agent + stream state + rail toggles). Receives no data props — pulls
 * everything from route params and the UI/shortcut/workspace contexts.
 */
export const StudioTitleBar: Component = () => {
    const params = useParams<{ projectId?: string; threadId?: string }>();
    const location = useLocation();
    const ui = useUIState();
    const { formatCaps } = useShortcuts();

    const projectQuery = useProjectQuery(() => params.projectId);
    const threadQuery = useThreadQuery(() => params.threadId);

    const segments = createMemo<BreadcrumbSegment[]>(() => {
        const segs: BreadcrumbSegment[] = [];
        const pid = params.projectId;
        const tid = params.threadId;

        if (pid) {
            segs.push({
                id: "workspace",
                label: projectQuery.data?.Name ?? pid,
                href: paths.workspace(pid),
            });
        } else if (location.pathname.startsWith("/settings")) {
            segs.push({
                id: "settings",
                label: "Settings",
                href: paths.globalSettings(),
            });
        } else {
            segs.push({
                id: "hub",
                label: "Hub",
                href: paths.hub(),
            });
        }

        if (pid && tid) {
            segs.push({
                id: "thread",
                label: threadQuery.data?.Title || "Thread",
                href: paths.thread(pid, tid),
            });
            segs.push({
                id: "view",
                label: VIEW_LABELS[ui.activeView()],
            });
        }
        return segs;
    });

    const branchLabel = () => {
        if (params.threadId) {
            return (
                threadQuery.data?.WorktreeDir?.split("/")
                    .pop()
                    ?.replace(/^moon-/, "moon/") ?? ""
            );
        }
        return projectQuery.data?.Branch ?? "";
    };

    return (
        <AppShellTitleBar
            leading={
                <Breadcrumb
                    segments={segments()}
                    renderSegment={(p) => {
                        const seg = p.segment;
                        if (seg.href) {
                            return (
                                <A
                                    href={seg.href}
                                    class={p.class}
                                >
                                    {p.children}
                                </A>
                            );
                        }
                        if (seg.onClick) {
                            return (
                                <button
                                    type="button"
                                    class={p.class}
                                    onClick={seg.onClick}
                                >
                                    {p.children}
                                </button>
                            );
                        }
                        return <span class={p.class}>{p.children}</span>;
                    }}
                />
            }
            trailing={
                <>
                    <Show when={branchLabel()}>
                        <Chip
                            tone="outline"
                            size="sm"
                            icon={GitBranch}
                            class="font-mono"
                        >
                            {branchLabel()}
                        </Chip>
                    </Show>
                    <Show when={params.threadId}>
                        <Chip
                            tone="starlight"
                            size="sm"
                        >
                            Cursor Agent
                        </Chip>
                        <span class="inline-flex items-center gap-1.5 text-[11px] text-void-400">
                            <StatusDot
                                tone="muted"
                                size="xs"
                                label="Idle"
                            />
                            Idle
                        </span>
                    </Show>
                    <IconButton
                        aria-label="Toggle context rail"
                        size="xs"
                        tooltip="Toggle context rail"
                        tooltipShortcut={formatCaps("toggle_context_rail")}
                        onClick={ui.toggleContextRail}
                    >
                        <PanelRight
                            class="size-3.5"
                            stroke-width={1.75}
                        />
                    </IconButton>
                    <IconButton
                        aria-label="Toggle bottom dock"
                        size="xs"
                        tooltip="Toggle bottom dock"
                        tooltipShortcut={formatCaps("toggle_bottom_dock")}
                        onClick={ui.toggleBottomDock}
                    >
                        <PanelBottom
                            class="size-3.5"
                            stroke-width={1.75}
                        />
                    </IconButton>
                </>
            }
        />
    );
};
