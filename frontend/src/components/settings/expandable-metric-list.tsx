import type { JSX } from "solid-js";
import { createSignal, Show } from "solid-js";
import { METRICS_PREVIEW } from "@/lib/openrouter-metrics-format";
import type { store } from "@wails/go/models";

export function ExpandableMetricList(props: {
    title: string;
    emptyHint: string;
    rows: store.OpenRouterModelUsage[];
    renderRow: (row: store.OpenRouterModelUsage) => JSX.Element;
}) {
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
}
