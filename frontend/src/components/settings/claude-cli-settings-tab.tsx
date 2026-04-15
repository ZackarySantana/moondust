import ExternalLink from "lucide-solid/icons/external-link";
import type { Component } from "solid-js";
import { Show } from "solid-js";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/settings-form";
import { useClaudeCliInfo } from "@/hooks/use-claude-cli-info";

const CLAUDE_CODE_DOCS = "https://docs.anthropic.com/en/docs/claude-code/setup";

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
                            </div>
                        );
                    }}
                </Show>
            </Show>
        </Section>
    );
};
