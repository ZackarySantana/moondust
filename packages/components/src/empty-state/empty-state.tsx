import { Show, splitProps, type Component, type JSX } from "solid-js";
import { cn } from "../utils";

export type EmptyStateSize = "sm" | "default" | "lg";

export interface EmptyStateProps
    extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "title"> {
    /**
     * Optional leading icon component (e.g. a Lucide icon). Sized
     * automatically by `size`.
     */
    icon?: Component<{ class?: string; "stroke-width"?: number }>;
    /** Headline. Required for screen readers. */
    title: JSX.Element;
    /** Optional supporting copy under the title. */
    description?: JSX.Element;
    /** Trailing actions — usually one or two buttons or links. */
    actions?: JSX.Element;
    size?: EmptyStateSize;
    /**
     * When true, renders a dashed bordered surface around the content. Useful
     * inside lists and panels to visually mark the slot as "empty".
     */
    bordered?: boolean;
}

const sizeStyles: Record<
    EmptyStateSize,
    { container: string; iconBox: string; icon: string; title: string; desc: string }
> = {
    sm: {
        container: "py-6 gap-2",
        iconBox: "size-9 mb-1",
        icon: "size-4",
        title: "text-[13px]",
        desc: "text-[12px]",
    },
    default: {
        container: "py-10 gap-3",
        iconBox: "size-12 mb-2",
        icon: "size-5",
        title: "text-sm",
        desc: "text-[13px]",
    },
    lg: {
        container: "py-16 gap-4",
        iconBox: "size-14 mb-3",
        icon: "size-6",
        title: "text-base",
        desc: "text-sm",
    },
};

/**
 * "Nothing to show here" surface for empty lists, missing search results, or
 * fresh-install screens. Compose with `Button` or `Link` actions to give the
 * user a clear next step.
 */
export const EmptyState: Component<EmptyStateProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "icon",
        "title",
        "description",
        "actions",
        "size",
        "bordered",
    ]);

    const size = () => local.size ?? "default";
    const sz = () => sizeStyles[size()];

    return (
        <div
            class={cn(
                "flex flex-col items-center justify-center px-6 text-center",
                sz().container,
                local.bordered && "rounded-none border border-dashed border-void-700",
                local.class,
            )}
            role="status"
            {...rest}
        >
            <Show when={local.icon}>
                {(IconCmp) => {
                    const Cmp = IconCmp();
                    return (
                        <span
                            class={cn(
                                "flex shrink-0 items-center justify-center border border-void-700 bg-void-900 text-void-400",
                                sz().iconBox,
                            )}
                            aria-hidden
                        >
                            <Cmp
                                class={sz().icon}
                                stroke-width={1.5}
                            />
                        </span>
                    );
                }}
            </Show>
            <p
                class={cn(
                    "font-medium tracking-tight text-void-100",
                    sz().title,
                )}
            >
                {local.title}
            </p>
            <Show when={local.description}>
                <p
                    class={cn(
                        "max-w-md text-void-400 leading-relaxed",
                        sz().desc,
                    )}
                >
                    {local.description}
                </p>
            </Show>
            <Show when={local.actions}>
                <div class="mt-2 flex flex-wrap items-center justify-center gap-2">
                    {local.actions}
                </div>
            </Show>
        </div>
    );
};
