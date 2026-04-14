import { useQuery } from "@tanstack/solid-query";
import ChevronDown from "lucide-solid/icons/chevron-down";
import type { Accessor, Component, JSX } from "solid-js";
import { createSignal, Show } from "solid-js";
import { GetCursorCLIInfo } from "@wails/go/app/App";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/lib/query-client";
import type { store } from "@wails/go/models";

/** Placeholder until Anthropic usage is wired (single bar). */
const FAKE_CLAUDE_INCLUDED_PCT = 36.5;

function clampPct(n: number | undefined): number {
    if (n == null || !Number.isFinite(n)) return 0;
    return Math.min(100, Math.max(0, n));
}

function formatPct(n: number | undefined): string {
    if (n == null || !Number.isFinite(n)) return "—";
    return `${n.toFixed(1)}%`;
}

const Bar: Component<{
    label: string;
    value: number | undefined;
    fillClass: string;
}> = (props) => {
    const w = () => clampPct(props.value);
    return (
        <div class="min-w-0">
            <div class="mb-0.5 flex items-baseline justify-between gap-1 text-[10px] leading-none text-slate-500">
                <span class="min-w-0 truncate">{props.label}</span>
                <span class="shrink-0 tabular-nums text-slate-400">
                    {formatPct(props.value)}
                </span>
            </div>
            <div
                class="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/90 ring-1 ring-slate-800/60"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(w())}
                aria-label={`${props.label} usage`}
            >
                <div
                    class={`h-full max-w-full rounded-full transition-[width] duration-300 ease-out ${props.fillClass}`}
                    style={{ width: `${w()}%` }}
                />
            </div>
        </div>
    );
};

/** Same row layout as {@link Bar}; track shows an indeterminate sliding segment. */
const LoadingBarRow: Component<{
    label: string;
    fillClass: string;
}> = (props) => {
    return (
        <div class="min-w-0">
            <div class="mb-0.5 flex items-baseline justify-between gap-1 text-[10px] leading-none text-slate-500">
                <span class="min-w-0 truncate">{props.label}</span>
                <span class="shrink-0 tabular-nums text-slate-500">—</span>
            </div>
            <div
                class="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-800/90 ring-1 ring-slate-800/60"
                role="progressbar"
                aria-busy="true"
                aria-valuetext="Loading"
                aria-label={`${props.label} usage loading`}
            >
                <div
                    class={`absolute inset-y-0 left-0 w-[38%] rounded-full ${props.fillClass} animate-usage-bar`}
                />
            </div>
        </div>
    );
};

const CursorSection: Component<{
    usage: store.CursorUsageSnapshot | undefined;
    loading: boolean;
}> = (props) => {
    return (
        <div class="space-y-2">
            <Show
                when={!props.loading}
                fallback={
                    <>
                        <LoadingBarRow
                            label="Auto"
                            fillClass="bg-emerald-600/80"
                        />
                        <LoadingBarRow
                            label="API"
                            fillClass="bg-sky-600/75"
                        />
                    </>
                }
            >
                <>
                    <Bar
                        label="Auto"
                        value={props.usage?.auto_percent_used}
                        fillClass="bg-emerald-600/80"
                    />
                    <Bar
                        label="API"
                        value={props.usage?.api_percent_used}
                        fillClass="bg-sky-600/75"
                    />
                </>
            </Show>
        </div>
    );
};

const ClaudePlaceholderSection: Component = () => {
    return (
        <div class="space-y-2">
            <Bar
                label="Included"
                value={FAKE_CLAUDE_INCLUDED_PCT}
                fillClass="bg-amber-600/70"
            />
        </div>
    );
};

const ghostToggleClass =
    "flex w-full cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-left text-[10px] font-medium uppercase tracking-wide text-slate-500/85 transition-colors hover:bg-slate-800/35 hover:text-slate-400";

const CollapsibleUsageSection: Component<{
    title: string;
    expanded: Accessor<boolean>;
    onToggle: () => void;
    sectionClass?: string;
    children: JSX.Element;
}> = (props) => {
    return (
        <div class={cn("space-y-0", props.sectionClass)}>
            <button
                type="button"
                class={ghostToggleClass}
                aria-expanded={props.expanded()}
                aria-controls={`usage-section-${props.title.toLowerCase()}`}
                id={`usage-toggle-${props.title.toLowerCase()}`}
                onClick={() => props.onToggle()}
            >
                <ChevronDown
                    class={cn(
                        "size-3 shrink-0 text-slate-500 transition-transform duration-150",
                        !props.expanded() && "-rotate-90",
                    )}
                    stroke-width={2}
                    aria-hidden
                />
                <span>{props.title}</span>
            </button>
            <Show when={props.expanded()}>
                <div
                    id={`usage-section-${props.title.toLowerCase()}`}
                    class="mt-1.5 space-y-2"
                    role="region"
                    aria-labelledby={`usage-toggle-${props.title.toLowerCase()}`}
                >
                    {props.children}
                </div>
            </Show>
        </div>
    );
};

/** In-flow footer block: Cursor (live) + Claude (placeholder). Replaces the old Usage row. */
export const SidebarProviderUsage: Component = () => {
    const [cursorOpen, setCursorOpen] = createSignal(true);
    const [claudeOpen, setClaudeOpen] = createSignal(true);

    const cursorCliQuery = useQuery(() => ({
        queryKey: queryKeys.cursorCLI,
        queryFn: GetCursorCLIInfo,
        staleTime: 60_000,
    }));

    const usageLoading = () => cursorCliQuery.isLoading && !cursorCliQuery.data;

    /** Probe finished: hide the whole block when `agent` is not on PATH. */
    const hideBecauseCliMissing = () =>
        !cursorCliQuery.isLoading &&
        cursorCliQuery.data != null &&
        cursorCliQuery.data.installed === false;

    return (
        <Show when={!hideBecauseCliMissing()}>
            <div
                class="space-y-1.5 px-1"
                aria-label="Provider usage"
                aria-busy={usageLoading()}
            >
                <CollapsibleUsageSection
                    title="Cursor"
                    expanded={cursorOpen}
                    onToggle={() => setCursorOpen((v) => !v)}
                >
                    <CursorSection
                        usage={cursorCliQuery.data?.usage}
                        loading={usageLoading()}
                    />
                    <Show when={cursorCliQuery.data?.usage_error}>
                        <p class="text-[10px] leading-snug text-amber-500/85">
                            {cursorCliQuery.data?.usage_error}
                        </p>
                    </Show>
                </CollapsibleUsageSection>

                <CollapsibleUsageSection
                    title="Claude"
                    expanded={claudeOpen}
                    onToggle={() => setClaudeOpen((v) => !v)}
                    sectionClass="mt-3 border-t border-slate-800/50 pt-3"
                >
                    <ClaudePlaceholderSection />
                </CollapsibleUsageSection>
            </div>
        </Show>
    );
};
