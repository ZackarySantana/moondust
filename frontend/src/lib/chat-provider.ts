/** Which upstream powers chat completions. Extend as more providers are added. */
export type ChatProviderId = "openrouter";

export const CHAT_PROVIDERS: readonly {
    id: ChatProviderId;
    label: string;
}[] = [{ id: "openrouter", label: "OpenRouter" }];

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

/** Normalize persisted thread.chat_provider (empty legacy threads default to OpenRouter). */
export function chatProviderFromThread(
    raw: string | undefined,
): ChatProviderId {
    const t = (raw ?? "").trim();
    if (t === "openrouter") return "openrouter";
    return "openrouter";
}

/** Raw model id from thread (may be empty). */
export function chatModelFromThread(raw: string | undefined): string {
    return (raw ?? "").trim();
}

/** Resolve display name for a model id using API list, then fallback slugs. */
export function modelDisplayName(
    modelId: string | undefined,
    choices: readonly ModelChoice[],
): string {
    const mid = (modelId ?? "").trim();
    if (!mid) return "";
    return (
        choices.find((m) => m.id === mid)?.label ??
        OPENROUTER_CHAT_MODELS_FALLBACK.find((m) => m.id === mid)?.label ??
        mid
    );
}

/** Short line for above assistant bubbles: "OpenRouter · …". */
export function assistantAttributionLabel(
    providerRaw: string | undefined,
    modelRaw: string | undefined,
    modelChoices: readonly ModelChoice[] = [...OPENROUTER_CHAT_MODELS_FALLBACK],
): string | null {
    const prov = chatProviderFromThread(providerRaw);
    const providerLabel =
        CHAT_PROVIDERS.find((p) => p.id === prov)?.label ?? prov;
    const modelLabel = modelDisplayName(modelRaw, modelChoices);
    if (!providerLabel && !modelLabel) return null;
    if (providerLabel && modelLabel) return `${providerLabel} · ${modelLabel}`;
    return providerLabel || modelLabel;
}
