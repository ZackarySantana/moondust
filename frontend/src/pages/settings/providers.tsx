import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import type { Component } from "solid-js";
import { createEffect, createMemo, createSignal, on } from "solid-js";
import { ClaudeCliSettingsTab } from "@/components/settings/claude-cli-settings-tab";
import { CursorCliSettingsTab } from "@/components/settings/cursor-cli-settings-tab";
import { OpenRouterSettingsTab } from "@/components/settings/openrouter-settings-tab";
import { ChatProviderBar } from "@/components/chat-provider-bar";
import { Separator } from "@/components/ui/separator";
import { Section } from "@/components/settings-form";
import { queryKeys } from "@/lib/query-client";
import {
    type ChatProviderId,
    type ModelChoice,
    OPENROUTER_CHAT_MODELS_FALLBACK,
    CURSOR_CHAT_MODELS_FALLBACK,
    CLAUDE_CHAT_MODELS_FALLBACK,
} from "@/lib/chat-provider";
import {
    GetSettings,
    SaveSettings,
    ListOpenRouterChatModels,
    ListCursorChatModels,
    ListClaudeChatModels,
} from "@wails/go/app/App";
import { store } from "@wails/go/models";
import { For } from "solid-js";

type ProviderTabId = "openrouter" | "cursor" | "claude";

const PROVIDER_TABS: { id: ProviderTabId; label: string }[] = [
    { id: "openrouter", label: "OpenRouter" },
    { id: "cursor", label: "Cursor" },
    { id: "claude", label: "Claude" },
];

export const SettingsProvidersPage: Component = () => {
    const queryClient = useQueryClient();
    const [providerTab, setProviderTab] =
        createSignal<ProviderTabId>("openrouter");

    const settingsQuery = useQuery(() => ({
        queryKey: queryKeys.settings,
        queryFn: GetSettings,
    }));

    const [utilityProvider, setUtilityProvider] =
        createSignal<ChatProviderId>("openrouter");
    const [utilityModel, setUtilityModel] = createSignal("");

    createEffect(
        on(
            () => settingsQuery.data,
            (data) => {
                if (data) {
                    setUtilityProvider(
                        (data.utility_provider as ChatProviderId) ||
                            "openrouter",
                    );
                    setUtilityModel(data.utility_model || "");
                }
            },
        ),
    );

    const saveMutation = useMutation(() => ({
        mutationFn: async (patch: {
            provider: ChatProviderId;
            model: string;
        }) => {
            const current = settingsQuery.data;
            await SaveSettings(
                new store.Settings({
                    ...current,
                    utility_provider: patch.provider,
                    utility_model: patch.model,
                }),
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.settings });
        },
    }));

    function handleProviderChange(id: ChatProviderId) {
        setUtilityProvider(id);
        const defaultModel =
            id === "cursor"
                ? "composer-2-fast"
                : id === "claude"
                  ? "sonnet"
                  : "openai/gpt-4o-mini";
        setUtilityModel(defaultModel);
        saveMutation.mutate({ provider: id, model: defaultModel });
    }

    function handleModelChange(modelId: string) {
        setUtilityModel(modelId);
        saveMutation.mutate({ provider: utilityProvider(), model: modelId });
    }

    const openRouterModelsQuery = useQuery(() => ({
        queryKey: queryKeys.openRouterModels,
        queryFn: ListOpenRouterChatModels,
        staleTime: 60 * 60 * 1000,
        enabled: utilityProvider() === "openrouter",
    }));

    const cursorModelsQuery = useQuery(() => ({
        queryKey: queryKeys.cursorChatModels,
        queryFn: ListCursorChatModels,
        staleTime: 60 * 60 * 1000,
        enabled: utilityProvider() === "cursor",
    }));

    const claudeModelsQuery = useQuery(() => ({
        queryKey: queryKeys.claudeChatModels,
        queryFn: ListClaudeChatModels,
        staleTime: 60 * 60 * 1000,
        enabled: utilityProvider() === "claude",
    }));

    function mapModels(
        rows: { id: string; name?: string; provider?: string; description?: string; description_full?: string; pricing_tier?: string; pricing_summary?: string; pricing_prompt?: string; pricing_completion?: string; vision?: boolean; reasoning?: boolean; long_context?: boolean; context_length?: number }[] | undefined,
    ): ModelChoice[] {
        if (!rows || rows.length === 0) return [];
        return rows.map((m) => ({
            id: m.id,
            label: (m.name && m.name.trim()) || m.id,
            provider: m.provider,
            description: m.description,
            description_full: m.description_full,
            pricing_tier: m.pricing_tier,
            pricing_summary: m.pricing_summary,
            pricing_prompt: m.pricing_prompt,
            pricing_completion: m.pricing_completion,
            vision: m.vision,
            reasoning: m.reasoning,
            long_context: m.long_context,
            context_length: m.context_length,
        }));
    }

    const utilityModelChoices = createMemo((): ModelChoice[] => {
        const cp = utilityProvider();
        if (cp === "cursor") {
            const mapped = mapModels(cursorModelsQuery.data ?? undefined);
            return mapped.length > 0 ? mapped : [...CURSOR_CHAT_MODELS_FALLBACK];
        }
        if (cp === "claude") {
            const mapped = mapModels(claudeModelsQuery.data ?? undefined);
            return mapped.length > 0 ? mapped : [...CLAUDE_CHAT_MODELS_FALLBACK];
        }
        const mapped = mapModels(openRouterModelsQuery.data ?? undefined);
        return mapped.length > 0
            ? mapped
            : [...OPENROUTER_CHAT_MODELS_FALLBACK];
    });

    return (
        <div class="space-y-8">
            <div>
                <p class="text-base font-medium text-slate-200">Providers</p>
                <p class="mt-1 text-sm text-slate-500">
                    Connect model providers for chat. Keys stay on this device
                    only.
                </p>
            </div>

            <Separator />

            <Section
                title="Utility model"
                description="Provider and model for background AI tasks: commit message drafts, branch reviews, and quick questions. This is separate from your main chat provider."
            >
                <div class="max-w-md">
                    <ChatProviderBar
                        provider={utilityProvider()}
                        onProviderChange={handleProviderChange}
                        model={utilityModel()}
                        onModelChange={handleModelChange}
                        modelChoices={utilityModelChoices()}
                        showOpenRouterKeyHint={
                            utilityProvider() === "openrouter" &&
                            !settingsQuery.data?.has_openrouter_api_key
                        }
                    />
                </div>
            </Section>

            <Separator />

            <div
                role="tablist"
                aria-label="Provider"
                class="flex flex-wrap gap-1 border-b border-slate-800/60 pb-px"
            >
                <For each={PROVIDER_TABS}>
                    {(tab) => {
                        const selected = () => providerTab() === tab.id;
                        return (
                            <button
                                type="button"
                                role="tab"
                                id={`provider-tab-${tab.id}`}
                                aria-selected={selected()}
                                aria-controls={`provider-panel-${tab.id}`}
                                class={`rounded-t-md border border-b-0 px-3 py-2 text-sm transition-colors ${
                                    selected()
                                        ? "border-slate-700/80 bg-slate-900/80 text-slate-100"
                                        : "border-transparent text-slate-500 hover:bg-slate-900/40 hover:text-slate-300"
                                }`}
                                onClick={() => setProviderTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        );
                    }}
                </For>
            </div>

            <div
                id="provider-panel-openrouter"
                role="tabpanel"
                aria-labelledby="provider-tab-openrouter"
                class={providerTab() === "openrouter" ? "" : "hidden"}
            >
                <OpenRouterSettingsTab />
            </div>
            <div
                id="provider-panel-cursor"
                role="tabpanel"
                aria-labelledby="provider-tab-cursor"
                class={providerTab() === "cursor" ? "" : "hidden"}
            >
                <CursorCliSettingsTab />
            </div>
            <div
                id="provider-panel-claude"
                role="tabpanel"
                aria-labelledby="provider-tab-claude"
                class={providerTab() === "claude" ? "" : "hidden"}
            >
                <ClaudeCliSettingsTab />
            </div>
        </div>
    );
};
