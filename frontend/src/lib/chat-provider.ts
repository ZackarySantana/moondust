/** Which upstream powers chat completions. Extend as more providers are added. */
export type ChatProviderId = "openrouter";

export const CHAT_PROVIDERS: readonly {
    id: ChatProviderId;
    label: string;
}[] = [{ id: "openrouter", label: "OpenRouter" }];

/** Fallback picker + labels when ListOpenRouterChatModels has not loaded yet or fails. */
export const OPENROUTER_CHAT_MODELS_FALLBACK: readonly {
    id: string;
    label: string;
}[] = [
    { id: "openai/gpt-5.4", label: "OpenAI: GPT-5.4" },
    { id: "openai/gpt-5.4-mini", label: "OpenAI: GPT-5.4 Mini" },
    {
        id: "anthropic/claude-sonnet-4.6",
        label: "Anthropic: Claude Sonnet 4.6",
    },
    { id: "anthropic/claude-opus-4.6", label: "Anthropic: Claude Opus 4.6" },
    {
        id: "google/gemini-3.1-pro-preview",
        label: "Google: Gemini 3.1 Pro Preview",
    },
    {
        id: "google/gemini-3.1-flash-lite-preview",
        label: "Google: Gemini 3.1 Flash Lite",
    },
    { id: "openai/gpt-4o-mini", label: "OpenAI: GPT-4o mini" },
    {
        id: "meta-llama/llama-3.3-70b-instruct",
        label: "Meta: Llama 3.3 70B Instruct",
    },
    { id: "deepseek/deepseek-r1-0528", label: "DeepSeek: R1" },
    { id: "qwen/qwen3-coder-next", label: "Qwen: Qwen3 Coder Next" },
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

export type ModelChoice = { id: string; label: string };

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
