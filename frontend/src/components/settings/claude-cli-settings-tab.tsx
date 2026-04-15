import ExternalLink from "lucide-solid/icons/external-link";
import type { Component } from "solid-js";
import { Show } from "solid-js";
import { ClaudeLocalUsageBars } from "@/components/claude-local-usage-bars";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/settings-form";
import { useClaudeCliInfo } from "@/hooks/use-claude-cli-info";
import {
    ANTHROPIC_CONSOLE_URL,
    formatClaudeAccountLine,
    formatClaudeSubscriptionLabel,
} from "@/lib/claude-auth-display";

const CLAUDE_CODE_DOCS = "https://docs.anthropic.com/en/docs/claude-code/setup";

function formatLabelOrDash(s: string | undefined): string {
    const t = s?.trim();
    return t ? t : "—";
}

export const ClaudeCliSettingsTab: Component = () => {
    const { claudeQuery, refresh } = useClaudeCliInfo();

    return (
        <Section
            title="Claude Code"
            description="Moondust uses the Claude Code CLI (`claude`) when it is on your PATH. Install from Anthropic’s docs, then use Refresh if you add it without restarting this app."
        >
            <div class="flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={claudeQuery.isFetching}
                    onClick={() => refresh()}
                >
                    {claudeQuery.isFetching ? "Refreshing…" : "Refresh"}
                </Button>
                <a
                    href={CLAUDE_CODE_DOCS}
                    target="_blank"
                    rel="noreferrer"
                    class="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
                >
                    Claude Code setup
                    <ExternalLink
                        class="size-3"
                        stroke-width={2}
                        aria-hidden
                    />
                </a>
                <a
                    href={ANTHROPIC_CONSOLE_URL}
                    target="_blank"
                    rel="noreferrer"
                    class="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
                >
                    Anthropic console
                    <ExternalLink
                        class="size-3"
                        stroke-width={2}
                        aria-hidden
                    />
                </a>
            </div>

            <Show
                when={!claudeQuery.isLoading}
                fallback={
                    <p class="text-sm text-slate-500">Checking for `claude`…</p>
                }
            >
                <Show
                    when={claudeQuery.data}
                    fallback={
                        <p class="text-sm text-red-400/90">
                            {claudeQuery.error instanceof Error
                                ? claudeQuery.error.message
                                : "Could not load Claude CLI info."}
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
                                                "Claude Code CLI (`claude`) not found on PATH."}
                                        </p>
                                    }
                                >
                                    <div class="space-y-1 rounded-md border border-emerald-800/35 bg-emerald-950/20 px-2.5 py-2 text-xs text-emerald-100/90">
                                        <p>
                                            Claude Code CLI (
                                            <code class="text-emerald-200/95">
                                                claude
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
                                <Show
                                    when={
                                        info().probe_error && info().installed
                                    }
                                >
                                    <p class="text-xs text-amber-200/80">
                                        {info().probe_error}
                                    </p>
                                </Show>

                                <Show when={info().installed}>
                                    <div class="space-y-2">
                                        <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                            Authentication
                                        </p>
                                        <p class="text-xs text-slate-600">
                                            Data comes from{" "}
                                            <code class="rounded bg-slate-900/80 px-1 py-0.5 text-[10px]">
                                                claude auth status --json
                                            </code>
                                            . The Claude CLI does not report
                                            subscription usage or limits (no
                                            equivalent to Cursor’s{" "}
                                            <code class="rounded bg-slate-900/80 px-1 py-0.5 text-[10px]">
                                                /usage
                                            </code>
                                            ); open the{" "}
                                            <a
                                                href={ANTHROPIC_CONSOLE_URL}
                                                target="_blank"
                                                rel="noreferrer"
                                                class="text-emerald-400/95 underline-offset-2 hover:underline"
                                            >
                                                Anthropic console
                                            </a>{" "}
                                            for usage, quotas, and billing.
                                        </p>
                                        <Show when={info().auth_error}>
                                            <p class="rounded-md border border-amber-800/40 bg-amber-950/25 px-2.5 py-2 text-xs text-amber-100/90">
                                                {info().auth_error}
                                            </p>
                                        </Show>
                                        <Show when={info().auth}>
                                            {(auth) => (
                                                <div class="grid gap-2 sm:grid-cols-2">
                                                    <div class="rounded-md border border-slate-800/60 bg-slate-950/40 p-2.5">
                                                        <p class="text-[11px] font-medium text-slate-500">
                                                            Subscription
                                                        </p>
                                                        <p class="mt-1 font-mono text-lg text-slate-200 tabular-nums">
                                                            {formatClaudeSubscriptionLabel(
                                                                auth()
                                                                    .subscription_type,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div class="rounded-md border border-slate-800/60 bg-slate-950/40 p-2.5">
                                                        <p class="text-[11px] font-medium text-slate-500">
                                                            Account
                                                        </p>
                                                        <p class="mt-1 wrap-break-word font-mono text-sm leading-snug text-slate-200">
                                                            {formatClaudeAccountLine(
                                                                auth(),
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div class="rounded-md border border-slate-800/60 bg-slate-950/40 p-2.5">
                                                        <p class="text-[11px] font-medium text-slate-500">
                                                            Auth method
                                                        </p>
                                                        <p class="mt-1 font-mono text-sm text-slate-200">
                                                            {formatLabelOrDash(
                                                                auth()
                                                                    .auth_method,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div class="rounded-md border border-slate-800/60 bg-slate-950/40 p-2.5">
                                                        <p class="text-[11px] font-medium text-slate-500">
                                                            API provider
                                                        </p>
                                                        <p class="mt-1 font-mono text-sm text-slate-200">
                                                            {formatLabelOrDash(
                                                                auth()
                                                                    .api_provider,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <Show
                                                        when={auth().org_name?.trim()}
                                                    >
                                                        <div class="rounded-md border border-slate-800/60 bg-slate-950/40 p-2.5 sm:col-span-2">
                                                            <p class="text-[11px] font-medium text-slate-500">
                                                                Organization
                                                            </p>
                                                            <p class="mt-1 wrap-break-word font-mono text-sm leading-snug text-slate-200">
                                                                {
                                                                    auth()
                                                                        .org_name
                                                                }
                                                            </p>
                                                        </div>
                                                    </Show>
                                                </div>
                                            )}
                                        </Show>
                                    </div>
                                </Show>

                                <div class="space-y-3 border-t border-slate-800/40 pt-3">
                                    <div>
                                        <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                            Local transcript usage
                                        </p>
                                        <p class="mt-1.5 text-xs leading-relaxed text-slate-600">
                                            Moondust scans Claude Code JSONL
                                            transcripts under{" "}
                                            <code class="rounded bg-slate-900/80 px-1 py-0.5 text-[10px]">
                                                ~/.claude/projects
                                            </code>{" "}
                                            (and{" "}
                                            <code class="rounded bg-slate-900/80 px-1 py-0.5 text-[10px]">
                                                ~/.config/claude/projects
                                            </code>
                                            ), counting assistant lines with
                                            token usage from files touched in
                                            the last 7 days. Bars show the
                                            input vs output share of those
                                            totals. This reflects activity on
                                            this machine, not subscription
                                            billing.
                                        </p>
                                    </div>
                                    <div class="max-w-xl rounded-lg border border-slate-800/55 bg-slate-950/35 p-3.5 sm:p-4">
                                        <ClaudeLocalUsageBars
                                            loading={false}
                                            usage={info().local_usage}
                                            usageError={info().local_usage_error}
                                            comfortableCaption
                                        />
                                        <Show when={info().local_usage}>
                                            {(lu) => (
                                                <dl class="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-slate-800/45 pt-4 text-xs">
                                                    <dt class="text-slate-500">
                                                        Total tokens
                                                    </dt>
                                                    <dd class="text-right font-mono text-slate-200 tabular-nums">
                                                        {lu().total_tokens.toLocaleString()}
                                                    </dd>
                                                    <dt class="text-slate-500">
                                                        Files scanned
                                                    </dt>
                                                    <dd class="text-right font-mono text-slate-200 tabular-nums">
                                                        {lu().files_scanned}
                                                    </dd>
                                                    <dt class="text-slate-500">
                                                        Lines matched
                                                    </dt>
                                                    <dd class="text-right font-mono text-slate-200 tabular-nums">
                                                        {lu().lines_matched.toLocaleString()}
                                                    </dd>
                                                </dl>
                                            )}
                                        </Show>
                                    </div>
                                </div>
                            </div>
                        );
                    }}
                </Show>
            </Show>
        </Section>
    );
};
