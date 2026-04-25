import {
    Show,
    splitProps,
    type Component,
    type JSX,
} from "solid-js";
import { Spinner } from "../spinner/spinner";
import { Tooltip, type TooltipSide } from "../tooltip/tooltip";
import { cn } from "../utils";

export type IconButtonVariant = "ghost" | "solid" | "outline" | "danger";
export type IconButtonSize = "xs" | "sm" | "default" | "lg";

export interface IconButtonProps
    extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
    /** Required for accessibility — buttons with only an icon must have a label. */
    "aria-label": string;
    variant?: IconButtonVariant;
    size?: IconButtonSize;
    /** Show a spinner in place of the icon. Disables the button. */
    loading?: boolean;
    /** When set, wraps the trigger in a `Tooltip` with this label. */
    tooltip?: string;
    /** Optional shortcut to render inside the tooltip (one keycap per entry). */
    tooltipShortcut?: readonly string[];
    /** Tooltip side. Defaults to "top". */
    tooltipSide?: TooltipSide;
    /** Button type. Defaults to "button" so it never submits forms by accident. */
    type?: "button" | "submit" | "reset";
    /** Icon element. Sized automatically by `size`. */
    children: JSX.Element;
}

const variantStyles: Record<IconButtonVariant, string> = {
    ghost: "bg-transparent text-void-400 hover:bg-void-800 hover:text-void-100 active:bg-void-700 focus-visible:outline-void-500",
    solid: "bg-void-800 text-void-100 border border-void-700 hover:bg-void-700 hover:border-void-600 focus-visible:outline-void-500",
    outline:
        "border border-void-600 bg-transparent text-void-300 hover:bg-void-800 hover:border-void-500 hover:text-void-100 focus-visible:outline-void-500",
    danger: "bg-transparent text-void-400 hover:bg-flare-500/15 hover:text-flare-200 focus-visible:outline-flare-400/70",
};

const sizeStyles: Record<IconButtonSize, string> = {
    xs: "size-5 [&_svg]:size-3 [&_svg]:stroke-[2.25]",
    sm: "size-6 [&_svg]:size-3.5 [&_svg]:stroke-2",
    default: "size-7 [&_svg]:size-4 [&_svg]:stroke-2",
    lg: "size-9 [&_svg]:size-5 [&_svg]:stroke-2",
};

const spinnerSizeFor: Record<IconButtonSize, "xs" | "sm" | "default" | "lg"> = {
    xs: "xs",
    sm: "sm",
    default: "sm",
    lg: "default",
};

/**
 * Compact icon-only button with required `aria-label`. Optional `tooltip`
 * renders a `Tooltip` wrapper that mirrors the label and surfaces a keyboard
 * shortcut. Use `loading` to swap the icon for a spinner without the consumer
 * needing to manage state classes.
 */
export const IconButton: Component<IconButtonProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "variant",
        "size",
        "loading",
        "tooltip",
        "tooltipShortcut",
        "tooltipSide",
        "type",
        "children",
        "disabled",
    ]);

    const variant = () => local.variant ?? "ghost";
    const size = () => local.size ?? "default";

    const button = (
        <button
            type={local.type ?? "button"}
            class={cn(
                "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-none transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40",
                variantStyles[variant()],
                sizeStyles[size()],
                local.class,
            )}
            disabled={local.disabled || local.loading}
            aria-busy={local.loading || undefined}
            {...rest}
        >
            <Show when={local.loading} fallback={local.children}>
                <Spinner size={spinnerSizeFor[size()]} />
            </Show>
        </button>
    );

    if (!local.tooltip) {
        return button;
    }

    return (
        <Tooltip
            content={local.tooltip}
            shortcut={local.tooltipShortcut}
            side={local.tooltipSide}
        >
            {button}
        </Tooltip>
    );
};
