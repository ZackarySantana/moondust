import type { Component } from "solid-js";
import { createSignal, For } from "solid-js";
import { ClaudeCliSettingsTab } from "@/components/settings/claude-cli-settings-tab";
import { CursorCliSettingsTab } from "@/components/settings/cursor-cli-settings-tab";
import { OpenRouterSettingsTab } from "@/components/settings/openrouter-settings-tab";
import { Separator } from "@/components/ui/separator";

type ProviderTabId = "openrouter" | "cursor" | "claude";

const PROVIDER_TABS: { id: ProviderTabId; label: string }[] = [
    { id: "openrouter", label: "OpenRouter" },
    { id: "cursor", label: "Cursor" },
    { id: "claude", label: "Claude" },
];

export const SettingsProvidersPage: Component = () => {
    const [providerTab, setProviderTab] =
        createSignal<ProviderTabId>("openrouter");

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
