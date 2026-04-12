import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import ExternalLink from "lucide-solid/icons/external-link";
import type { Component } from "solid-js";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Section } from "@/components/settings-form";
import { queryKeys } from "@/lib/query-client";
import {
    ClearOpenRouterAPIKey,
    ConnectOpenRouterOAuth,
    GetSettings,
    SaveSettings,
} from "@wails/go/app/App";
import { store } from "@wails/go/models";
import { EventsOn } from "@wails/runtime/runtime";

export const SettingsProvidersPage: Component = () => {
    const queryClient = useQueryClient();

    const settingsQuery = useQuery(() => ({
        queryKey: queryKeys.settings,
        queryFn: GetSettings,
    }));

    const [manualKey, setManualKey] = createSignal("");
    const [oauthBusy, setOauthBusy] = createSignal(false);
    const [oauthError, setOauthError] = createSignal("");
    const [banner, setBanner] = createSignal<"saved" | "cleared" | "">("");

    const hasKey = () => !!settingsQuery.data?.has_openrouter_api_key;

    onMount(() => {
        const off = EventsOn("openrouter:oauth", (...args: unknown[]) => {
            setOauthBusy(false);
            const payload = args[0] as { error?: string; status?: string };
            if (payload?.error) {
                setOauthError(payload.error);
                return;
            }
            if (payload?.status === "ok") {
                setOauthError("");
                setBanner("saved");
                void queryClient.invalidateQueries({
                    queryKey: queryKeys.settings,
                });
                setTimeout(() => setBanner(""), 4000);
            }
        });
        onCleanup(off);
    });

    const saveKeyMutation = useMutation(() => ({
        mutationFn: async () => {
            const current = settingsQuery.data;
            if (!current) return;
            const key = manualKey().trim();
            if (!key) return;
            await SaveSettings(
                new store.Settings({
                    ...current,
                    openrouter_api_key: key,
                }),
            );
        },
        onSuccess: () => {
            setManualKey("");
            setBanner("saved");
            void queryClient.invalidateQueries({
                queryKey: queryKeys.settings,
            });
            setTimeout(() => setBanner(""), 4000);
        },
    }));

    const clearMutation = useMutation(() => ({
        mutationFn: async () => {
            await ClearOpenRouterAPIKey();
        },
        onSuccess: () => {
            setManualKey("");
            setBanner("cleared");
            void queryClient.invalidateQueries({
                queryKey: queryKeys.settings,
            });
            setTimeout(() => setBanner(""), 4000);
        },
    }));

    function startOAuth() {
        setOauthError("");
        setOauthBusy(true);
        void ConnectOpenRouterOAuth();
    }

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
                title="OpenRouter"
                description="Multi-model access. Connecting opens the browser (localhost:3000 must be free) or paste a key from openrouter.ai/keys."
            >
                <div class="space-y-3">
                    <Show when={banner() === "saved"}>
                        <p class="rounded-md border border-emerald-800/40 bg-emerald-950/30 px-2.5 py-1.5 text-xs text-emerald-200/90">
                            Saved locally. The key is not shown again here.
                        </p>
                    </Show>
                    <Show when={banner() === "cleared"}>
                        <p class="rounded-md border border-slate-700/50 bg-slate-900/50 px-2.5 py-1.5 text-xs text-slate-400">
                            OpenRouter key removed.
                        </p>
                    </Show>

                    <Show
                        when={hasKey()}
                        fallback={
                            <>
                                <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                                    <Button
                                        type="button"
                                        variant="default"
                                        size="sm"
                                        disabled={oauthBusy()}
                                        onClick={() => startOAuth()}
                                    >
                                        {oauthBusy()
                                            ? "Waiting for browser…"
                                            : "Connect OpenRouter"}
                                    </Button>
                                    <a
                                        href="https://openrouter.ai/docs/guides/overview/auth/oauth"
                                        target="_blank"
                                        rel="noreferrer"
                                        class="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
                                    >
                                        OAuth docs
                                        <ExternalLink
                                            class="size-3"
                                            stroke-width={2}
                                            aria-hidden
                                        />
                                    </a>
                                </div>

                                <Show when={oauthError()}>
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
                                                value={manualKey()}
                                                onInput={(e) =>
                                                    setManualKey(
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
                                                !manualKey().trim() ||
                                                saveKeyMutation.isPending
                                            }
                                            onClick={() =>
                                                saveKeyMutation.mutate()
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
                            disabled={clearMutation.isPending}
                            onClick={() => clearMutation.mutate()}
                        >
                            Disconnect OpenRouter
                        </Button>
                    </Show>
                </div>
            </Section>
        </div>
    );
};
