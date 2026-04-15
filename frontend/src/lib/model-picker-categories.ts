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

type OrgIdentity = {
    abbr: string;
    badgeClass: string;
    title: string;
};

const ORG_IDENTITY: Record<string, OrgIdentity> = {
    openai: {
        abbr: "OAI",
        badgeClass:
            "bg-gradient-to-br from-emerald-800/70 to-emerald-950/80 text-emerald-200 ring-1 ring-emerald-700/30",
        title: "OpenAI",
    },
    anthropic: {
        abbr: "ANT",
        badgeClass:
            "bg-gradient-to-br from-amber-800/60 to-amber-950/70 text-amber-200 ring-1 ring-amber-700/30",
        title: "Anthropic",
    },
    google: {
        abbr: "GGL",
        badgeClass:
            "bg-gradient-to-br from-sky-800/60 to-sky-950/70 text-sky-200 ring-1 ring-sky-700/30",
        title: "Google",
    },
    "meta-llama": {
        abbr: "META",
        badgeClass:
            "bg-gradient-to-br from-indigo-800/60 to-indigo-950/70 text-indigo-200 ring-1 ring-indigo-700/30",
        title: "Meta",
    },
    "x-ai": {
        abbr: "xAI",
        badgeClass:
            "bg-gradient-to-br from-slate-600/80 to-slate-800/90 text-slate-100 ring-1 ring-slate-500/30",
        title: "xAI",
    },
    deepseek: {
        abbr: "DS",
        badgeClass:
            "bg-gradient-to-br from-violet-800/60 to-violet-950/70 text-violet-200 ring-1 ring-violet-700/30",
        title: "DeepSeek",
    },
    qwen: {
        abbr: "QW",
        badgeClass:
            "bg-gradient-to-br from-cyan-800/60 to-cyan-950/70 text-cyan-200 ring-1 ring-cyan-700/30",
        title: "Qwen",
    },
    mistralai: {
        abbr: "MST",
        badgeClass:
            "bg-gradient-to-br from-orange-800/60 to-orange-950/70 text-orange-200 ring-1 ring-orange-700/30",
        title: "Mistral",
    },
    nvidia: {
        abbr: "NV",
        badgeClass:
            "bg-gradient-to-br from-lime-800/50 to-lime-950/60 text-lime-200 ring-1 ring-lime-700/30",
        title: "NVIDIA",
    },
    "z-ai": {
        abbr: "Z",
        badgeClass:
            "bg-gradient-to-br from-fuchsia-800/60 to-fuchsia-950/70 text-fuchsia-200 ring-1 ring-fuchsia-700/30",
        title: "Z.AI",
    },
    bytedance: {
        abbr: "BD",
        badgeClass:
            "bg-gradient-to-br from-rose-800/50 to-rose-950/60 text-rose-200 ring-1 ring-rose-700/30",
        title: "ByteDance",
    },
    cohere: {
        abbr: "CO",
        badgeClass:
            "bg-gradient-to-br from-blue-800/60 to-blue-950/70 text-blue-200 ring-1 ring-blue-700/30",
        title: "Cohere",
    },
    perplexity: {
        abbr: "PPX",
        badgeClass:
            "bg-gradient-to-br from-purple-800/60 to-purple-950/70 text-purple-200 ring-1 ring-purple-700/30",
        title: "Perplexity",
    },
    cursor: {
        abbr: "CUR",
        badgeClass:
            "bg-gradient-to-br from-violet-800/60 to-violet-950/70 text-violet-200 ring-1 ring-violet-700/30",
        title: "Cursor",
    },
};

const DEFAULT_IDENTITY: OrgIdentity = {
    abbr: "?",
    badgeClass:
        "bg-gradient-to-br from-slate-700/80 to-slate-900/90 text-slate-300 ring-1 ring-slate-600/30",
    title: "",
};

function resolveIdentity(slug: string): OrgIdentity {
    if (slug.startsWith("meta-")) {
        return ORG_IDENTITY["meta-llama"] ?? DEFAULT_IDENTITY;
    }
    return ORG_IDENTITY[slug] ?? DEFAULT_IDENTITY;
}

export function orgBadgeAbbr(slug: string): string {
    return resolveIdentity(slug).abbr || (slug[0] ?? "?").toUpperCase();
}

export function orgBadgeClass(slug: string): string {
    return resolveIdentity(slug).badgeClass;
}

export function orgTitle(slug: string): string {
    const title = resolveIdentity(slug).title;
    return title || slug;
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

const FLAGSHIP_SET = new Set(FLAGSHIP_ORDER);

/** Whether a model ID is in the flagship/favorites set. */
export function isFlagshipModel(id: string): boolean {
    return FLAGSHIP_SET.has(id);
}

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

/**
 * Map a pricing_tier string to a color class for visual hierarchy.
 * Free / cheap = cool tones, expensive = warm tones.
 */
export function pricingTierClass(tier: string | undefined): string {
    if (!tier) return "text-slate-600";
    const t = tier.toLowerCase().trim();
    if (t === "free") return "text-emerald-400/90";
    if (t === "$") return "text-sky-400/85";
    if (t === "$$") return "text-amber-400/85";
    if (t === "$$$") return "text-orange-400/85";
    if (t === "$$$$" || t === "$$$$$") return "text-rose-400/85";
    return "text-emerald-500/85";
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
 * Cursor `agent --list-models`: Auto + Composer (plan "Auto" bucket + composer ids)
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
