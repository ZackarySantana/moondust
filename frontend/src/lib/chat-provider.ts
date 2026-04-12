/** Which upstream powers chat completions. Extend as more providers are added. */
export type ChatProviderId = "openrouter";

export const CHAT_PROVIDERS: readonly {
    id: ChatProviderId;
    label: string;
}[] = [{ id: "openrouter", label: "OpenRouter" }];

/** OpenRouter model slugs for the thread model picker until we fetch models from the API. */
export const OPENROUTER_CHAT_MODELS: readonly {
    id: string;
    label: string;
}[] = [
    { id: "openai/gpt-4o", label: "GPT-4o" },
    { id: "openai/gpt-4o-mini", label: "GPT-4o mini" },
    { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
    { id: "anthropic/claude-3.5-haiku", label: "Claude 3.5 Haiku" },
    { id: "google/gemini-2.0-flash-001", label: "Gemini 2.0 Flash" },
    { id: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
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

/** Short line for above assistant bubbles: "OpenRouter · GPT-4o mini". */
export function assistantAttributionLabel(
    providerRaw: string | undefined,
    modelRaw: string | undefined,
): string | null {
    const prov = chatProviderFromThread(providerRaw);
    const providerLabel =
        CHAT_PROVIDERS.find((p) => p.id === prov)?.label ?? prov;
    const mid = chatModelFromThread(modelRaw);
    const modelLabel = mid
        ? (OPENROUTER_CHAT_MODELS.find((m) => m.id === mid)?.label ?? mid)
        : "";
    if (!providerLabel && !modelLabel) return null;
    if (providerLabel && modelLabel) return `${providerLabel} · ${modelLabel}`;
    return providerLabel || modelLabel;
}
