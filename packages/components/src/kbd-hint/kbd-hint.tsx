import { For, splitProps, type Component, type JSX } from "solid-js";
import { cn } from "../utils";

export type KbdHintSide = "top" | "right" | "bottom" | "left";
export type KbdHintSize = "xs" | "sm";

export interface KbdHintProps extends JSX.HTMLAttributes<HTMLSpanElement> {
    /**
     * One or more keycaps. Either a string ("⌘+N", "⌘ N") which is split on
     * `+` and whitespace, or an explicit array (`["⌘", "N"]`).
     */
    combo: string | readonly string[];
    /**
     * When set, positions the hint absolutely against a `position: relative`
     * ancestor. Omit to render inline.
     */
    side?: KbdHintSide;
    /**
     * Visual size. `xs` for the tiny revealed-on-hover affordance used in
     * sidebar rows; `sm` for the slightly larger trailing hint inside menus
     * and headers.
     */
    size?: KbdHintSize;
}

const sideStyles: Record<KbdHintSide, string> = {
    top: "absolute bottom-full left-1/2 -translate-x-1/2 mb-1",
    bottom: "absolute top-full left-1/2 -translate-x-1/2 mt-1",
    left: "absolute right-full top-1/2 -translate-y-1/2 mr-1",
    right: "absolute left-full top-1/2 -translate-y-1/2 ml-1",
};

const capSize: Record<KbdHintSize, string> = {
    xs: "h-3.5 min-w-[0.875rem] px-1 text-[9px]",
    sm: "h-4 min-w-[1rem] px-1 text-[10px]",
};

const gapSize: Record<KbdHintSize, string> = {
    xs: "gap-0.5",
    sm: "gap-1",
};

function splitCombo(combo: string | readonly string[]): readonly string[] {
    if (Array.isArray(combo)) return combo;
    return (combo as string)
        .split(/[\s+]+/)
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
}

/**
 * Compact keyboard-shortcut hint, designed to live next to an action (e.g. a
 * sidebar item or icon button). Visibility is intentionally left to the
 * consumer — wrap a `group` ancestor and apply `opacity-0
 * group-hover:opacity-100 transition-opacity` (or a named variant) via the
 * `class` prop to reveal it on hover.
 */
export const KbdHint: Component<KbdHintProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "combo",
        "side",
        "size",
    ]);

    const size = () => local.size ?? "xs";
    const keys = () => splitCombo(local.combo);

    return (
        <span
            class={cn(
                "pointer-events-none inline-flex items-center",
                gapSize[size()],
                local.side && sideStyles[local.side],
                local.class,
            )}
            aria-hidden
            {...rest}
        >
            <For each={[...keys()]}>
                {(k) => (
                    <kbd
                        class={cn(
                            "inline-flex items-center justify-center rounded-none border border-b-2 border-void-700 bg-void-800/80 font-mono leading-none text-void-300",
                            capSize[size()],
                        )}
                    >
                        {k}
                    </kbd>
                )}
            </For>
        </span>
    );
};
