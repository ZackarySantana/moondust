import {
    children as resolveChildren,
    createSignal,
    createUniqueId,
    For,
    onCleanup,
    Show,
    type Component,
    type JSX,
} from "solid-js";
import { cn } from "../utils";

export type TooltipSide = "top" | "right" | "bottom" | "left";

export interface TooltipProps {
    /** Body of the tooltip. Strings are styled automatically; JSX renders as-is. */
    content: JSX.Element;
    /**
     * Optional keyboard shortcut rendered inside the tooltip.
     * Each entry is one keycap (e.g. ["⌘", "S"]).
     */
    shortcut?: readonly string[];
    /** Side of the trigger to render the tooltip on. Defaults to "top". */
    side?: TooltipSide;
    /** Delay before showing on hover, in ms. Defaults to 400. */
    openDelay?: number;
    /** Delay before hiding on leave, in ms. Defaults to 80. */
    closeDelay?: number;
    /** Disable the tooltip and render the trigger directly. */
    disabled?: boolean;
    /** Override the rendered tooltip width via Tailwind classes. */
    panelClass?: string;
    /** The element that triggers the tooltip. Must be a focusable element. */
    children: JSX.Element;
}

const sideStyles: Record<TooltipSide, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
};

/**
 * A single keycap rendered inside the tooltip. Mirrors `<Kbd>` styling but
 * inlined to avoid a circular import.
 */
const TooltipKey: Component<{ children: JSX.Element }> = (p) => (
    <span class="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-none border border-b-2 border-void-600 bg-void-800 px-1 font-mono text-[10px] leading-none text-void-200">
        {p.children}
    </span>
);

/**
 * Hover- and focus-activated tooltip. CSS-positioned (no floating-ui), so
 * triggers near a viewport edge may need an explicit `side` override.
 *
 * The trigger element receives `aria-describedby` so screen readers announce
 * the tooltip body. The shortcut, if provided, is also part of the description.
 */
export const Tooltip: Component<TooltipProps> = (props) => {
    const [open, setOpen] = createSignal(false);
    const id = createUniqueId();
    let openTimer: ReturnType<typeof setTimeout> | undefined;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;

    const cancelTimers = () => {
        if (openTimer !== undefined) {
            clearTimeout(openTimer);
            openTimer = undefined;
        }
        if (closeTimer !== undefined) {
            clearTimeout(closeTimer);
            closeTimer = undefined;
        }
    };

    onCleanup(cancelTimers);

    const show = (immediate: boolean) => {
        cancelTimers();
        if (immediate) {
            setOpen(true);
            return;
        }
        openTimer = setTimeout(() => {
            setOpen(true);
        }, props.openDelay ?? 400);
    };

    const hide = (immediate: boolean) => {
        cancelTimers();
        if (immediate) {
            setOpen(false);
            return;
        }
        closeTimer = setTimeout(() => {
            setOpen(false);
        }, props.closeDelay ?? 80);
    };

    const resolvedChildren = resolveChildren(() => props.children);

    if (props.disabled) {
        return <>{resolvedChildren()}</>;
    }

    return (
        <span
            class="relative inline-flex"
            onMouseEnter={() => show(false)}
            onMouseLeave={() => hide(false)}
            onFocusIn={() => show(true)}
            onFocusOut={() => hide(true)}
            onKeyDown={(e) => {
                if (e.key === "Escape" && open()) {
                    e.stopPropagation();
                    hide(true);
                }
            }}
        >
            <span aria-describedby={open() ? id : undefined}>
                {resolvedChildren()}
            </span>
            <Show when={open()}>
                <span
                    id={id}
                    role="tooltip"
                    class={cn(
                        "pointer-events-none absolute z-50 inline-flex max-w-xs items-center gap-2 whitespace-nowrap rounded-none border border-void-700 bg-void-900 px-2 py-1 text-[11px] leading-tight text-void-100 shadow-xl shadow-black/40",
                        sideStyles[props.side ?? "top"],
                        props.panelClass,
                    )}
                >
                    <span class="text-void-100">{props.content}</span>
                    <Show when={props.shortcut && props.shortcut.length > 0}>
                        <span class="flex shrink-0 items-center gap-0.5 border-l border-void-700 pl-2">
                            <For each={[...(props.shortcut ?? [])]}>
                                {(k) => <TooltipKey>{k}</TooltipKey>}
                            </For>
                        </span>
                    </Show>
                </span>
            </Show>
        </span>
    );
};
