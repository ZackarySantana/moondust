import ExternalLink from "lucide-solid/icons/external-link";
import type { Component } from "solid-js";
import { Show } from "solid-js";
import { ExternalAnchor } from "@/components/external-anchor";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/settings-form";
import { useCursorCliInfo } from "@/hooks/use-cursor-cli-info";

const CURSOR_INSTALL_URL = "https://cursor.com/install";
const CURSOR_DASHBOARD_URL = "https://cursor.com/dashboard";

function formatCursorPct(n: number | undefined): string {
    if (n === undefined || !Number.isFinite(n)) {
        return "—";
    }
    return `${n.toFixed(1)}%`;
}

export const CursorCliSettingsTab: Component = () => {
    const { cursorQuery, refresh } = useCursorCliInfo();

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
                <ExternalAnchor
                    href={CURSOR_INSTALL_URL}
                    class="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
                >
                    Install Cursor CLI
                    <ExternalLink
                        class="size-3"
                        stroke-width={2}
                        aria-hidden
                    />
                </ExternalAnchor>
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
                                            Three numbers:{" "}
                                            <span class="font-medium text-slate-500">
                                                Composer (auto)
                                            </span>{" "}
                                            and{" "}
                                            <span class="font-medium text-slate-500">
                                                API
                                            </span>{" "}
                                            are the split Cursor reports for
                                            agent routing vs API models;{" "}
                                            <span class="font-medium text-slate-500">
                                                Total
                                            </span>{" "}
                                            is overall included usage (all
                                            buckets). Same fields as{" "}
                                            <code class="rounded bg-slate-900/80 px-1 py-0.5 text-[10px]">
                                                /usage
                                            </code>{" "}
                                            in the agent. From Cursor’s
                                            dashboard API; details also on{" "}
                                            <ExternalAnchor
                                                href={CURSOR_DASHBOARD_URL}
                                                class="text-emerald-400/95 hover:underline"
                                            >
                                                cursor.com/dashboard
                                            </ExternalAnchor>
                                            .
                                        </p>
                                        {info().usage_error ? (
                                            <p class="rounded-md border border-amber-800/40 bg-amber-950/25 px-2.5 py-2 text-xs text-amber-100/90">
                                                {info().usage_error}
                                            </p>
                                        ) : (
                                            <Show when={info().usage}>
                                                <div class="grid gap-2 sm:grid-cols-3">
                                                    <div class="rounded-md border border-slate-800/60 bg-slate-950/40 p-2.5">
                                                        <p class="text-[11px] font-medium text-slate-500">
                                                            Composer (auto)
                                                        </p>
                                                        <p class="text-[10px] text-slate-600">
                                                            Auto / agent routing
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
                                                        <p class="text-[10px] text-slate-600">
                                                            Named / API models
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
                                                    <div class="rounded-md border border-slate-800/50 bg-slate-950/30 p-2.5 sm:min-h-0">
                                                        <p class="text-[11px] font-medium text-slate-500">
                                                            Total
                                                        </p>
                                                        <p class="text-[10px] text-slate-600">
                                                            All included usage
                                                        </p>
                                                        <p class="mt-1 font-mono text-lg text-slate-200 tabular-nums">
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
