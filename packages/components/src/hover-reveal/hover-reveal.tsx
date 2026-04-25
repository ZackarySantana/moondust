import { splitProps, type Component, type JSX } from "solid-js";
import { cn } from "../utils";

export type HoverRevealMode = "hover" | "focus" | "hover-focus";
export type HoverRevealTransition = "opacity" | "fade-up" | "none";

export interface HoverRevealProps extends JSX.HTMLAttributes<HTMLSpanElement> {
    /**
     * Which interaction reveals the content. Defaults to `hover-focus`, which
     * also reveals on keyboard focus inside the parent `group`. The parent
     * must use the `group` (or scoped `group/<name>`) class for these
     * variants to take effect.
     */
    mode?: HoverRevealMode;
    /** Transition style. Defaults to `opacity`. */
    transition?: HoverRevealTransition;
    /**
     * Render as `inline-flex` instead of `flex`. Default true — most usages
     * place the wrapper next to inline content (text, badges).
     */
    inline?: boolean;
}

const modeStyles: Record<HoverRevealMode, string> = {
    hover: "opacity-0 group-hover:opacity-100",
    focus: "opacity-0 group-focus-within:opacity-100",
    "hover-focus":
        "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
};

const transitionStyles: Record<HoverRevealTransition, string> = {
    opacity: "transition-opacity duration-150",
    "fade-up":
        "translate-y-0.5 transition-[opacity,transform] duration-150 group-hover:translate-y-0 group-focus-within:translate-y-0",
    none: "",
};

/**
 * Wrapper that hides its children until the parent `group` is hovered or
 * focused. Use to declutter dense lists with secondary actions (e.g. a
 * trash icon next to a row, or a kbd hint next to a menu item).
 *
 * The parent must use the `group` class. To scope to a named group, use
 * `class` to override the variants — the defaults assume a single anonymous
 * `group`.
 */
export const HoverReveal: Component<HoverRevealProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "mode",
        "transition",
        "inline",
    ]);

    const inline = () => local.inline ?? true;
    const mode = () => local.mode ?? "hover-focus";
    const transition = () => local.transition ?? "opacity";

    return (
        <span
            class={cn(
                inline() ? "inline-flex items-center" : "flex items-center",
                modeStyles[mode()],
                transitionStyles[transition()],
                local.class,
            )}
            {...rest}
        />
    );
};
