import type { Component } from "solid-js";
import { Show } from "solid-js";
import { ExpandableMetricList } from "@/components/settings/expandable-metric-list";
import { useOpenRouterUsageMetrics } from "@/hooks/use-openrouter-usage-metrics";
import {
    formatLastUsed,
    formatTokens,
    formatUsd,
} from "@/lib/openrouter-metrics-format";

export const OpenRouterUsageMetricsPanel: Component = () => {
    const metricsQuery = useOpenRouterUsageMetrics();

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
