import { Show, splitProps, type Component, type JSX } from "solid-js";
import { cn } from "../utils";

export type PaneHeaderSize = "sm" | "default";

export interface PaneHeaderProps
    extends Omit<JSX.HTMLAttributes<HTMLElement>, "title"> {
    /**
     * Optional small eyebrow above the title (e.g. "Thread", "Project",
     * "Settings"). Rendered uppercase mono.
     */
    eyebrow?: JSX.Element;
    /** Primary title. */
    title?: JSX.Element;
    /**
     * Secondary line under the title (e.g. "in moondust · 24 messages") or to
     * the right when there is no title.
     */
    subtitle?: JSX.Element;
    /** Optional leading slot — usually an icon, status dot, or back button. */
    leading?: JSX.Element;
    /**
     * Trailing actions (icon buttons, badges, primary button). Aligned to the
     * right.
     */
    actions?: JSX.Element;
    /** Visual size. `sm` for inner panels, `default` for top-level pane headers. */
    size?: PaneHeaderSize;
    /**
     * If true, the header sticks to the top of its scrollable parent. The
     * background uses a slight blur so content scrolls underneath cleanly.
     */
    sticky?: boolean;
    /**
     * Render a thin separator under the header. Default true.
     */
    bordered?: boolean;
}

const sizeStyles: Record<
    PaneHeaderSize,
    { container: string; title: string; subtitle: string; eyebrow: string; gap: string }
> = {
    sm: {
        container: "h-9 px-3",
        title: "text-[13px]",
        subtitle: "text-[11px]",
        eyebrow: "text-[9px]",
        gap: "gap-2",
    },
    default: {
        container: "h-11 px-4",
        title: "text-sm",
        subtitle: "text-xs",
        eyebrow: "text-[10px]",
        gap: "gap-3",
    },
};

/**
 * Sticky-capable header for any scrollable pane. The Stellar pattern is a
 * single horizontal bar: optional eyebrow + title on the left, action cluster
 * on the right. For more elaborate headers (multi-line, large hero) compose
 * directly with raw layout.
 */
export const PaneHeader: Component<PaneHeaderProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "eyebrow",
        "title",
        "subtitle",
        "leading",
        "actions",
        "size",
        "sticky",
        "bordered",
    ]);

    const size = () => local.size ?? "default";
    const sz = () => sizeStyles[size()];
    const bordered = () => local.bordered ?? true;

    return (
        <header
            class={cn(
                "flex shrink-0 items-center justify-between bg-void-950/80 backdrop-blur",
                sz().container,
                sz().gap,
                bordered() && "border-b border-void-700",
                local.sticky && "sticky top-0 z-10",
                local.class,
            )}
            {...rest}
        >
            <div class={cn("flex min-w-0 items-center", sz().gap)}>
                <Show when={local.leading}>
                    <span class="flex shrink-0 items-center">
                        {local.leading}
                    </span>
                </Show>
                <div class="min-w-0">
                    <Show when={local.eyebrow}>
                        <p
                            class={cn(
                                "font-mono uppercase tracking-[0.16em] text-void-500",
                                sz().eyebrow,
                            )}
                        >
                            {local.eyebrow}
                        </p>
                    </Show>
                    <Show when={local.title}>
                        <p
                            class={cn(
                                "truncate font-medium tracking-tight text-void-50",
                                sz().title,
                            )}
                        >
                            {local.title}
                        </p>
                    </Show>
                    <Show when={local.subtitle && !local.title}>
                        <p
                            class={cn(
                                "truncate text-void-400",
                                sz().subtitle,
                            )}
                        >
                            {local.subtitle}
                        </p>
                    </Show>
                </div>
                <Show when={local.subtitle && local.title}>
                    <span
                        class={cn("truncate text-void-500", sz().subtitle)}
                    >
                        {local.subtitle}
                    </span>
                </Show>
            </div>
            <Show when={local.actions}>
                <div class="flex shrink-0 items-center gap-1">
                    {local.actions}
                </div>
            </Show>
        </header>
    );
};
