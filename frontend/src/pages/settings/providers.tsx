import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import ExternalLink from "lucide-solid/icons/external-link";
import type { Component, JSX } from "solid-js";
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Section } from "@/components/settings-form";
import { queryKeys } from "@/lib/query-client";
import {
    ClearOpenRouterAPIKey,
    ConnectOpenRouterOAuth,
    GetCursorCLIInfo,
    GetOpenRouterUsageMetrics,
    GetSettings,
    SaveSettings,
} from "@wails/go/app/App";
import { store } from "@wails/go/models";
import { EventsOn } from "@wails/runtime/runtime";

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
                <CursorSettingsTab />
            </div>
            <div
                id="provider-panel-claude"
                role="tabpanel"
                aria-labelledby="provider-tab-claude"
                class={providerTab() === "claude" ? "" : "hidden"}
            >
                <PlaceholderProviderTab
                    title="Claude"
                    description="Anthropic / Claude provider settings will be available here in a future release."
                />
            </div>
        </div>
    );
};

const PlaceholderProviderTab: Component<{
    title: string;
    description: string;
}> = (props) => (
    <Section
        title={props.title}
        description={props.description}
    >
        <p class="text-sm text-slate-500">Coming soon.</p>
    </Section>
);

const CURSOR_INSTALL_URL = "https://cursor.com/install";
const CURSOR_DASHBOARD_URL = "https://cursor.com/dashboard";

function formatCursorPct(n: number | undefined): string {
    if (n === undefined || !Number.isFinite(n)) {
        return "—";
    }
    return `${n.toFixed(1)}%`;
}

const CursorSettingsTab: Component = () => {
    const queryClient = useQueryClient();
    const cursorQuery = useQuery(() => ({
        queryKey: queryKeys.cursorCLI,
        queryFn: GetCursorCLIInfo,
    }));

    function refresh() {
        void queryClient.invalidateQueries({
            queryKey: queryKeys.cursorCLI,
        });
    }

    return (
        <Section
            title="Cursor"
            description="Moondust uses the Cursor Agent CLI (`agent`) when it is on your PATH. Install from cursor.com/install, then use Refresh if you add it without restarting this app."
        >
            <div class="flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={cursorQuery.isFetching}
                    onClick={() => refresh()}
                >
                    {cursorQuery.isFetching ? "Refreshing…" : "Refresh"}
                </Button>
                <a
                    href={CURSOR_INSTALL_URL}
                    target="_blank"
                    rel="noreferrer"
                    class="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
                >
                    Install Cursor CLI
                    <ExternalLink
                        class="size-3"
                        stroke-width={2}
                        aria-hidden
                    />
                </a>
            </div>

            <Show
                when={!cursorQuery.isLoading}
                fallback={
                    <p class="text-sm text-slate-500">Checking for `agent`…</p>
                }
            >
                <Show
                    when={cursorQuery.data}
                    fallback={
                        <p class="text-sm text-red-400/90">
                            {cursorQuery.error instanceof Error
                                ? cursorQuery.error.message
                                : "Could not load Cursor CLI info."}
                        </p>
                    }
                >
                    {(data) => {
                        const info = () => data();
                        return (
                            <div class="space-y-4">
                                <Show
                                    when={info().installed}
                                    fallback={
                                        <p class="rounded-md border border-amber-800/40 bg-amber-950/25 px-2.5 py-2 text-xs text-amber-100/90">
                                            {info().probe_error ||
                                                "Cursor Agent CLI (`agent`) not found on PATH."}
                                        </p>
                                    }
                                >
                                    <div class="space-y-1 rounded-md border border-emerald-800/35 bg-emerald-950/20 px-2.5 py-2 text-xs text-emerald-100/90">
                                        <p>
                                            Cursor Agent CLI (
                                            <code class="text-emerald-200/95">
                                                agent
                                            </code>
                                            ) detected
                                        </p>
                                        <p class="font-mono text-[11px] text-slate-400">
                                            {info().binary_path}
                                        </p>
                                        <Show when={info().version}>
                                            <p class="text-slate-500">
                                                Version:{" "}
                                                <span class="font-mono text-slate-300">
                                                    {info().version}
                                                </span>
                                            </p>
                                        </Show>
                                    </div>
                                </Show>

                                <Show when={info().usage || info().usage_error}>
                                    <div class="space-y-2">
                                        <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                            Account usage
                                        </p>
                                        <p class="text-xs text-slate-600">
                                            Composer (auto) vs API model usage
                                            for your billing period — same
                                            buckets as{" "}
                                            <code class="rounded bg-slate-900/80 px-1 py-0.5 text-[10px]">
                                                /usage
                                            </code>{" "}
                                            in the agent. From Cursor’s
                                            dashboard API; details also on{" "}
                                            <a
                                                href={CURSOR_DASHBOARD_URL}
                                                target="_blank"
                                                rel="noreferrer"
                                                class="text-emerald-400/95 hover:underline"
                                            >
                                                cursor.com/dashboard
                                            </a>
                                            .
                                        </p>
                                        {info().usage_error ? (
                                            <p class="rounded-md border border-amber-800/40 bg-amber-950/25 px-2.5 py-2 text-xs text-amber-100/90">
                                                {info().usage_error}
                                            </p>
                                        ) : (
                                            <Show when={info().usage}>
                                                <div class="grid gap-2 sm:grid-cols-2">
                                                    <div class="rounded-md border border-slate-800/60 bg-slate-950/40 p-2.5">
                                                        <p class="text-[11px] font-medium text-slate-500">
                                                            Composer (auto)
                                                        </p>
                                                        <p class="mt-1 font-mono text-lg text-slate-200 tabular-nums">
                                                            {formatCursorPct(
                                                                info().usage
                                                                    ?.auto_percent_used,
                                                            )}
                                                        </p>
                                                        <Show
                                                            when={
                                                                info().usage
                                                                    ?.auto_usage_message
                                                            }
                                                        >
                                                            <p class="mt-2 text-xs leading-snug text-slate-500">
                                                                {
                                                                    info().usage
                                                                        ?.auto_usage_message
                                                                }
                                                            </p>
                                                        </Show>
                                                    </div>
                                                    <div class="rounded-md border border-slate-800/60 bg-slate-950/40 p-2.5">
                                                        <p class="text-[11px] font-medium text-slate-500">
                                                            API
                                                        </p>
                                                        <p class="mt-1 font-mono text-lg text-slate-200 tabular-nums">
                                                            {formatCursorPct(
                                                                info().usage
                                                                    ?.api_percent_used,
                                                            )}
                                                        </p>
                                                        <Show
                                                            when={
                                                                info().usage
                                                                    ?.api_usage_message
                                                            }
                                                        >
                                                            <p class="mt-2 text-xs leading-snug text-slate-500">
                                                                {
                                                                    info().usage
                                                                        ?.api_usage_message
                                                                }
                                                            </p>
                                                        </Show>
                                                    </div>
                                                    <div class="sm:col-span-2 rounded-md border border-slate-800/50 bg-slate-950/30 p-2.5">
                                                        <p class="text-[11px] font-medium text-slate-500">
                                                            Total (included
                                                            usage)
                                                        </p>
                                                        <p class="mt-1 font-mono text-sm text-slate-300 tabular-nums">
                                                            {formatCursorPct(
                                                                info().usage
                                                                    ?.total_percent_used,
                                                            )}
                                                        </p>
                                                        <Show
                                                            when={
                                                                info().usage
                                                                    ?.display_message
                                                            }
                                                        >
                                                            <p class="mt-2 text-xs text-slate-400">
                                                                {
                                                                    info().usage
                                                                        ?.display_message
                                                                }
                                                            </p>
                                                        </Show>
                                                    </div>
                                                </div>
                                            </Show>
                                        )}
                                    </div>
                                </Show>

                                <Show when={info().installed}>
                                    <div class="space-y-3">
                                        <div>
                                            <p class="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                                agent status
                                            </p>
                                            <pre class="max-h-48 overflow-auto rounded-md border border-slate-800/60 bg-slate-950/50 p-2.5 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-slate-300">
                                                {info().status_output ||
                                                    "(empty)"}
                                            </pre>
                                        </div>
                                        <div>
                                            <p class="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                                agent about
                                            </p>
                                            <pre class="max-h-48 overflow-auto rounded-md border border-slate-800/60 bg-slate-950/50 p-2.5 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-slate-300">
                                                {info().about_output ||
                                                    "(empty)"}
                                            </pre>
                                        </div>
                                    </div>
                                </Show>
                            </div>
                        );
                    }}
                </Show>
            </Show>
        </Section>
    );
};

const OpenRouterSettingsTab: Component = () => {
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
        <Section
            title="OpenRouter"
            description="Multi-model access. Connect via OAuth (localhost:3000 must be free) or paste an API key from your OpenRouter workspace."
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
                                    href="https://openrouter.ai/workspaces/default/keys"
                                    target="_blank"
                                    rel="noreferrer"
                                    class="inline-flex cursor-pointer items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
                                >
                                    API keys
                                    <ExternalLink
                                        class="size-3"
                                        stroke-width={2}
                                        aria-hidden
                                    />
                                </a>
                                <a
                                    href="https://openrouter.ai/docs/guides/overview/auth/oauth"
                                    target="_blank"
                                    rel="noreferrer"
                                    class="inline-flex cursor-pointer items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
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
                                        onClick={() => saveKeyMutation.mutate()}
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

                <OpenRouterUsageMetricsPanel />
            </div>
        </Section>
    );
};

const METRICS_PREVIEW = 5;

const usdFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
});

function formatUsd(n: number): string {
    if (!Number.isFinite(n) || n === 0) {
        return usdFmt.format(0);
    }
    if (n < 0.01 && n > 0) {
        return usdFmt.format(n);
    }
    return usdFmt.format(n);
}

function formatTokens(n: number): string {
    if (!Number.isFinite(n)) return "0";
    return new Intl.NumberFormat("en-US").format(Math.round(n));
}

function formatLastUsed(raw: unknown): string {
    if (raw == null) return "—";
    const d =
        raw instanceof Date
            ? raw
            : typeof raw === "string" || typeof raw === "number"
              ? new Date(raw)
              : null;
    if (!d || Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

const OpenRouterUsageMetricsPanel: Component = () => {
    const metricsQuery = useQuery(() => ({
        queryKey: queryKeys.openRouterUsageMetrics,
        queryFn: GetOpenRouterUsageMetrics,
    }));

    return (
        <div class="border-t border-slate-800/40 pt-4">
            <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Local usage (this device)
            </p>
            <p class="mt-1 text-xs text-slate-500">
                Averages are total billed{" "}
                <code class="rounded bg-slate-900/80 px-1 py-0.5 text-[10px] text-slate-400">
                    cost_usd
                </code>{" "}
                divided by assistant turn count (per model or overall). Turns
                without a reported cost still count toward the divisor, so
                averages reflect typical spend per reply.
            </p>

            <Show
                when={!metricsQuery.isLoading}
                fallback={
                    <p class="mt-3 text-xs text-slate-500">Loading metrics…</p>
                }
            >
                <Show
                    when={metricsQuery.data}
                    fallback={
                        <p class="mt-3 text-xs text-red-400/90">
                            {metricsQuery.error instanceof Error
                                ? metricsQuery.error.message
                                : "Could not load metrics."}
                        </p>
                    }
                >
                    {(m) => {
                        const data = m();
                        return (
                            <div class="mt-4 space-y-4">
                                <div class="grid grid-cols-2 gap-2 lg:grid-cols-5">
                                    <div class="rounded-md border border-slate-800/60 bg-slate-950/40 px-2.5 py-2">
                                        <p class="text-[10px] uppercase text-slate-500">
                                            Total spend
                                        </p>
                                        <p class="mt-0.5 font-mono text-sm text-slate-200">
                                            {formatUsd(data.total_cost_usd)}
                                        </p>
                                    </div>
                                    <div class="rounded-md border border-slate-800/60 bg-slate-950/40 px-2.5 py-2">
                                        <p class="text-[10px] uppercase text-slate-500">
                                            Avg per turn (all)
                                        </p>
                                        <p class="mt-0.5 font-mono text-sm text-slate-200">
                                            {formatUsd(
                                                data.average_cost_per_assistant_turn_usd ??
                                                    0,
                                            )}
                                        </p>
                                    </div>
                                    <div class="rounded-md border border-slate-800/60 bg-slate-950/40 px-2.5 py-2">
                                        <p class="text-[10px] uppercase text-slate-500">
                                            Assistant turns
                                        </p>
                                        <p class="mt-0.5 font-mono text-sm text-slate-200">
                                            {formatTokens(
                                                data.total_assistant_messages,
                                            )}
                                        </p>
                                    </div>
                                    <div class="rounded-md border border-slate-800/60 bg-slate-950/40 px-2.5 py-2">
                                        <p class="text-[10px] uppercase text-slate-500">
                                            Models used
                                        </p>
                                        <p class="mt-0.5 font-mono text-sm text-slate-200">
                                            {data.distinct_models}
                                        </p>
                                    </div>
                                    <div class="rounded-md border border-slate-800/60 bg-slate-950/40 px-2.5 py-2">
                                        <p class="text-[10px] uppercase text-slate-500">
                                            Tokens (in / out)
                                        </p>
                                        <p class="mt-0.5 font-mono text-xs leading-snug text-slate-200">
                                            {formatTokens(
                                                data.total_prompt_tokens,
                                            )}{" "}
                                            /{" "}
                                            {formatTokens(
                                                data.total_completion_tokens,
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <ExpandableMetricList
                                    title="Recently used models"
                                    emptyHint="No model usage recorded yet."
                                    rows={data.recently_used ?? []}
                                    renderRow={(row) => (
                                        <>
                                            <span class="min-w-0 truncate font-mono text-[11px] text-slate-200">
                                                {row.model_id}
                                            </span>
                                            <span class="shrink-0 text-right text-[11px] text-slate-500">
                                                {formatLastUsed(
                                                    row.last_used_at,
                                                )}
                                            </span>
                                        </>
                                    )}
                                />
                                <ExpandableMetricList
                                    title="Most used models"
                                    emptyHint="No model usage recorded yet."
                                    rows={data.most_used ?? []}
                                    renderRow={(row) => (
                                        <>
                                            <span class="min-w-0 truncate font-mono text-[11px] text-slate-200">
                                                {row.model_id}
                                            </span>
                                            <span class="shrink-0 text-right font-mono text-[11px] text-slate-400">
                                                {row.use_count}{" "}
                                                <span class="text-slate-600">
                                                    turns
                                                </span>
                                            </span>
                                        </>
                                    )}
                                />
                                <ExpandableMetricList
                                    title="Highest average cost per turn (by model)"
                                    emptyHint="No assistant turns recorded yet."
                                    rows={data.most_expensive ?? []}
                                    renderRow={(row) => (
                                        <div class="flex min-w-0 flex-1 items-start justify-between gap-3">
                                            <span class="min-w-0 truncate font-mono text-[11px] text-slate-200">
                                                {row.model_id}
                                            </span>
                                            <div class="flex shrink-0 flex-col items-end gap-0.5 text-right">
                                                <span class="font-mono text-[11px] text-amber-200/90">
                                                    {formatUsd(
                                                        row.average_cost_usd ??
                                                            0,
                                                    )}{" "}
                                                    <span class="text-[10px] font-normal text-slate-500">
                                                        avg/turn
                                                    </span>
                                                </span>
                                                <span class="font-mono text-[10px] text-slate-500">
                                                    {row.use_count} turns ·{" "}
                                                    {formatUsd(
                                                        row.total_cost_usd,
                                                    )}{" "}
                                                    total
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                        );
                    }}
                </Show>
            </Show>
        </div>
    );
};

const ExpandableMetricList = <T,>(props: {
    title: string;
    emptyHint: string;
    rows: T[];
    renderRow: (row: T) => JSX.Element;
}) => {
    const [expanded, setExpanded] = createSignal(false);
    const rows = () => props.rows ?? [];
    const visible = () => {
        const r = rows();
        if (expanded() || r.length <= METRICS_PREVIEW) {
            return r;
        }
        return r.slice(0, METRICS_PREVIEW);
    };
    const rest = () => Math.max(0, rows().length - METRICS_PREVIEW);

    return (
        <div class="rounded-md border border-slate-800/50 bg-slate-950/30">
            <p class="border-b border-slate-800/40 px-2.5 py-1.5 text-[11px] font-medium text-slate-400">
                {props.title}
            </p>
            <Show
                when={rows().length > 0}
                fallback={
                    <p class="px-2.5 py-3 text-xs text-slate-500">
                        {props.emptyHint}
                    </p>
                }
            >
                <ul class="divide-y divide-slate-800/40">
                    {visible().map((row) => (
                        <li class="flex items-start justify-between gap-2 px-2.5 py-1.5">
                            {props.renderRow(row)}
                        </li>
                    ))}
                </ul>
                <Show when={rest() > 0 && !expanded()}>
                    <div class="border-t border-slate-800/40 px-2 py-1.5">
                        <button
                            type="button"
                            class="text-[11px] text-sky-400/90 hover:text-sky-300"
                            onClick={() => setExpanded(true)}
                        >
                            Show {rest()} more
                        </button>
                    </div>
                </Show>
                <Show when={rest() > 0 && expanded()}>
                    <div class="border-t border-slate-800/40 px-2 py-1.5">
                        <button
                            type="button"
                            class="text-[11px] text-slate-500 hover:text-slate-400"
                            onClick={() => setExpanded(false)}
                        >
                            Show less
                        </button>
                    </div>
                </Show>
            </Show>
        </div>
    );
};
