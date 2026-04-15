import type { Component } from "solid-js";
import { Show } from "solid-js";
import { cn } from "@/lib/utils";
import type { store } from "@wails/go/models";
import { UsageBarRow, UsageBarRowLoading } from "@/components/usage-bar-row";

function formatCompactTokens(n: number): string {
    if (!Number.isFinite(n) || n <= 0) return "0";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 10_000) return `${Math.round(n / 1000)}k`;
    return `${Math.round(n)}`;
}

const ClaudeLocalUsageDetails: Component<{
    usage: store.ClaudeLocalUsage;
    captionClass?: string;
    /** Hide the “no usage in transcripts” line (e.g. when auth is the active issue). */
    suppressEmptyUsageMessage?: boolean;
}> = (props) => {
    const u = () => props.usage;
    const summaryLine = () =>
        props.captionClass ?? "text-[9px] leading-snug text-slate-600";
    const emptyLine = () =>
        props.captionClass
            ? "text-xs leading-snug text-slate-600"
            : "text-[10px] leading-snug text-slate-600";
    return (
        <>
            <Show when={(u().total_tokens ?? 0) > 0}>
                <div class="space-y-2">
                    <UsageBarRow
                        label="Input"
                        value={u().input_percent_used}
                        fillClass="bg-orange-600/80"
                    />
                    <UsageBarRow
                        label="Output"
                        value={u().output_percent_used}
                        fillClass="bg-amber-600/70"
                    />
                    <p class={summaryLine()}>
                        Last {u().window_days}d ·{" "}
                        {formatCompactTokens(u().total_tokens)} tokens ·{" "}
                        {u().files_scanned} file
                        {u().files_scanned === 1 ? "" : "s"}
                    </p>
                    <Show when={u().scan_error}>
                        <p class="text-[9px] leading-snug text-amber-500/80">
                            {u().scan_error}
                        </p>
                    </Show>
                </div>
            </Show>
            <Show
                when={
                    (u().total_tokens ?? 0) <= 0 &&
                    !props.suppressEmptyUsageMessage
                }
            >
                <p class={emptyLine()}>
                    No assistant usage in recently touched transcript files
                    (last {u().window_days} days).
                </p>
            </Show>
        </>
    );
};

/** Input / output share of local JSONL token totals (Claude Code transcripts). */
export const ClaudeLocalUsageBars: Component<{
    loading: boolean;
    usage: store.ClaudeLocalUsage | undefined;
    usageError: string | undefined;
    /** Slightly larger caption in settings vs sidebar. */
    comfortableCaption?: boolean;
    /** When true, omit empty-state copy if totals are zero (auth/sign-in shown above). */
    suppressEmptyUsageMessage?: boolean;
    class?: string;
}> = (props) => {
    const captionClass = () =>
        props.comfortableCaption
            ? "text-xs leading-snug text-slate-500"
            : undefined;

    return (
        <div class={cn("space-y-2", props.class)}>
            <Show
                when={!props.loading}
                fallback={
                    <>
                        <UsageBarRowLoading
                            label="Input"
                            fillClass="bg-orange-600/75"
                        />
                        <UsageBarRowLoading
                            label="Output"
                            fillClass="bg-amber-600/65"
                        />
                    </>
                }
            >
                <Show when={props.usageError}>
                    <p class="text-[10px] leading-snug text-amber-500/85">
                        {props.usageError}
                    </p>
                </Show>
                <Show
                    when={
                        props.usage != null &&
                        (props.usageError == null || props.usageError === "")
                    }
                >
                    <ClaudeLocalUsageDetails
                        usage={props.usage!}
                        captionClass={captionClass()}
                        suppressEmptyUsageMessage={
                            props.suppressEmptyUsageMessage
                        }
                    />
                </Show>
            </Show>
        </div>
    );
};
