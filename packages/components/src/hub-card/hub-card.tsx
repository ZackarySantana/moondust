import {
    For,
    Show,
    splitProps,
    type Component,
    type JSX,
    type ParentComponent,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { StatusDot, type StatusDotTone } from "../status-dot/status-dot";
import { cn } from "../utils";

export interface HubCardMetaItem {
    /** Unique key for the meta entry. */
    id: string;
    /** Optional leading icon. */
    icon?: Component<{ class?: string; "stroke-width"?: number }>;
    /** Display label (e.g. "main", "3 dirty files"). */
    label: JSX.Element;
    /** Optional accent tone. */
    tone?: "neutral" | "starlight" | "nebula" | "flare";
}

export interface HubCardProps extends Omit<
    JSX.HTMLAttributes<HTMLDivElement>,
    "title"
> {
    /** Eyebrow label (uppercase, mono). E.g. "Workspace", "Recent thread". */
    eyebrow?: JSX.Element;
    /** Card title. Required. */
    title: JSX.Element;
    /**
     * Subtitle / preview body. Truncated to ~3 lines via `line-clamp-3` so
     * cards stay uniform in dashboards.
     */
    preview?: JSX.Element;
    /** Trailing meta items (rendered as a comma-spaced row at the foot). */
    meta?: readonly HubCardMetaItem[];
    /** Optional status dot rendered in the top-right. */
    status?: { tone: StatusDotTone; label?: string; pulse?: boolean };
    /** Trailing actions slot (rendered next to status). */
    actions?: JSX.Element;
    /** Whether the card is interactive (hover affordance + cursor). */
    interactive?: boolean;
    /** Click handler. Implicitly enables `interactive`. */
    onClick?: (e: MouseEvent) => void;
}

const toneToText: Record<NonNullable<HubCardMetaItem["tone"]>, string> = {
    neutral: "text-void-400",
    starlight: "text-starlight-300",
    nebula: "text-nebula-300",
    flare: "text-flare-300",
};

/**
 * Dashboard card for the Hub home page. Eyebrow + title + preview with a
 * meta row at the foot. Composes inside a CSS grid; pair with
 * `HubCardGrid` for the auto-fit layout used on the home page.
 */
export const HubCard: Component<HubCardProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "eyebrow",
        "title",
        "preview",
        "meta",
        "status",
        "actions",
        "interactive",
        "onClick",
    ]);

    const interactive = () => Boolean(local.interactive ?? local.onClick);

    return (
        <div
            role={interactive() ? "button" : undefined}
            tabIndex={interactive() ? 0 : undefined}
            onClick={local.onClick}
            onKeyDown={(e) => {
                if (!interactive()) return;
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    local.onClick?.(new MouseEvent("click"));
                }
            }}
            class={cn(
                "group/card relative flex h-full min-h-[140px] flex-col gap-2 border border-void-700 bg-void-900 p-3.5 text-void-200 transition-colors",
                interactive() &&
                    "cursor-pointer hover:border-void-600 hover:bg-void-850 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-starlight-400/60",
                local.class,
            )}
            {...rest}
        >
            <header class="flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1">
                    <Show when={local.eyebrow}>
                        <p class="font-mono text-[9px] uppercase tracking-[0.18em] text-void-500">
                            {local.eyebrow}
                        </p>
                    </Show>
                    <p class="mt-0.5 truncate text-[14px] font-medium text-void-50">
                        {local.title}
                    </p>
                </div>
                <div class="flex shrink-0 items-center gap-1.5">
                    <Show when={local.status}>
                        {(s) => (
                            <StatusDot
                                tone={s().tone}
                                pulse={s().pulse}
                                label={s().label}
                                size="sm"
                            />
                        )}
                    </Show>
                    <Show when={local.actions}>{local.actions}</Show>
                </div>
            </header>

            <Show when={local.preview}>
                <p class="line-clamp-3 min-h-0 flex-1 text-[12px] leading-relaxed text-void-400">
                    {local.preview}
                </p>
            </Show>

            <Show when={local.meta && local.meta.length > 0}>
                <footer class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-void-500">
                    <For each={local.meta}>
                        {(item) => (
                            <span
                                class={cn(
                                    "inline-flex items-center gap-1 truncate",
                                    toneToText[item.tone ?? "neutral"],
                                )}
                            >
                                <Show when={item.icon}>
                                    {(IconCmp) => {
                                        const Cmp = IconCmp();
                                        return (
                                            <Dynamic
                                                component={Cmp}
                                                class="size-3 shrink-0"
                                                stroke-width={1.75}
                                                aria-hidden
                                            />
                                        );
                                    }}
                                </Show>
                                <span class="truncate">{item.label}</span>
                            </span>
                        )}
                    </For>
                </footer>
            </Show>
        </div>
    );
};

export interface HubCardGridProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /** Min card width in px. Defaults to 240. */
    minCardWidth?: number;
}

/**
 * Auto-fit responsive grid for `HubCard`. Pass cards as children.
 */
export const HubCardGrid: ParentComponent<HubCardGridProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "minCardWidth",
        "children",
    ]);
    const min = () => local.minCardWidth ?? 240;
    return (
        <div
            class={cn("grid gap-3", local.class)}
            style={{
                "grid-template-columns": `repeat(auto-fill, minmax(${min()}px, 1fr))`,
            }}
            {...rest}
        >
            {local.children}
        </div>
    );
};
