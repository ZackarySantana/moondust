import ExternalLink from "lucide-solid/icons/external-link";
import type { Component } from "solid-js";
import { Show } from "solid-js";
import { ExternalAnchor } from "@/components/external-anchor";
import { OpenRouterUsageMetricsPanel } from "@/components/settings/openrouter-usage-metrics-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "@/components/settings-form";
import { useOpenRouterSettings } from "@/hooks/use-openrouter-settings";

export const OpenRouterSettingsTab: Component = () => {
    const o = useOpenRouterSettings();

    return (
        <Section
            title="OpenRouter"
            description="Multi-model access. Connect via OAuth (localhost:3000 must be free) or paste an API key from your OpenRouter workspace."
        >
            <div class="space-y-3">
                <Show when={o.banner() === "saved"}>
                    <p class="rounded-md border border-emerald-800/40 bg-emerald-950/30 px-2.5 py-1.5 text-xs text-emerald-200/90">
                        Saved locally. The key is not shown again here.
                    </p>
                </Show>
                <Show when={o.banner() === "cleared"}>
                    <p class="rounded-md border border-slate-700/50 bg-slate-900/50 px-2.5 py-1.5 text-xs text-slate-400">
                        OpenRouter key removed.
                    </p>
                </Show>

                <Show
                    when={o.hasKey()}
                    fallback={
                        <>
                            <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                                <Button
                                    type="button"
                                    variant="default"
                                    size="sm"
                                    disabled={o.oauthBusy()}
                                    onClick={() => o.startOAuth()}
                                >
                                    {o.oauthBusy()
                                        ? "Waiting for browser…"
                                        : "Connect OpenRouter"}
                                </Button>
                                <ExternalAnchor
                                    href="https://openrouter.ai/workspaces/default/keys"
                                    class="inline-flex cursor-pointer items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
                                >
                                    API keys
                                    <ExternalLink
                                        class="size-3"
                                        stroke-width={2}
                                        aria-hidden
                                    />
                                </ExternalAnchor>
                                <ExternalAnchor
                                    href="https://openrouter.ai/docs/guides/overview/auth/oauth"
                                    class="inline-flex cursor-pointer items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
                                >
                                    OAuth docs
                                    <ExternalLink
                                        class="size-3"
                                        stroke-width={2}
                                        aria-hidden
                                    />
                                </ExternalAnchor>
                            </div>

                            <Show when={o.oauthError()}>
                                {(err) => (
                                    <p class="text-xs text-red-400/90">
                                        {err()}
                                    </p>
                                )}
                            </Show>

                            <div class="border-t border-slate-800/40 pt-3">
                                <div class="flex max-w-md flex-col gap-2 sm:flex-row sm:items-end">
                                    <div class="min-w-0 flex-1 space-y-1">
                                        <Label
                                            for="openrouter-api-key"
                                            class="text-[11px] font-normal text-slate-600"
                                        >
                                            Or paste sk-or-…
                                        </Label>
                                        <Input
                                            id="openrouter-api-key"
                                            type="password"
                                            autocomplete="off"
                                            placeholder="sk-or-…"
                                            class="h-8 text-sm"
                                            value={o.manualKey()}
                                            onInput={(e) =>
                                                o.setManualKey(
                                                    e.currentTarget.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        class="shrink-0"
                                        disabled={
                                            !o.manualKey().trim() ||
                                            o.saveKeyMutation.isPending
                                        }
                                        onClick={() =>
                                            o.saveKeyMutation.mutate()
                                        }
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </>
                    }
                >
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={o.clearMutation.isPending}
                        onClick={() => o.clearMutation.mutate()}
                    >
                        Disconnect OpenRouter
                    </Button>
                </Show>

                <OpenRouterUsageMetricsPanel />
            </div>
        </Section>
    );
};
