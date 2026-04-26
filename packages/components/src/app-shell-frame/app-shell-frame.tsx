import {
    Show,
    splitProps,
    type Component,
    type JSX,
    type ParentComponent,
} from "solid-js";
import { ResizeHandle } from "../resize-handle/resize-handle";
import { cn } from "../utils";

export interface AppShellFrameProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /** The persistent left rail. Stays mounted across navigation. */
    leftRail: JSX.Element;
    /** Pinned top strip (e.g. breadcrumb + connection status). */
    titleBar?: JSX.Element;
    /**
     * Right context rail. Pass `undefined` to omit; pass `false` to hide
     * (collapsed) but keep the structural slot.
     */
    rightRail?: JSX.Element | false;
    /** Bottom dock (terminal/test/log tabs). Pass `false` to collapse. */
    bottomDock?: JSX.Element | false;
    /** Center content. Stays mounted across rail/dock toggles. */
    children: JSX.Element;

    /** Width of the left rail in px. Defaults to 240. */
    leftRailWidth?: number;
    onLeftRailWidthChange?: (next: number) => void;
    leftRailMinWidth?: number;
    leftRailMaxWidth?: number;

    /** Width of the right rail in px. Defaults to 320. */
    rightRailWidth?: number;
    onRightRailWidthChange?: (next: number) => void;
    rightRailMinWidth?: number;
    rightRailMaxWidth?: number;

    /** Height of the bottom dock in px. Defaults to 240. */
    bottomDockHeight?: number;
    onBottomDockHeightChange?: (next: number) => void;
    bottomDockMinHeight?: number;
    bottomDockMaxHeight?: number;
}

const DEFAULT_LEFT_WIDTH = 240;
const DEFAULT_RIGHT_WIDTH = 320;
const DEFAULT_DOCK_HEIGHT = 240;

function clamp(n: number, min: number, max: number): number {
    return Math.min(Math.max(n, min), max);
}

/**
 * Three-column desktop shell with optional bottom dock and a pinned title
 * bar. The left rail is permanent — never reflows on navigation. The right
 * rail and bottom dock slots collapse cleanly when their props are `false`.
 *
 * Pure presentational primitive: it knows nothing about routing, projects,
 * or threads. Wire data via the slot props in your app-level layout.
 */
export const AppShellFrame: Component<AppShellFrameProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "leftRail",
        "titleBar",
        "rightRail",
        "bottomDock",
        "children",
        "leftRailWidth",
        "onLeftRailWidthChange",
        "leftRailMinWidth",
        "leftRailMaxWidth",
        "rightRailWidth",
        "onRightRailWidthChange",
        "rightRailMinWidth",
        "rightRailMaxWidth",
        "bottomDockHeight",
        "onBottomDockHeightChange",
        "bottomDockMinHeight",
        "bottomDockMaxHeight",
    ]);

    const leftWidth = () => local.leftRailWidth ?? DEFAULT_LEFT_WIDTH;
    const leftMin = () => local.leftRailMinWidth ?? 200;
    const leftMax = () => local.leftRailMaxWidth ?? 480;

    const rightWidth = () => local.rightRailWidth ?? DEFAULT_RIGHT_WIDTH;
    const rightMin = () => local.rightRailMinWidth ?? 240;
    const rightMax = () => local.rightRailMaxWidth ?? 560;

    const dockHeight = () => local.bottomDockHeight ?? DEFAULT_DOCK_HEIGHT;
    const dockMin = () => local.bottomDockMinHeight ?? 120;
    const dockMax = () => local.bottomDockMaxHeight ?? 600;

    const rightVisible = () =>
        local.rightRail !== false && local.rightRail != null;
    const dockVisible = () =>
        local.bottomDock !== false && local.bottomDock != null;

    return (
        <div
            class={cn(
                "flex h-screen min-h-0 w-full min-w-0 flex-col overflow-hidden bg-void-950 text-void-200",
                local.class,
            )}
            data-slot="app-shell-frame"
            {...rest}
        >
            <Show when={local.titleBar}>
                <div
                    class="shrink-0 border-b border-void-700 bg-void-900"
                    data-slot="app-shell-title-bar"
                >
                    {local.titleBar}
                </div>
            </Show>

            <div
                class="flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden"
                data-slot="app-shell-body"
            >
                <aside
                    class="flex min-h-0 shrink-0 flex-col overflow-hidden border-r border-void-700 bg-void-900"
                    style={{ width: `${leftWidth()}px` }}
                    aria-label="Workspace rail"
                    data-slot="app-shell-left-rail"
                >
                    {local.leftRail}
                </aside>

                <Show when={local.onLeftRailWidthChange}>
                    <ResizeHandle
                        direction="horizontal"
                        onResize={(delta) =>
                            local.onLeftRailWidthChange?.(
                                clamp(
                                    leftWidth() - delta,
                                    leftMin(),
                                    leftMax(),
                                ),
                            )
                        }
                    />
                </Show>

                <div
                    class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
                    data-slot="app-shell-center-column"
                >
                    <main
                        class="flex min-h-0 min-w-0 flex-1 overflow-hidden"
                        data-slot="app-shell-main"
                    >
                        {local.children}
                    </main>

                    <Show when={dockVisible()}>
                        <ResizeHandle
                            direction="vertical"
                            onResize={(delta) =>
                                local.onBottomDockHeightChange?.(
                                    clamp(
                                        dockHeight() + delta,
                                        dockMin(),
                                        dockMax(),
                                    ),
                                )
                            }
                        />
                        <section
                            class="flex shrink-0 flex-col overflow-hidden border-t border-void-700 bg-void-900"
                            style={{ height: `${dockHeight()}px` }}
                            aria-label="Bottom dock"
                            data-slot="app-shell-bottom-dock"
                        >
                            {local.bottomDock}
                        </section>
                    </Show>
                </div>

                <Show when={rightVisible()}>
                    <ResizeHandle
                        direction="horizontal"
                        onResize={(delta) =>
                            local.onRightRailWidthChange?.(
                                clamp(
                                    rightWidth() + delta,
                                    rightMin(),
                                    rightMax(),
                                ),
                            )
                        }
                    />
                    <aside
                        class="flex min-h-0 shrink-0 flex-col overflow-hidden border-l border-void-700 bg-void-900"
                        style={{ width: `${rightWidth()}px` }}
                        aria-label="Context rail"
                        data-slot="app-shell-right-rail"
                    >
                        {local.rightRail}
                    </aside>
                </Show>
            </div>
        </div>
    );
};

export interface AppShellTitleBarProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /** Left cluster — typically a breadcrumb. */
    leading?: JSX.Element;
    /** Right cluster — typically status indicators (branch, agent, stream). */
    trailing?: JSX.Element;
}

/**
 * 32-px high title strip designed for `AppShellFrame.titleBar`. Two clusters
 * (leading / trailing) and nothing else; both are slot-driven.
 */
export const AppShellTitleBar: Component<AppShellTitleBarProps> = (props) => {
    const [local, rest] = splitProps(props, ["class", "leading", "trailing"]);
    return (
        <div
            class={cn(
                "flex h-8 items-center justify-between gap-3 px-3",
                local.class,
            )}
            {...rest}
        >
            <div class="flex min-w-0 flex-1 items-center gap-2">
                {local.leading}
            </div>
            <div class="flex shrink-0 items-center gap-2">{local.trailing}</div>
        </div>
    );
};

/**
 * Pre-styled column for "right rail" content. Header on top (eyebrow + title +
 * actions), scrollable body underneath. Composes inside `AppShellFrame.rightRail`.
 */
export interface ContextRailColumnProps {
    eyebrow?: JSX.Element;
    title?: JSX.Element;
    actions?: JSX.Element;
    /** Body content. Scrolls within the rail. */
    children: JSX.Element;
    class?: string;
}

export const ContextRailColumn: ParentComponent<ContextRailColumnProps> = (
    props,
) => {
    return (
        <div
            class={cn(
                "flex min-h-0 flex-1 flex-col overflow-hidden",
                props.class,
            )}
        >
            <Show when={props.eyebrow || props.title || props.actions}>
                <header class="flex h-9 shrink-0 items-center justify-between gap-2 border-b border-void-700 px-3">
                    <div class="min-w-0">
                        <Show when={props.eyebrow}>
                            <p class="font-mono text-[9px] uppercase tracking-[0.16em] text-void-500">
                                {props.eyebrow}
                            </p>
                        </Show>
                        <Show when={props.title}>
                            <p class="truncate text-[12px] font-medium text-void-100">
                                {props.title}
                            </p>
                        </Show>
                    </div>
                    <Show when={props.actions}>
                        <div class="flex shrink-0 items-center gap-1">
                            {props.actions}
                        </div>
                    </Show>
                </header>
            </Show>
            <div class="min-h-0 flex-1 overflow-y-auto">{props.children}</div>
        </div>
    );
};

/** Compound namespace export. */
export const AppShell = Object.assign(AppShellFrame, {
    Frame: AppShellFrame,
    TitleBar: AppShellTitleBar,
    ContextRail: ContextRailColumn,
});
