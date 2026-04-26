import ChevronRight from "lucide-solid/icons/chevron-right";
import {
    Show,
    splitProps,
    type Component,
    type JSX,
    type ParentComponent,
} from "solid-js";
import { HoverReveal } from "../hover-reveal/hover-reveal";
import { KbdHint } from "../kbd-hint/kbd-hint";
import { StatusDot, type StatusDotTone } from "../status-dot/status-dot";
import { cn } from "../utils";

export type ThreadStreamPhase =
    | "idle"
    | "thinking"
    | "responding"
    | "done"
    | "error";

const phaseToDotTone: Record<ThreadStreamPhase, StatusDotTone> = {
    idle: "muted",
    thinking: "nebula",
    responding: "starlight",
    done: "starlight",
    error: "flare",
};

const phaseToLabel: Record<ThreadStreamPhase, string> = {
    idle: "Idle",
    thinking: "Thinking",
    responding: "Streaming reply",
    done: "Reply ready",
    error: "Error",
};

export interface WorkspaceRailProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /** Header slot — usually the brand row + command launcher. */
    header?: JSX.Element;
    /** Footer slot — usually status / settings link / build label. */
    footer?: JSX.Element;
}

/**
 * Persistent left rail for the desktop shell. Owns header, scrollable body
 * (passed as `children`), and footer. Intentionally agnostic of routing,
 * data, or selection — pair with `WorkspaceRailSection`,
 * `WorkspaceRailProject`, and `WorkspaceRailThread` to compose a list.
 */
export const WorkspaceRail: ParentComponent<WorkspaceRailProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "header",
        "footer",
        "children",
    ]);
    return (
        <div
            class={cn(
                "flex h-full min-h-0 flex-col text-void-200",
                local.class,
            )}
            {...rest}
        >
            <Show when={local.header}>
                <div class="shrink-0">{local.header}</div>
            </Show>
            <div class="min-h-0 flex-1 overflow-y-auto">{local.children}</div>
            <Show when={local.footer}>
                <div class="shrink-0 border-t border-void-700">
                    {local.footer}
                </div>
            </Show>
        </div>
    );
};

export interface WorkspaceRailSectionProps extends JSX.HTMLAttributes<HTMLElement> {
    /** Section eyebrow label (uppercase, mono). */
    label?: string;
    /** Optional trailing slot in the section header (e.g. a "+" button). */
    actions?: JSX.Element;
}

/**
 * Section heading + body inside the rail. Use one per logical group (Recent,
 * All workspaces, Pinned, etc.).
 */
export const WorkspaceRailSection: ParentComponent<
    WorkspaceRailSectionProps
> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "label",
        "actions",
        "children",
    ]);
    return (
        <section
            class={cn("group/section py-2", local.class)}
            {...rest}
        >
            <Show when={local.label || local.actions}>
                <header class="flex items-center justify-between px-3 pb-1">
                    <Show when={local.label}>
                        <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                            {local.label}
                        </span>
                    </Show>
                    <Show when={local.actions}>
                        <span class="flex shrink-0 items-center">
                            {local.actions}
                        </span>
                    </Show>
                </header>
            </Show>
            <div class="flex flex-col gap-px px-1.5">{local.children}</div>
        </section>
    );
};

export interface WorkspaceRailProjectProps extends Omit<
    JSX.HTMLAttributes<HTMLDetailsElement>,
    "title"
> {
    /** Display name of the project. */
    name: string;
    /** Path or other contextual subtitle (rendered as `title` attr). */
    pathLabel?: string;
    /** Whether the disclosure starts open. Defaults to `true`. */
    defaultOpen?: boolean;
    /** Trailing actions (revealed on hover). E.g. new-thread + settings. */
    actions?: JSX.Element;
    /** Threads (rendered as children). */
    children: JSX.Element;
}

/**
 * Disclosure row representing a project. Body is a left-bordered list of
 * `WorkspaceRailThread` children. Actions are revealed on hover.
 */
export const WorkspaceRailProject: Component<WorkspaceRailProjectProps> = (
    props,
) => {
    const [local, rest] = splitProps(props, [
        "class",
        "name",
        "pathLabel",
        "defaultOpen",
        "actions",
        "children",
    ]);
    const open = () => local.defaultOpen ?? true;
    return (
        <details
            class={cn("group/project", local.class)}
            open={open()}
            {...rest}
        >
            <summary class="group/row flex h-7 cursor-pointer list-none items-center gap-1.5 px-2 text-[13px] font-medium text-void-200 transition-colors hover:bg-void-800/60 [&::-webkit-details-marker]:hidden">
                <ChevronRight
                    class="size-3 shrink-0 text-void-500 transition-transform duration-150 group-open/project:rotate-90"
                    stroke-width={2.5}
                    aria-hidden
                />
                <span
                    class="min-w-0 flex-1 truncate"
                    title={local.pathLabel}
                >
                    {local.name}
                </span>
                <Show when={local.actions}>
                    <HoverReveal class="flex items-center gap-0.5">
                        {local.actions}
                    </HoverReveal>
                </Show>
            </summary>
            <div class="ml-2.5 border-l border-void-700/60 pb-1 pl-1.5">
                {local.children}
            </div>
        </details>
    );
};

export interface WorkspaceRailThreadProps extends Omit<
    JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
    "title"
> {
    /** Display title for the thread. */
    title: string;
    /** Relative-time label. */
    timeLabel?: string;
    /** Stream / activity phase — drives the leading status dot. */
    phase?: ThreadStreamPhase;
    /** When true, render the active (selected) treatment. */
    active?: boolean;
    /**
     * Optional shortcut hint (e.g. ["⌘", "⌥", "1"]). Revealed on hover so
     * dense rails stay readable.
     */
    shortcut?: readonly string[];
    /** Anchor href. Use your router's `<A>` via `renderLink` if needed. */
    href: string;
    /** Render the anchor with a custom component (e.g. router `<A>`). */
    renderLink?: (linkProps: {
        href: string;
        class: string;
        children: JSX.Element;
        onDblClick?: (e: MouseEvent) => void;
        onClick?: (e: MouseEvent) => void;
    }) => JSX.Element;
    /** Double-click handler — typically for inline rename. */
    onDblClick?: (e: MouseEvent) => void;
}

/**
 * Single thread row inside a `WorkspaceRailProject`. Lightweight by design:
 * status dot, title, optional time, and a hover-revealed shortcut hint.
 */
export const WorkspaceRailThread: Component<WorkspaceRailThreadProps> = (
    props,
) => {
    const [local, rest] = splitProps(props, [
        "class",
        "title",
        "timeLabel",
        "phase",
        "active",
        "shortcut",
        "href",
        "renderLink",
        "onDblClick",
        "onClick",
    ]);
    const phase = (): ThreadStreamPhase => local.phase ?? "idle";
    const showDot = () => phase() !== "idle";

    const linkClass = cn(
        "group/thread flex items-center gap-1.5 px-2 h-7 text-[12.5px] no-underline transition-colors",
        local.active
            ? "bg-void-800 text-void-50"
            : "text-void-400 hover:bg-void-800/60 hover:text-void-100",
        local.class,
    );

    const inner = (
        <>
            <span class="flex w-3 shrink-0 items-center justify-center">
                <Show
                    when={showDot()}
                    fallback={null}
                >
                    <StatusDot
                        size="xs"
                        tone={phaseToDotTone[phase()]}
                        pulse={
                            phase() === "thinking" || phase() === "responding"
                        }
                        label={phaseToLabel[phase()]}
                    />
                </Show>
            </span>
            <span class="min-w-0 flex-1 truncate">{local.title}</span>
            <Show when={local.shortcut && local.shortcut.length > 0}>
                <HoverReveal class="shrink-0">
                    <KbdHint combo={local.shortcut as readonly string[]} />
                </HoverReveal>
            </Show>
            <Show when={local.timeLabel}>
                <span class="shrink-0 font-mono text-[10px] tabular-nums text-void-500 group-hover/thread:text-void-400">
                    {local.timeLabel}
                </span>
            </Show>
        </>
    );

    if (local.renderLink) {
        return local.renderLink({
            href: local.href,
            class: linkClass,
            children: inner,
            onDblClick: local.onDblClick,
            onClick:
                typeof local.onClick === "function"
                    ? (local.onClick as (e: MouseEvent) => void)
                    : undefined,
        });
    }

    return (
        <a
            href={local.href}
            class={linkClass}
            onDblClick={local.onDblClick}
            {...rest}
        >
            {inner}
        </a>
    );
};

/** Compound namespace export for fluent composition. */
export const Rail = Object.assign(WorkspaceRail, {
    Section: WorkspaceRailSection,
    Project: WorkspaceRailProject,
    Thread: WorkspaceRailThread,
});
