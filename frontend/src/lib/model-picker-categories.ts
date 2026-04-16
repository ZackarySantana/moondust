import type { ModelChoice } from "@/lib/chat-provider";

export type ModelPickerCategory = {
    id: string;
    label: string;
    models: readonly ModelChoice[];
};

export function providerSlug(id: string): string {
    const i = id.indexOf("/");
    return i > 0 ? id.slice(0, i) : "other";
}

export const ORG_BADGE: Record<string, string> = {
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
    cursor: "bg-violet-900/50 text-violet-100",
};

export const ORG_TITLE: Record<string, string> = {
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
    cursor: "Cursor",
};

export function orgBadgeClass(slug: string): string {
    if (slug.startsWith("meta-")) {
        return ORG_BADGE["meta-llama"] ?? "bg-slate-800/80 text-slate-200";
    }
    return ORG_BADGE[slug] ?? "bg-slate-800/80 text-slate-200";
}

export function orgTitle(slug: string): string {
    if (slug.startsWith("meta-")) return ORG_TITLE["meta-llama"] ?? slug;
    return ORG_TITLE[slug] ?? slug;
}

/** Sidebar filter: favorites only. */
export const FAVORITES_FILTER = "__favorites__";
/** Sidebar filter: every org not in PRIORITY_ORGS. */
export const MISC_FILTER = "__misc__";

export const PRIORITY_ORGS = [
    "anthropic",
    "openai",
    "google",
    "deepseek",
] as const;

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

export function resolveOpenRouterFlagships(
    rows: readonly ModelChoice[],
): ModelChoice[] {
    const byId = new Map(rows.map((m) => [m.id, m]));
    return FLAGSHIP_ORDER.map((id) => byId.get(id) ?? placeholderFlagship(id));
}

function providerRank(slug: string): number {
    const i = PRIORITY_ORGS.indexOf(slug as (typeof PRIORITY_ORGS)[number]);
    return i >= 0 ? i : 1000;
}

export function isPriorityOrg(slug: string): boolean {
    return PRIORITY_ORGS.includes(slug as (typeof PRIORITY_ORGS)[number]);
}

export function buildOpenRouterSplitCategories(
    rows: readonly ModelChoice[],
): ModelPickerCategory[] {
    const favorites = resolveOpenRouterFlagships(rows);
    const favSet = new Set(FLAGSHIP_ORDER);
    const rest = rows.filter((m) => !favSet.has(m.id));
    rest.sort((a, b) => {
        const sa = a.provider ?? providerSlug(a.id);
        const sb = b.provider ?? providerSlug(b.id);
        const ra = providerRank(sa);
        const rb = providerRank(sb);
        if (ra !== rb) return ra - rb;
        if (sa !== sb) return sa.localeCompare(sb);
        return a.label.localeCompare(b.label);
    });
    return [
        { id: "favorites", label: "Favorites", models: favorites },
        { id: "all", label: "All models", models: rest },
    ];
}

/**
 * Cursor `agent --list-models`: Auto + Composer (plan “Auto” bucket + composer ids)
 * vs named/API models.
 */
export function buildCursorModelCategories(
    models: readonly ModelChoice[],
): ModelPickerCategory[] {
    const auto: ModelChoice[] = [];
    const composer: ModelChoice[] = [];
    const api: ModelChoice[] = [];
    for (const m of models) {
        const id = m.id.toLowerCase();
        if (id === "auto") auto.push(m);
        else if (id.startsWith("composer-")) composer.push(m);
        else api.push(m);
    }
    composer.sort((a, b) => a.label.localeCompare(b.label));
    api.sort((a, b) => a.label.localeCompare(b.label));
    const autoComposer: ModelChoice[] = [...auto, ...composer];
    const out: ModelPickerCategory[] = [];
    if (autoComposer.length) {
        out.push({
            id: "auto_composer",
            label: "Auto + Composer",
            models: autoComposer,
        });
    }
    if (api.length) {
        out.push({ id: "api", label: "API", models: api });
    }
    return out;
}

/**
 * Claude Code CLI: single sorted list (aliases from `claude --model`).
 */
export function buildClaudeModelCategories(
    models: readonly ModelChoice[],
): ModelPickerCategory[] {
    const rest = [...models].sort((a, b) => a.label.localeCompare(b.label));
    return [{ id: "claude", label: "Claude models", models: rest }];
}
