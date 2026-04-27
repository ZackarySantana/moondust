import { For, Show, splitProps, type Component, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { KbdHint } from "../kbd-hint/kbd-hint";
import { cn } from "../utils";

export type ViewSwitcherIcon = Component<
    JSX.SvgSVGAttributes<SVGSVGElement> & { "stroke-width"?: number }
>;

export interface ViewSwitcherItem {
    id: string;
    label: string;
    icon?: ViewSwitcherIcon;
    /** Optional keyboard shortcut combo (e.g. ["⌘", "1"]) shown on hover. */
    shortcut?: readonly string[];
    /** Disable the item; renders muted and uninteractive. */
    disabled?: boolean;
}

export interface ViewSwitcherProps extends Omit<
    JSX.HTMLAttributes<HTMLDivElement>,
    "onChange"
> {
    items: readonly ViewSwitcherItem[];
    activeId: string;
    onChange: (id: string) => void;
    /** Visual variant. `chip` is the default; `tab` is a wider underline tab. */
    variant?: "chip" | "tab";
    /** Accessible name for the group. Required by ARIA. */
    "aria-label": string;
}

const baseItemClass =
    "group/view inline-flex shrink-0 cursor-pointer select-none items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-starlight-400/60 disabled:pointer-events-none disabled:opacity-40";

const chipItemClass = (active: boolean) =>
    cn(
        "h-7 px-2 text-[12px] border",
        active
            ? "bg-void-800 text-void-50 border-void-600"
            : "bg-transparent text-void-400 border-transparent hover:bg-void-800/60 hover:text-void-100",
    );

const tabItemClass = (active: boolean) =>
    cn(
        "h-9 px-3 text-[12px] border-b-2 -mb-px",
        active
            ? "border-starlight-400 text-void-50"
            : "border-transparent text-void-400 hover:text-void-100 hover:border-void-700",
    );

/**
 * Compact, keyboard-discoverable view switcher. Chip variant is meant for
 * the thread main pane (one row of `Chat / Diff / Files / Browser / …`),
 * tab variant is for nested sections.
 *
 * Each item can advertise a shortcut via `KbdHint` revealed on hover.
 */
export const ViewSwitcher: Component<ViewSwitcherProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "items",
        "activeId",
        "onChange",
        "variant",
        "aria-label",
    ]);

    const variant = () => local.variant ?? "chip";

    return (
        <div
            class={cn(
                "flex min-w-0 items-center",
                variant() === "chip"
                    ? "gap-0.5"
                    : "gap-1 border-b border-void-700",
                local.class,
            )}
            role="tablist"
            aria-label={local["aria-label"]}
            {...rest}
        >
            <For each={local.items}>
                {(item) => {
                    const active = () => local.activeId === item.id;
                    const itemClass = () =>
                        cn(
                            baseItemClass,
                            variant() === "chip"
                                ? chipItemClass(active())
                                : tabItemClass(active()),
                        );
                    return (
                        <button
                            type="button"
                            role="tab"
                            aria-selected={active()}
                            aria-label={item.label}
                            tabIndex={active() ? 0 : -1}
                            disabled={item.disabled}
                            class={itemClass()}
                            onClick={() => local.onChange(item.id)}
                        >
                            <Show when={item.icon}>
                                {(IconCmp) => {
                                    const Cmp = IconCmp();
                                    return (
                                        <Dynamic
                                            component={Cmp}
                                            class={cn(
                                                "size-3.5 shrink-0",
                                                active()
                                                    ? "text-starlight-300"
                                                    : "text-void-500 group-hover/view:text-void-300",
                                            )}
                                            stroke-width={1.75}
                                            aria-hidden
                                        />
                                    );
                                }}
                            </Show>
                            <span class="truncate">{item.label}</span>
                            <Show
                                when={item.shortcut && item.shortcut.length > 0}
                            >
                                <KbdHint
                                    combo={item.shortcut as readonly string[]}
                                    class={cn(
                                        "shrink-0 transition-opacity duration-100",
                                        active()
                                            ? "opacity-60"
                                            : "opacity-0 group-hover/view:opacity-100",
                                    )}
                                />
                            </Show>
                        </button>
                    );
                }}
            </For>
        </div>
    );
};
