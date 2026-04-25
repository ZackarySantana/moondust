import Bot from "lucide-solid/icons/bot";
import ChevronUp from "lucide-solid/icons/chevron-up";
import Search from "lucide-solid/icons/search";
import type { Component, JSX } from "solid-js";
import {
    createMemo,
    createSignal,
    For,
    onCleanup,
    onMount,
    Show,
} from "solid-js";
import { cn } from "../utils";

export interface ProviderOption {
    id: string;
    label: string;
}

export interface ModelOption {
    id: string;
    label: string;
    description?: string;
}

export interface ChatProviderBarProps {
    provider: string;
    onProviderChange: (id: string) => void;
    providers: readonly ProviderOption[];

    model: string;
    onModelChange: (modelId: string) => void;
    models: readonly ModelOption[];

    providerDisabled?: boolean;
    modelDisabled?: boolean;

    /** Optional warning shown below the bar (e.g. missing API key). */
    warning?: JSX.Element;

    class?: string;
}

const triggerClass =
    "inline-flex cursor-pointer items-center gap-1.5 rounded-none px-2 py-1 text-[11px] text-void-400 transition-colors duration-100 hover:bg-void-800/60 hover:text-void-100 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40";

const menuClass =
    "absolute left-0 bottom-full z-50 mb-0.5 rounded-none border border-void-700 bg-void-900 shadow-2xl shadow-black/50";

const menuItemClass =
    "flex w-full cursor-pointer items-center px-2 py-1 text-left text-[11px] text-void-300 transition-colors duration-100 hover:bg-void-800 hover:text-void-50";

type OpenMenu = "provider" | "model" | null;

export const ChatProviderBar: Component<ChatProviderBarProps> = (props) => {
    const [open, setOpen] = createSignal<OpenMenu>(null);
    const [search, setSearch] = createSignal("");
    let rootEl: HTMLDivElement | undefined;

    function close() {
        setOpen(null);
        setSearch("");
    }

    onMount(() => {
        const onDoc = (e: MouseEvent) => {
            if (!open()) return;
            const t = e.target as Node;
            if (rootEl?.contains(t)) return;
            close();
        };
        document.addEventListener("mousedown", onDoc);
        onCleanup(() => document.removeEventListener("mousedown", onDoc));
    });

    const providerLabel = createMemo(
        () =>
            props.providers.find((p) => p.id === props.provider)?.label ??
            props.provider,
    );

    const modelLabel = createMemo(() => {
        const cur = props.model.trim();
        if (!cur) return "Model";
        return props.models.find((m) => m.id === cur)?.label ?? cur;
    });

    const filteredModels = createMemo(() => {
        const q = search().trim().toLowerCase();
        if (!q) return [...props.models];
        return props.models.filter((m) => {
            const desc = (m.description ?? "").toLowerCase();
            return (
                m.id.toLowerCase().includes(q) ||
                m.label.toLowerCase().includes(q) ||
                desc.includes(q)
            );
        });
    });

    return (
        <div
            ref={(el) => {
                rootEl = el;
            }}
            class={cn("flex min-w-0 flex-1 flex-col gap-1.5", props.class)}
        >
            <div class="flex flex-wrap items-center gap-1">
                <div class="relative shrink-0">
                    <button
                        type="button"
                        class={triggerClass}
                        disabled={props.providerDisabled}
                        aria-expanded={open() === "provider"}
                        aria-haspopup="listbox"
                        onClick={() =>
                            setOpen((v) =>
                                v === "provider" ? null : "provider",
                            )
                        }
                    >
                        <span class="font-mono">{providerLabel()}</span>
                        <ChevronUp
                            class="size-3 shrink-0 text-void-500"
                            stroke-width={2}
                            aria-hidden
                        />
                    </button>
                    <Show when={open() === "provider"}>
                        <ul
                            class={cn(menuClass, "min-w-32")}
                            role="listbox"
                            aria-label="Provider"
                        >
                            <For each={[...props.providers]}>
                                {(p) => (
                                    <li role="presentation">
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={
                                                props.provider === p.id
                                            }
                                            class={cn(
                                                menuItemClass,
                                                props.provider === p.id &&
                                                    "bg-void-800 text-starlight-300",
                                            )}
                                            onClick={() => {
                                                props.onProviderChange(p.id);
                                                close();
                                            }}
                                        >
                                            {p.label}
                                        </button>
                                    </li>
                                )}
                            </For>
                        </ul>
                    </Show>
                </div>

                <div class="relative shrink-0">
                    <button
                        type="button"
                        class={triggerClass}
                        disabled={props.modelDisabled}
                        aria-expanded={open() === "model"}
                        aria-haspopup="listbox"
                        onClick={() =>
                            setOpen((v) => {
                                if (v === "model") {
                                    setSearch("");
                                    return null;
                                }
                                setSearch("");
                                return "model";
                            })
                        }
                    >
                        <Bot
                            class="size-3 shrink-0"
                            stroke-width={2}
                            aria-hidden
                        />
                        <span
                            class="max-w-44 truncate font-mono"
                            title={
                                props.model.trim()
                                    ? props.model.trim()
                                    : undefined
                            }
                        >
                            {modelLabel()}
                        </span>
                        <ChevronUp
                            class="size-3 shrink-0 text-void-500"
                            stroke-width={2}
                            aria-hidden
                        />
                    </button>
                    <Show when={open() === "model"}>
                        <div
                            class={cn(
                                menuClass,
                                "flex h-[24rem] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden p-0",
                            )}
                            role="presentation"
                        >
                            <div class="flex shrink-0 items-center gap-1.5 border-b border-void-700 px-2 py-1.5">
                                <Search
                                    class="size-3.5 shrink-0 text-void-500"
                                    stroke-width={2}
                                    aria-hidden
                                />
                                <input
                                    type="search"
                                    placeholder="Search models…"
                                    class="min-w-0 flex-1 bg-transparent text-[11px] text-void-100 outline-none placeholder:text-void-500"
                                    value={search()}
                                    onInput={(e) =>
                                        setSearch(e.currentTarget.value)
                                    }
                                />
                            </div>
                            <ul
                                class="min-h-0 flex-1 overflow-y-auto"
                                role="listbox"
                                aria-label="Model"
                            >
                                <Show
                                    when={filteredModels().length > 0}
                                    fallback={
                                        <li class="px-3 py-6 text-center text-[11px] text-void-500">
                                            No models match your search.
                                        </li>
                                    }
                                >
                                    <For each={filteredModels()}>
                                        {(m) => (
                                            <li role="presentation">
                                                <button
                                                    type="button"
                                                    role="option"
                                                    aria-selected={
                                                        props.model === m.id
                                                    }
                                                    class={cn(
                                                        "flex w-full cursor-pointer flex-col gap-0.5 border-t border-void-800 px-2.5 py-2 text-left transition-colors duration-100 first:border-t-0 hover:bg-void-800",
                                                        props.model === m.id &&
                                                            "border-l-2 border-l-starlight-400 bg-void-800",
                                                    )}
                                                    onClick={() => {
                                                        props.onModelChange(
                                                            m.id,
                                                        );
                                                        close();
                                                    }}
                                                >
                                                    <span
                                                        class={cn(
                                                            "truncate font-mono text-[12px] font-medium text-void-50",
                                                            props.model ===
                                                                m.id &&
                                                                "text-starlight-200",
                                                        )}
                                                    >
                                                        {m.label}
                                                    </span>
                                                    {m.description && (
                                                        <span class="truncate text-[10px] text-void-400">
                                                            {m.description}
                                                        </span>
                                                    )}
                                                </button>
                                            </li>
                                        )}
                                    </For>
                                </Show>
                            </ul>
                        </div>
                    </Show>
                </div>
            </div>
            <Show when={props.warning}>
                <div class="text-[11px] text-flare-300">{props.warning}</div>
            </Show>
        </div>
    );
};
