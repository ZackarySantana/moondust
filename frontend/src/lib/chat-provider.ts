/** Which upstream powers chat completions. Extend as more providers are added. */
export type ChatProviderId = "openrouter" | "cursor" | "claude";

export const CHAT_PROVIDERS: readonly {
    id: ChatProviderId;
    label: string;
}[] = [
    { id: "openrouter", label: "OpenRouter" },
    { id: "cursor", label: "Cursor" },
    { id: "claude", label: "Claude Code" },
];

/** Longest label in {@link CHAT_PROVIDERS}; use to reserve dropdown width (no layout shift). */
export const CHAT_PROVIDER_LABEL_WIDTH_PLACEHOLDER = CHAT_PROVIDERS.reduce(
    (longest, p) => (p.label.length > longest.length ? p.label : longest),
    "",
);

export type ModelChoice = {
    id: string;
    label: string;
    provider?: string;
    /** One-line preview in the picker list. */
    description?: string;
    /** Full API description for the detail panel. */
    description_full?: string;
    pricing_tier?: string;
    /** Catalog pricing (USD per 1M tokens in/out) from OpenRouter model list. */
    pricing_summary?: string;
    pricing_prompt?: string;
    pricing_completion?: string;
    vision?: boolean;
    reasoning?: boolean;
    long_context?: boolean;
    /** From OpenRouter `context_length` when available. */
    context_length?: number;
};

/** Fallback picker when ListOpenRouterChatModels has not loaded yet or fails. */
export const OPENROUTER_CHAT_MODELS_FALLBACK: readonly ModelChoice[] = [
    {
        id: "openai/gpt-5.4",
        label: "OpenAI: GPT-5.4",
        provider: "openai",
        description: "TBA",
    },
    {
        id: "openai/gpt-5.4-mini",
        label: "OpenAI: GPT-5.4 Mini",
        provider: "openai",
        description: "TBA",
    },
    {
        id: "anthropic/claude-sonnet-4.6",
        label: "Anthropic: Claude Sonnet 4.6",
        provider: "anthropic",
        description: "TBA",
    },
    {
        id: "anthropic/claude-opus-4.6",
        label: "Anthropic: Claude Opus 4.6",
        provider: "anthropic",
        description: "TBA",
    },
    {
        id: "google/gemini-3.1-pro-preview",
        label: "Google: Gemini 3.1 Pro Preview",
        provider: "google",
        description: "TBA",
    },
    {
        id: "google/gemini-3.1-flash-lite-preview",
        label: "Google: Gemini 3.1 Flash Lite",
        provider: "google",
        description: "TBA",
    },
    {
        id: "openai/gpt-4o-mini",
        label: "OpenAI: GPT-4o mini",
        provider: "openai",
        description: "TBA",
    },
    {
        id: "meta-llama/llama-3.3-70b-instruct",
        label: "Meta: Llama 3.3 70B Instruct",
        provider: "meta-llama",
        description: "TBA",
    },
    {
        id: "deepseek/deepseek-r1-0528",
        label: "DeepSeek: R1",
        provider: "deepseek",
        description: "TBA",
    },
    {
        id: "qwen/qwen3-coder-next",
        label: "Qwen: Qwen3 Coder Next",
        provider: "qwen",
        description: "TBA",
    },
];

/** Minimal Cursor Agent models when `ListCursorChatModels` has not loaded yet. */
export const CURSOR_CHAT_MODELS_FALLBACK: readonly ModelChoice[] = [
    {
        id: "composer-2-fast",
        label: "Composer 2 Fast",
        provider: "cursor",
        description: "Default",
    },
    {
        id: "composer-2",
        label: "Composer 2",
        provider: "cursor",
        description: "TBA",
    },
];

/** Claude Code CLI model aliases when `ListClaudeChatModels` has not loaded yet. */
export const CLAUDE_CHAT_MODELS_FALLBACK: readonly ModelChoice[] = [
    {
        id: "sonnet",
        label: "Claude Sonnet (latest)",
        provider: "anthropic",
        description: "Default balanced model",
    },
    {
        id: "opus",
        label: "Claude Opus (latest)",
        provider: "anthropic",
        description: "Most capable",
    },
    {
        id: "haiku",
        label: "Claude Haiku (latest)",
        provider: "anthropic",
        description: "Fast and economical",
    },
];

/**
 * Parses a persisted `chat_provider` string. Empty or unknown values throw — there is no default.
 */
export function parseChatProviderId(raw: string): ChatProviderId {
    const t = raw.trim();
    if (t === "") {
        throw new Error("chat_provider is required");
    }
    if (t === "cursor") return "cursor";
    if (t === "claude") return "claude";
    if (t === "openrouter") return "openrouter";
    throw new Error(`invalid chat_provider: ${JSON.stringify(raw)}`);
}

/** Raw model id from thread (may be empty). */
export function chatModelFromThread(raw: string | undefined): string {
    return (raw ?? "").trim();
}

/**
 * Resolve display name for a model id.
 * Prefer bundled fallbacks before the live `choices` list so past messages stay
 * stable when the thread’s active provider changes: `choices` is only the
 * *current* provider’s catalog, so e.g. Cursor API labels (with CLI suffixes)
 * would otherwise disagree with OpenRouter-time lookup that falls through to
 * static Cursor fallbacks.
 */
export function modelDisplayName(
    modelId: string | undefined,
    choices: readonly ModelChoice[],
): string {
    const mid = (modelId ?? "").trim();
    if (!mid) return "";
    return (
        CURSOR_CHAT_MODELS_FALLBACK.find((m) => m.id === mid)?.label ??
        CLAUDE_CHAT_MODELS_FALLBACK.find((m) => m.id === mid)?.label ??
        OPENROUTER_CHAT_MODELS_FALLBACK.find((m) => m.id === mid)?.label ??
        choices.find((m) => m.id === mid)?.label ??
        mid
    );
}

/** Short line for above assistant bubbles: "OpenRouter · …". */
export function assistantAttributionLabel(
    providerRaw: string | undefined,
    modelRaw: string | undefined,
    modelChoices: readonly ModelChoice[] = [...OPENROUTER_CHAT_MODELS_FALLBACK],
): string | null {
    const pr = (providerRaw ?? "").trim();
    const modelLabel = modelDisplayName(modelRaw, modelChoices);
    if (pr === "") {
        return modelLabel || null;
    }
    const prov = parseChatProviderId(pr);
    const providerLabel =
        CHAT_PROVIDERS.find((p) => p.id === prov)?.label ?? prov;
    if (!providerLabel && !modelLabel) return null;
    if (providerLabel && modelLabel) return `${providerLabel} · ${modelLabel}`;
    return providerLabel || modelLabel;
}
