import {
    For,
    Show,
    createEffect,
    createMemo,
    createSignal,
    onCleanup,
    splitProps,
    type Component,
    type JSX,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { Dialog, DialogContent, DialogOverlay } from "../dialog/dialog";
import { Text } from "../text/text";
import { cn } from "../utils";

export interface CommandPaletteItem {
    id: string;
    label: string;
    description?: string;
    /**
     * Extra substrings the default filter checks (e.g. command names, slugs)
     * in addition to `label` and `description`.
     */
    keywords?: string[];
    icon?: Component<JSX.SvgSVGAttributes<SVGSVGElement>>;
}

const defaultId = (prefix: string, id: string) =>
    `${prefix}-${id.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

/** Capped height when &gt;5 results so a scrollbar appears only for the 6th+ item. */
const LIST_MAX_SCROLL_CLASS = "h-60 min-h-60 max-h-60 w-full min-w-0 shrink-0";

/**
 * Substring match on label, description, and keywords. Case-insensitive;
 * empty query returns all items in original order.
 */
export function defaultCommandPaletteFilter(
    query: string,
    items: readonly CommandPaletteItem[],
): CommandPaletteItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return [...items];
    return items.filter((item) => {
        const parts = [item.label, item.description, ...(item.keywords ?? [])]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
        return parts.includes(q);
    });
}

export interface CommandPaletteProps extends Omit<
    JSX.HTMLAttributes<HTMLDivElement>,
    "onSelect" | "title"
> {
    open: boolean;
    onClose: () => void;
    query: string;
    onQueryChange: (query: string) => void;
    items: readonly CommandPaletteItem[];
    onSelect: (item: CommandPaletteItem) => void;
    filter?: (
        query: string,
        items: readonly CommandPaletteItem[],
    ) => CommandPaletteItem[];
    /** Input placeholder. */
    placeholder?: string;
    /** Optional heading above the field. */
    title?: string;
    /** Shown when `items` is empty. */
    emptyLabel?: string;
    /** Shown when the filter returns no rows. */
    noMatchLabel?: string;
    /** `id` prefix for the input and listbox; keeps multiple palettes unique in tests. */
    idPrefix?: string;
}

/**
 * Command-palette / “spotlight” surface: type-ahead list with keyboard
 * navigation (arrows, Enter, Escape). Pairs with `CommandLauncher` or any
 * trigger that sets `open` and owns `query` state.
 */
export const CommandPalette: Component<CommandPaletteProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "open",
        "onClose",
        "query",
        "onQueryChange",
        "items",
        "onSelect",
        "filter",
        "placeholder",
        "title",
        "emptyLabel",
        "noMatchLabel",
        "idPrefix",
        "class",
    ]);

    const inputId = () =>
        local.idPrefix ? `${local.idPrefix}-input` : "command-palette-input";
    const listboxId = () =>
        local.idPrefix
            ? `${local.idPrefix}-listbox`
            : "command-palette-listbox";

    const filterFn = () => local.filter ?? defaultCommandPaletteFilter;

    const filtered = createMemo(() => filterFn()(local.query, local.items));

    /** Scrollbar only when a sixth (or more) row would be needed. */
    const listNeedsMaxScroll = createMemo(() => filtered().length > 5);

    const [activeIndex, setActiveIndex] = createSignal(0);
    let inputRef: HTMLInputElement | undefined;

    createEffect(() => {
        filtered();
        setActiveIndex(0);
    });

    createEffect(() => {
        if (!local.open) return;
        const t = setTimeout(() => {
            inputRef?.focus();
            inputRef?.select();
        }, 0);
        onCleanup(() => clearTimeout(t));
    });

    function selectByIndex(i: number) {
        const list = filtered();
        if (i < 0 || i >= list.length) return;
        const item = list[i]!;
        local.onSelect(item);
        local.onClose();
    }

    function onInputKeyDown(e: KeyboardEvent) {
        const n = filtered().length;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (n === 0) return;
            setActiveIndex((i) => (i + 1 >= n ? 0 : i + 1));
            return;
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (n === 0) return;
            setActiveIndex((i) => (i - 1 < 0 ? n - 1 : i - 1));
            return;
        }
        if (e.key === "Enter") {
            e.preventDefault();
            if (n > 0) selectByIndex(activeIndex());
        }
    }

    const activeDescendant = () => {
        const list = filtered();
        const i = activeIndex();
        if (i < 0 || i >= list.length) return undefined;
        return defaultId("cmd-opt", list[i]!.id);
    };

    return (
        <Dialog
            open={local.open}
            onEscapeKeyDown={local.onClose}
        >
            <DialogOverlay
                type="button"
                aria-label="Close command palette"
                onClick={local.onClose}
            />
            <DialogContent
                class={cn(
                    "mx-auto flex w-full max-w-lg flex-col self-center border-void-600 bg-void-900 p-0 shadow-2xl shadow-void-950/80",
                    local.class,
                )}
                role="dialog"
                aria-modal="true"
                aria-label={local.title ?? "Command palette"}
                {...rest}
            >
                <div class="w-full min-w-0 shrink-0 border-b border-void-700/80 px-3 py-2.5">
                    <Show when={local.title}>
                        <Text
                            variant="eyebrow"
                            class="mb-2"
                        >
                            {local.title}
                        </Text>
                    </Show>
                    <input
                        ref={(el) => {
                            inputRef = el;
                        }}
                        id={inputId()}
                        type="search"
                        class="h-9 w-full border border-void-600 bg-void-950 px-2.5 text-[13px] text-void-100 placeholder:text-void-500 focus-visible:border-starlight-400/70 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-starlight-400/40"
                        placeholder={local.placeholder ?? "Search…"}
                        value={local.query}
                        onInput={(e) =>
                            local.onQueryChange(e.currentTarget.value)
                        }
                        onKeyDown={onInputKeyDown}
                        autocomplete="off"
                        autocorrect="off"
                        spellcheck={false}
                        role="combobox"
                        aria-autocomplete="list"
                        aria-controls={listboxId()}
                        aria-expanded={local.open}
                        aria-activedescendant={activeDescendant()}
                    />
                </div>

                <div
                    class={cn(
                        "w-full min-w-0 shrink-0 bg-void-900/20",
                        listNeedsMaxScroll() ? LIST_MAX_SCROLL_CLASS : "",
                    )}
                >
                    <div
                        class={cn(
                            "w-full min-h-0",
                            listNeedsMaxScroll()
                                ? "h-full overflow-y-auto overflow-x-hidden"
                                : "overflow-x-hidden overflow-y-visible",
                        )}
                        id={listboxId()}
                        role="listbox"
                        aria-label="Commands"
                    >
                        <Show
                            when={local.items.length > 0}
                            fallback={
                                <p
                                    class={cn(
                                        "flex items-center justify-center px-3 py-8 text-center text-[12px] text-void-500",
                                        listNeedsMaxScroll()
                                            ? "h-full"
                                            : "min-h-32",
                                    )}
                                >
                                    {local.emptyLabel ??
                                        "No commands available."}
                                </p>
                            }
                        >
                            <Show
                                when={filtered().length > 0}
                                fallback={
                                    <p
                                        class={cn(
                                            "flex items-center justify-center px-3 py-8 text-center text-[12px] text-void-500",
                                            listNeedsMaxScroll()
                                                ? "h-full"
                                                : "min-h-32",
                                        )}
                                    >
                                        {local.noMatchLabel ?? "No matches."}
                                    </p>
                                }
                            >
                                <ul class="py-1">
                                    <For each={filtered()}>
                                        {(item, i) => (
                                            <li role="none">
                                                <button
                                                    type="button"
                                                    id={defaultId(
                                                        "cmd-opt",
                                                        item.id,
                                                    )}
                                                    class={cn(
                                                        "flex w-full min-h-10 cursor-default items-start gap-2.5 border-0 bg-transparent px-3 py-1.5 text-left text-[13px] leading-snug transition-colors",
                                                        i() === activeIndex()
                                                            ? "bg-void-800 text-void-50"
                                                            : "text-void-200 hover:bg-void-800/50",
                                                    )}
                                                    role="option"
                                                    tabIndex={-1}
                                                    aria-selected={
                                                        i() === activeIndex()
                                                    }
                                                    onMouseEnter={() =>
                                                        setActiveIndex(i())
                                                    }
                                                    onClick={() =>
                                                        selectByIndex(i())
                                                    }
                                                >
                                                    <Show when={item.icon}>
                                                        {(IconCmp) => {
                                                            const Cmp =
                                                                IconCmp();
                                                            return (
                                                                <span class="mt-0.5 shrink-0 text-void-400">
                                                                    <Dynamic
                                                                        component={
                                                                            Cmp
                                                                        }
                                                                        class="size-4"
                                                                        stroke-width={
                                                                            1.75
                                                                        }
                                                                        aria-hidden
                                                                    />
                                                                </span>
                                                            );
                                                        }}
                                                    </Show>
                                                    <span class="min-w-0 flex-1">
                                                        <span class="block truncate font-medium">
                                                            {item.label}
                                                        </span>
                                                        <Show
                                                            when={
                                                                item.description
                                                            }
                                                        >
                                                            <span class="mt-0.5 block line-clamp-1 text-[11px] text-void-500">
                                                                {
                                                                    item.description
                                                                }
                                                            </span>
                                                        </Show>
                                                    </span>
                                                </button>
                                            </li>
                                        )}
                                    </For>
                                </ul>
                            </Show>
                        </Show>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
