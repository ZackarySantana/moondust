import { A } from "@solidjs/router";
import Bot from "lucide-solid/icons/bot";
import Brain from "lucide-solid/icons/brain";
import ChevronUp from "lucide-solid/icons/chevron-up";
import Circle from "lucide-solid/icons/circle";
import Eye from "lucide-solid/icons/eye";
import FileText from "lucide-solid/icons/file-text";
import Info from "lucide-solid/icons/info";
import Layers from "lucide-solid/icons/layers";
import Search from "lucide-solid/icons/search";
import Star from "lucide-solid/icons/star";
import X from "lucide-solid/icons/x";
import type { Component } from "solid-js";
import {
    createMemo,
    createSignal,
    For,
    onCleanup,
    onMount,
    Show,
} from "solid-js";
import {
    CHAT_PROVIDERS,
    type ChatProviderId,
    type ModelChoice,
} from "@/lib/chat-provider";

const triggerClass =
    "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40";

/** Opens upward from the trigger (bottom-aligned). */
const menuClass =
    "absolute left-0 bottom-full z-50 mb-0.5 rounded-md border border-slate-800/60 bg-slate-950/95 shadow-lg backdrop-blur-sm";

/** Row min height so ~5 rows fill the list viewport. */
const MODEL_ROW_MIN_CLASS = "min-h-[3.75rem]";
/** Scroll viewport: five model rows (5×3.75rem) plus a little room for section labels. */
const MODEL_LIST_VIEWPORT_CLASS = "h-[22rem]";
/** Fixed panel: list viewport + search + “Choose model…” (no layout shift). */
const MODEL_PANEL_HEIGHT_CLASS = "h-[28rem]";

const menuItemClass =
    "flex w-full cursor-pointer items-center px-2 py-1 text-left text-[11px] text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-200";

/** Left rail org / filter buttons (always pointer). */
const railFilterBtnClass =
    "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors";

const ORG_BADGE: Record<string, string> = {
    openai: "bg-emerald-900/55 text-emerald-100",
    anthropic: "bg-amber-900/45 text-amber-100",
    google: "bg-sky-900/45 text-sky-100",
    "meta-llama": "bg-indigo-900/45 text-indigo-100",
    "x-ai": "bg-slate-700/80 text-slate-100",
    deepseek: "bg-violet-900/45 text-violet-100",
    qwen: "bg-cyan-900/40 text-cyan-100",
    mistralai: "bg-orange-900/40 text-orange-100",
    nvidia: "bg-lime-900/35 text-lime-100",
    "z-ai": "bg-fuchsia-900/40 text-fuchsia-100",
    bytedance: "bg-rose-900/35 text-rose-100",
    cohere: "bg-blue-900/40 text-blue-100",
    perplexity: "bg-purple-900/40 text-purple-100",
};

const ORG_TITLE: Record<string, string> = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    google: "Google",
    "meta-llama": "Meta",
    "x-ai": "xAI",
    deepseek: "DeepSeek",
    qwen: "Qwen",
    mistralai: "Mistral",
    nvidia: "NVIDIA",
    "z-ai": "Z.AI",
    bytedance: "ByteDance",
    cohere: "Cohere",
    perplexity: "Perplexity",
};

function providerSlug(id: string): string {
    const i = id.indexOf("/");
    return i > 0 ? id.slice(0, i) : "other";
}

function orgBadgeClass(slug: string): string {
    if (slug.startsWith("meta-")) {
        return ORG_BADGE["meta-llama"] ?? "bg-slate-800/80 text-slate-200";
    }
    return ORG_BADGE[slug] ?? "bg-slate-800/80 text-slate-200";
}

function orgTitle(slug: string): string {
    if (slug.startsWith("meta-")) return ORG_TITLE["meta-llama"] ?? slug;
    return ORG_TITLE[slug] ?? slug;
}

/** Sidebar filter: favorites only. */
const FAVORITES_FILTER = "__favorites__";
/** Sidebar filter: every org not in PRIORITY_ORGS. */
const MISC_FILTER = "__misc__";

const PRIORITY_ORGS = ["anthropic", "openai", "google", "deepseek"] as const;

/** Flagship model id per big-four org (OpenRouter ids). Shown under Favorites. */
const FLAGSHIP_ORDER: readonly string[] = [
    "anthropic/claude-sonnet-4.6",
    "openai/gpt-5.4",
    "google/gemini-3.1-pro-preview",
    "deepseek/deepseek-r1-0528",
];

const FLAGSHIP_LABELS: Record<string, string> = {
    "anthropic/claude-sonnet-4.6": "Anthropic: Claude Sonnet 4.6",
    "openai/gpt-5.4": "OpenAI: GPT-5.4",
    "google/gemini-3.1-pro-preview": "Google: Gemini 3.1 Pro Preview",
    "deepseek/deepseek-r1-0528": "DeepSeek: R1",
};

function placeholderFlagship(id: string): ModelChoice {
    const slug = providerSlug(id);
    return {
        id,
        label: FLAGSHIP_LABELS[id] ?? id,
        provider: slug,
        description: "TBA",
        description_full: "TBA",
    };
}

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

function resolveFlagships(rows: readonly ModelChoice[]): ModelChoice[] {
    const byId = new Map(rows.map((m) => [m.id, m]));
    return FLAGSHIP_ORDER.map((id) => byId.get(id) ?? placeholderFlagship(id));
}

function providerRank(slug: string): number {
    const i = PRIORITY_ORGS.indexOf(slug as (typeof PRIORITY_ORGS)[number]);
    return i >= 0 ? i : 1000;
}

function isPriorityOrg(slug: string): boolean {
    return PRIORITY_ORGS.includes(slug as (typeof PRIORITY_ORGS)[number]);
}

function OrgBadge(props: { slug: string }) {
    const letter = () => (props.slug[0] ?? "?").toUpperCase();
    return (
        <div
            class={`flex size-7 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold ${orgBadgeClass(props.slug)}`}
            title={orgTitle(props.slug)}
        >
            {letter()}
        </div>
    );
}

const ModelRowButton: Component<{
    m: ModelChoice;
    selected: boolean;
    onPick: () => void;
    onInfo: () => void;
}> = (props) => {
    const slugStr = () => props.m.provider ?? providerSlug(props.m.id);
    return (
        <div
            role="option"
            aria-selected={props.selected}
            class={`flex border-t border-slate-800/30 first:border-t-0 ${MODEL_ROW_MIN_CLASS} ${props.selected ? "bg-slate-800/45" : ""}`}
        >
            <button
                type="button"
                class={`flex min-w-0 flex-1 cursor-pointer gap-2 px-2 py-2 text-left transition-colors ${props.selected ? "" : "hover:bg-slate-800/30"}`}
                onClick={props.onPick}
            >
                <OrgBadge slug={slugStr()} />
                <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span class="text-[12px] font-medium text-slate-100">
                            {props.m.label}
                        </span>
                        <span class="font-mono text-[10px] text-emerald-500/85">
                            {props.m.pricing_tier ?? "—"}
                        </span>
                    </div>
                    <p class="mt-0.5 truncate text-[10px] leading-snug text-slate-500">
                        {props.m.description ?? "TBA"}
                    </p>
                </div>
                <div class="flex shrink-0 items-center gap-0.5 self-start pt-0.5">
                    <Show when={props.m.vision}>
                        <span
                            title="Vision"
                            class="text-slate-500"
                        >
                            <Eye
                                class="size-3.5"
                                stroke-width={2}
                                aria-hidden
                            />
                        </span>
                    </Show>
                    <Show when={props.m.reasoning}>
                        <span
                            title="Reasoning"
                            class="text-slate-500"
                        >
                            <Brain
                                class="size-3.5"
                                stroke-width={2}
                                aria-hidden
                            />
                        </span>
                    </Show>
                    <Show when={props.m.long_context}>
                        <span
                            title="Large context"
                            class="text-slate-500"
                        >
                            <FileText
                                class="size-3.5"
                                stroke-width={2}
                                aria-hidden
                            />
                        </span>
                    </Show>
                </div>
            </button>
            <button
                type="button"
                class="shrink-0 cursor-pointer px-2 py-2 text-slate-500 transition-colors hover:bg-slate-800/40 hover:text-slate-300"
                title="Model details"
                aria-label="Model details"
                onClick={(e) => {
                    e.stopPropagation();
                    props.onInfo();
                }}
            >
                <Info class="size-4" stroke-width={2} aria-hidden />
            </button>
        </div>
    );
};

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
    const [detailModelId, setDetailModelId] = createSignal<string | null>(
        null,
    );

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
            return resolveFlagships(rows);
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

    const favoriteRows = createMemo(() => resolveFlagships(modelOptions()));

    const restRows = createMemo(() => {
        if (filterOrg() !== null || hasSearch()) return [];
        const favSet = new Set(FLAGSHIP_ORDER);
        const rest = modelOptions().filter((m) => !favSet.has(m.id));
        rest.sort((a, b) => {
            const sa = a.provider ?? providerSlug(a.id);
            const sb = b.provider ?? providerSlug(b.id);
            const ra = providerRank(sa);
            const rb = providerRank(sb);
            if (ra !== rb) return ra - rb;
            if (sa !== sb) return sa.localeCompare(sb);
            return a.label.localeCompare(b.label);
        });
        return rest;
    });

    const showSplitAllView = createMemo(
        () => filterOrg() === null && !hasSearch(),
    );

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
                        <X class="size-4" stroke-width={2} aria-hidden />
                    </button>
                </div>
                <div class="mt-3 space-y-2 text-[11px] text-slate-300">
                    <p class="whitespace-pre-wrap leading-relaxed text-slate-400">
                        {fullDescription(row)}
                    </p>
                    <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 border-t border-slate-800/40 pt-3 text-[10px]">
                        <dt class="text-slate-500">Provider</dt>
                        <dd class="text-slate-300">
                            {orgTitle(
                                row.provider ?? providerSlug(row.id),
                            )}
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
                        OpenRouter
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
                                setFilterOrg(FAVORITES_FILTER);
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
                            <div class="flex h-full min-w-0 w-[min(28rem,calc(100vw-2rem))] shrink-0 flex-row overflow-hidden">
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
                                                    cur === slug ? null : slug,
                                                )
                                            }
                                        >
                                            {(slug[0] ?? "?").toUpperCase()}
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
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={props.model === ""}
                                    class={`flex w-full shrink-0 cursor-pointer gap-2 px-2 py-2 text-left text-[11px] transition-colors ${props.model === "" ? "bg-slate-800/50 text-slate-200" : "text-slate-400 hover:bg-slate-800/35"}`}
                                    onClick={() => {
                                        props.onModelChange("");
                                        close();
                                    }}
                                >
                                    <span class="pl-1 text-slate-500">
                                        Choose model…
                                    </span>
                                </button>
                                <div
                                    class={`${MODEL_LIST_VIEWPORT_CLASS} min-h-0 shrink-0 overflow-y-auto overscroll-contain`}
                                    role="listbox"
                                    aria-label="Model"
                                >
                                    <Show when={showSplitAllView()}>
                                        <p class="border-t border-slate-800/30 px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                            Favorites
                                        </p>
                                        <For each={favoriteRows()}>
                                            {(m) => (
                                                <ModelRowButton
                                                    m={m}
                                                    selected={
                                                        props.model === m.id
                                                    }
                                                    onPick={() => {
                                                        props.onModelChange(
                                                            m.id,
                                                        );
                                                        close();
                                                    }}
                                                    onInfo={() =>
                                                        toggleModelDetail(m)
                                                    }
                                                />
                                            )}
                                        </For>
                                        <p class="border-t border-slate-800/30 px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                            All models
                                        </p>
                                        <For each={restRows()}>
                                            {(m) => (
                                                <ModelRowButton
                                                    m={m}
                                                    selected={
                                                        props.model === m.id
                                                    }
                                                    onPick={() => {
                                                        props.onModelChange(
                                                            m.id,
                                                        );
                                                        close();
                                                    }}
                                                    onInfo={() =>
                                                        toggleModelDetail(m)
                                                    }
                                                />
                                            )}
                                        </For>
                                    </Show>
                                    <Show when={!showSplitAllView()}>
                                        <For each={filteredModels()}>
                                            {(m) => (
                                                <ModelRowButton
                                                    m={m}
                                                    selected={
                                                        props.model === m.id
                                                    }
                                                    onPick={() => {
                                                        props.onModelChange(
                                                            m.id,
                                                        );
                                                        close();
                                                    }}
                                                    onInfo={() =>
                                                        toggleModelDetail(m)
                                                    }
                                                />
                                            )}
                                        </For>
                                    </Show>
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
