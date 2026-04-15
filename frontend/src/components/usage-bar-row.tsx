import type { Component } from "solid-js";

export function clampUsagePct(n: number | undefined): number {
    if (n == null || !Number.isFinite(n)) return 0;
    return Math.min(100, Math.max(0, n));
}

export function formatUsagePct(n: number | undefined): string {
    if (n == null || !Number.isFinite(n)) return "—";
    return `${n.toFixed(1)}%`;
}

/** Horizontal usage bar with label and percentage. */
export const UsageBarRow: Component<{
    label: string;
    value: number | undefined;
    fillClass: string;
}> = (props) => {
    const w = () => clampUsagePct(props.value);
    return (
        <div class="min-w-0">
            <div class="mb-0.5 flex items-baseline justify-between gap-1 text-[10px] leading-none text-slate-500">
                <span class="min-w-0 truncate">{props.label}</span>
                <span class="shrink-0 tabular-nums text-slate-400">
                    {formatUsagePct(props.value)}
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

/** Same layout as {@link UsageBarRow}; indeterminate sliding segment. */
export const UsageBarRowLoading: Component<{
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
