import { A } from "@solidjs/router";
import Bot from "lucide-solid/icons/bot";
import ChevronUp from "lucide-solid/icons/chevron-up";
import Circle from "lucide-solid/icons/circle";
import Layers from "lucide-solid/icons/layers";
import Search from "lucide-solid/icons/search";
import Star from "lucide-solid/icons/star";
import X from "lucide-solid/icons/x";
import type { Component } from "solid-js";
import {
    createEffect,
    createMemo,
    createSignal,
    For,
    on,
    onCleanup,
    onMount,
    Show,
} from "solid-js";
import {
    CategorizedModelList,
    MODEL_LIST_VIEWPORT_CLASS,
    MODEL_PANEL_HEIGHT_CLASS,
} from "@/components/categorized-model-picker";
import {
    CHAT_PROVIDERS,
    type ChatProviderId,
    type ModelChoice,
} from "@/lib/chat-provider";
import {
    buildCursorModelCategories,
    buildOpenRouterSplitCategories,
    FAVORITES_FILTER,
    isPriorityOrg,
    MISC_FILTER,
    orgBadgeClass,
    orgTitle,
    PRIORITY_ORGS,
    providerSlug,
    resolveOpenRouterFlagships,
} from "@/lib/model-picker-categories";

const triggerClass =
    "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40";

/** Opens upward from the trigger (bottom-aligned). */
const menuClass =
    "absolute left-0 bottom-full z-50 mb-0.5 rounded-md border border-slate-800/60 bg-slate-950/95 shadow-lg backdrop-blur-sm";

const menuItemClass =
    "flex w-full cursor-pointer items-center px-2 py-1 text-left text-[11px] text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-200";

/** Left rail org / filter buttons (always pointer). */
const railFilterBtnClass =
    "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors";

function fullDescription(m: ModelChoice): string {
    const full = m.description_full?.trim();
    if (full) return full;
    return m.description?.trim() || "TBA";
}

function formatContextTokens(n: number | undefined): string {
    if (n == null || n <= 0) return "—";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M tokens`;
    if (n >= 10_000) return `${Math.round(n / 1000)}k tokens`;
    return `${n} tokens`;
}

export const ChatProviderBar: Component<{
    provider: ChatProviderId;
    onProviderChange: (id: ChatProviderId) => void;
    model: string;
    onModelChange: (modelId: string) => void;
    modelChoices: readonly ModelChoice[];
    showOpenRouterKeyHint: boolean;
    providerDisabled?: boolean;
    modelDisabled?: boolean;
}> = (props) => {
    const [open, setOpen] = createSignal<"provider" | "model" | null>(null);
    const [searchQuery, setSearchQuery] = createSignal("");
    const [filterOrg, setFilterOrg] = createSignal<string | null>(null);
    const [detailModelId, setDetailModelId] = createSignal<string | null>(null);

    let rootEl!: HTMLDivElement;

    function close() {
        setOpen(null);
        setSearchQuery("");
        setFilterOrg(null);
        setDetailModelId(null);
    }

    onMount(() => {
        const onDoc = (e: MouseEvent) => {
            if (open() === null) return;
            const t = e.target as Node;
            if (rootEl?.contains(t)) return;
            close();
        };
        document.addEventListener("mousedown", onDoc);
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open() !== null) {
                close();
            }
        };
        window.addEventListener("keydown", onKey);
        onCleanup(() => {
            document.removeEventListener("mousedown", onDoc);
            window.removeEventListener("keydown", onKey);
        });
    });

    const isCursorProvider = () => props.provider === "cursor";

    createEffect(
        on(
            () => props.provider,
            (p) => {
                if (p === "cursor") {
                    setFilterOrg(null);
                    setSearchQuery("");
                }
            },
        ),
    );

    const modelOptions = createMemo(() => {
        const cur = props.model.trim();
        const known = [...props.modelChoices];
        if (cur && !known.some((m) => m.id === cur)) {
            const slug = providerSlug(cur);
            return [
                {
                    id: cur,
                    label: cur,
                    provider: slug,
                    description: "TBA",
                    description_full: "TBA",
                } satisfies ModelChoice,
                ...known,
            ];
        }
        return known;
    });

    const hasSearch = createMemo(() => searchQuery().trim().length > 0);

    const filteredModels = createMemo(() => {
        const q = searchQuery().trim().toLowerCase();
        const org = filterOrg();
        let rows = modelOptions();
        if (org === FAVORITES_FILTER) {
            if (isCursorProvider()) {
                return [...rows].sort((a, b) => a.label.localeCompare(b.label));
            }
            return resolveOpenRouterFlagships(rows);
        }
        if (org === MISC_FILTER) {
            rows = rows.filter((m) => {
                const s = m.provider ?? providerSlug(m.id);
                return !isPriorityOrg(s);
            });
        } else if (org) {
            rows = rows.filter(
                (m) => (m.provider ?? providerSlug(m.id)) === org,
            );
        }
        if (q) {
            rows = rows.filter((m) => {
                const desc = (m.description ?? "").toLowerCase();
                const descFull = (m.description_full ?? "").toLowerCase();
                return (
                    m.id.toLowerCase().includes(q) ||
                    m.label.toLowerCase().includes(q) ||
                    desc.includes(q) ||
                    descFull.includes(q) ||
                    (m.provider ?? "").toLowerCase().includes(q)
                );
            });
        }
        return rows;
    });

    const showSplitAllView = createMemo(
        () => !isCursorProvider() && filterOrg() === null && !hasSearch(),
    );

    const modelPickerCategories = createMemo(() => {
        if (isCursorProvider()) {
            if (hasSearch()) {
                const q = searchQuery().trim().toLowerCase();
                const rows = modelOptions().filter((m) => {
                    const desc = (m.description ?? "").toLowerCase();
                    const descFull = (m.description_full ?? "").toLowerCase();
                    return (
                        m.id.toLowerCase().includes(q) ||
                        m.label.toLowerCase().includes(q) ||
                        desc.includes(q) ||
                        descFull.includes(q) ||
                        (m.provider ?? "").toLowerCase().includes(q)
                    );
                });
                return [{ id: "match", label: "", models: rows }];
            }
            return buildCursorModelCategories(modelOptions());
        }
        if (showSplitAllView()) {
            return buildOpenRouterSplitCategories(modelOptions());
        }
        return [{ id: "filtered", label: "", models: filteredModels() }];
    });

    const showSectionHeaders = createMemo(() => {
        if (isCursorProvider()) return !hasSearch();
        return showSplitAllView();
    });

    const modelChipLabel = createMemo(() => {
        const cur = props.model.trim();
        if (!cur) return "Model";
        const row = modelOptions().find((m) => m.id === cur);
        return row?.label ?? cur;
    });

    function toggleModelDetail(m: ModelChoice) {
        setDetailModelId((cur) => (cur === m.id ? null : m.id));
    }

    const detailAside = createMemo(() => {
        const mid = detailModelId();
        if (!mid) return null;
        const row = modelOptions().find((m) => m.id === mid);
        if (!row) return null;
        return (
            <aside
                class="flex h-full w-[min(19rem,42vw)] shrink-0 flex-col overflow-y-auto border-l border-slate-800/60 bg-slate-900/35 p-3"
                aria-label="Model details"
            >
                <div class="flex items-start justify-between gap-2 border-b border-slate-800/50 pb-2">
                    <div class="min-w-0">
                        <p class="text-[13px] font-medium leading-snug text-slate-100">
                            {row.label}
                        </p>
                        <p class="mt-1 break-all font-mono text-[10px] text-slate-500">
                            {row.id}
                        </p>
                    </div>
                    <button
                        type="button"
                        class="shrink-0 cursor-pointer rounded p-0.5 text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-300"
                        aria-label="Close details"
                        onClick={() => setDetailModelId(null)}
                    >
                        <X
                            class="size-4"
                            stroke-width={2}
                            aria-hidden
                        />
                    </button>
                </div>
                <div class="mt-3 space-y-2 text-[11px] text-slate-300">
                    <p class="whitespace-pre-wrap leading-relaxed text-slate-400">
                        {fullDescription(row)}
                    </p>
                    <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 border-t border-slate-800/40 pt-3 text-[10px]">
                        <dt class="text-slate-500">Provider</dt>
                        <dd class="text-slate-300">
                            {orgTitle(row.provider ?? providerSlug(row.id))}
                        </dd>
                        <dt class="text-slate-500">Price</dt>
                        <dd class="text-slate-300">
                            <p class="whitespace-pre-wrap leading-snug">
                                {row.pricing_summary?.trim() ||
                                    row.pricing_tier ||
                                    "—"}
                            </p>
                            <Show
                                when={
                                    !!row.pricing_summary?.trim() &&
                                    !!row.pricing_tier
                                }
                            >
                                <p class="mt-1 font-mono text-[10px] text-emerald-500/80">
                                    Tier {row.pricing_tier}
                                </p>
                            </Show>
                        </dd>
                        <dt class="text-slate-500">Context</dt>
                        <dd>{formatContextTokens(row.context_length)}</dd>
                    </dl>
                    <div class="flex flex-wrap gap-1 pt-1">
                        <Show when={row.vision}>
                            <span class="rounded border border-slate-700/50 bg-slate-950/40 px-1.5 py-0.5 text-[10px] text-slate-400">
                                Vision
                            </span>
                        </Show>
                        <Show when={row.reasoning}>
                            <span class="rounded border border-slate-700/50 bg-slate-950/40 px-1.5 py-0.5 text-[10px] text-slate-400">
                                Reasoning
                            </span>
                        </Show>
                        <Show when={row.long_context}>
                            <span class="rounded border border-slate-700/50 bg-slate-950/40 px-1.5 py-0.5 text-[10px] text-slate-400">
                                Large context
                            </span>
                        </Show>
                    </div>
                </div>
            </aside>
        );
    });

    return (
        <div
            ref={rootEl}
            class="flex min-w-0 flex-1 flex-col gap-1.5"
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
                        {CHAT_PROVIDERS.find((p) => p.id === props.provider)
                            ?.label ?? props.provider}
                        <ChevronUp
                            class="size-3 shrink-0 text-slate-600"
                            stroke-width={2}
                            aria-hidden
                        />
                    </button>
                    <Show when={open() === "provider"}>
                        <ul
                            class={menuClass}
                            role="listbox"
                            aria-label="Provider"
                        >
                            <For each={[...CHAT_PROVIDERS]}>
                                {(p) => (
                                    <li role="presentation">
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={
                                                props.provider === p.id
                                            }
                                            class={`${menuItemClass} ${props.provider === p.id ? "bg-slate-800/40 text-slate-200" : ""}`}
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
                        onClick={() => {
                            setOpen((v) => {
                                if (v === "model") {
                                    setSearchQuery("");
                                    setFilterOrg(null);
                                    setDetailModelId(null);
                                    return null;
                                }
                                setSearchQuery("");
                                setFilterOrg(
                                    isCursorProvider()
                                        ? null
                                        : FAVORITES_FILTER,
                                );
                                return "model";
                            });
                        }}
                    >
                        <Bot
                            class="size-3 shrink-0"
                            stroke-width={2}
                            aria-hidden
                        />
                        <span
                            class="max-w-44 truncate"
                            title={
                                props.model.trim()
                                    ? props.model.trim()
                                    : undefined
                            }
                        >
                            {modelChipLabel()}
                        </span>
                        <ChevronUp
                            class="size-3 shrink-0 text-slate-600"
                            stroke-width={2}
                            aria-hidden
                        />
                    </button>
                    <Show when={open() === "model"}>
                        <div
                            class={`${menuClass} flex ${MODEL_PANEL_HEIGHT_CLASS} max-w-[calc(100vw-0.75rem)] flex-row overflow-hidden p-0`}
                            role="presentation"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <div
                                class={`flex h-full min-w-0 shrink-0 flex-row overflow-hidden ${isCursorProvider() ? "w-full max-w-[min(36rem,calc(100vw-2rem))]" : "w-[min(28rem,calc(100vw-2rem))]"}`}
                            >
                                <Show when={!isCursorProvider()}>
                                    <aside
                                        class="flex h-full w-11 shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-slate-800/60 bg-slate-950/60 py-1.5 pl-1 pr-0.5"
                                        aria-label="Filter by organization"
                                    >
                                        <button
                                            type="button"
                                            title="All models"
                                            class={`${railFilterBtnClass} ${filterOrg() === null ? "bg-violet-600/30 text-violet-200" : "text-slate-500 hover:bg-slate-800/60 hover:text-slate-300"}`}
                                            onClick={() => setFilterOrg(null)}
                                        >
                                            <Circle
                                                class="size-3.5"
                                                stroke-width={2}
                                                aria-hidden
                                            />
                                        </button>
                                        <button
                                            type="button"
                                            title="Favorites (coming soon)"
                                            class={`${railFilterBtnClass} ${filterOrg() === FAVORITES_FILTER ? "bg-amber-500/25 text-amber-100 ring-1 ring-amber-500/40" : "text-slate-500 hover:bg-slate-800/60 hover:text-slate-300"}`}
                                            onClick={() =>
                                                setFilterOrg((cur) =>
                                                    cur === FAVORITES_FILTER
                                                        ? null
                                                        : FAVORITES_FILTER,
                                                )
                                            }
                                        >
                                            <Star
                                                class="size-3.5"
                                                stroke-width={2}
                                                aria-hidden
                                            />
                                        </button>
                                        <For each={[...PRIORITY_ORGS]}>
                                            {(slug) => (
                                                <button
                                                    type="button"
                                                    title={orgTitle(slug)}
                                                    class={`${railFilterBtnClass} text-[10px] font-semibold ${filterOrg() === slug ? "ring-1 ring-violet-500/50" : ""} ${orgBadgeClass(slug)}`}
                                                    onClick={() =>
                                                        setFilterOrg((cur) =>
                                                            cur === slug
                                                                ? null
                                                                : slug,
                                                        )
                                                    }
                                                >
                                                    {(
                                                        slug[0] ?? "?"
                                                    ).toUpperCase()}
                                                </button>
                                            )}
                                        </For>
                                        <button
                                            type="button"
                                            title="Misc — all other providers"
                                            class={`${railFilterBtnClass} ${filterOrg() === MISC_FILTER ? "bg-violet-600/30 text-violet-200 ring-1 ring-violet-500/50" : "text-slate-500 hover:bg-slate-800/60 hover:text-slate-300"}`}
                                            onClick={() =>
                                                setFilterOrg((cur) =>
                                                    cur === MISC_FILTER
                                                        ? null
                                                        : MISC_FILTER,
                                                )
                                            }
                                        >
                                            <Layers
                                                class="size-3.5"
                                                stroke-width={2}
                                                aria-hidden
                                            />
                                        </button>
                                    </aside>
                                </Show>
                                <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                                    <div class="flex shrink-0 items-center gap-1.5 border-b border-slate-800/60 px-2 py-1.5">
                                        <Search
                                            class="size-3.5 shrink-0 text-slate-600"
                                            stroke-width={2}
                                            aria-hidden
                                        />
                                        <input
                                            type="search"
                                            placeholder="Search models…"
                                            class="min-w-0 flex-1 bg-transparent text-[11px] text-slate-200 outline-none placeholder:text-slate-600"
                                            value={searchQuery()}
                                            onInput={(e) =>
                                                setSearchQuery(
                                                    e.currentTarget.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div
                                        class={`${MODEL_LIST_VIEWPORT_CLASS} min-h-0 shrink-0 overflow-y-auto overscroll-contain`}
                                        role="listbox"
                                        aria-label="Model"
                                    >
                                        <CategorizedModelList
                                            categories={modelPickerCategories()}
                                            selectedId={props.model}
                                            onPick={(id) => {
                                                props.onModelChange(id);
                                                close();
                                            }}
                                            onInfo={toggleModelDetail}
                                            showSectionHeaders={showSectionHeaders()}
                                        />
                                    </div>
                                </div>
                            </div>
                            {detailAside()}
                        </div>
                    </Show>
                </div>
            </div>
            <Show when={props.showOpenRouterKeyHint}>
                <p class="text-[11px] text-amber-500/90">
                    Add an OpenRouter API key in{" "}
                    <A
                        href="/settings/providers"
                        class="underline-offset-2 hover:text-amber-400 hover:underline"
                    >
                        Settings → Providers
                    </A>{" "}
                    to use this provider.
                </p>
            </Show>
        </div>
    );
};
