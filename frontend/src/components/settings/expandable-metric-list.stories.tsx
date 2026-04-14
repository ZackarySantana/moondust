import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { store } from "@wails/go/models";
import { formatLastUsed, formatUsd } from "@/lib/openrouter-metrics-format";
import { ExpandableMetricList } from "./expandable-metric-list";

/** Plain objects / ISO strings only — `createFrom` must not receive JS `Date` for `last_used_at` (Wails `convertValues(..., null)` treats objects as nested models and throws). */
function usage(overrides: Partial<store.OpenRouterModelUsage> = {}) {
    return store.OpenRouterModelUsage.createFrom({
        model_id: "anthropic/claude-3.5-sonnet",
        last_used_at: "2026-04-01T12:00:00.000Z",
        use_count: 12,
        total_cost_usd: 2.5,
        average_cost_usd: 0.08,
        total_prompt_tokens: 8000,
        total_completion_tokens: 2000,
        ...overrides,
    });
}

const manyModels = Array.from({ length: 8 }, (_, i) =>
    usage({
        model_id: `vendor/model-${i + 1}`,
        use_count: 100 - i * 10,
        last_used_at: new Date(2026, 3, 14 - i).toISOString(),
    }),
);

const meta = {
    title: "Settings/ExpandableMetricList",
    component: ExpandableMetricList,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof ExpandableMetricList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
    args: {
        title: "Recently used models",
        emptyHint: "No model usage recorded yet.",
        rows: [],
        renderRow: () => null,
    },
};

export const RecentlyUsed: Story = {
    args: {
        title: "Recently used models",
        emptyHint: "No model usage recorded yet.",
        rows: [
            usage({ model_id: "openai/gpt-4o" }),
            usage({
                model_id: "anthropic/claude-3.5-sonnet",
                last_used_at: "2026-04-10T09:30:00.000Z",
            }),
        ],
        renderRow: (row: store.OpenRouterModelUsage) => (
            <>
                <span class="min-w-0 truncate font-mono text-[11px] text-slate-200">
                    {row.model_id}
                </span>
                <span class="shrink-0 text-right text-[11px] text-slate-500">
                    {formatLastUsed(row.last_used_at)}
                </span>
            </>
        ),
    },
};

export const ExpandableManyRows: Story = {
    args: {
        title: "Most used models",
        emptyHint: "No model usage recorded yet.",
        rows: manyModels,
        renderRow: (row: store.OpenRouterModelUsage) => (
            <>
                <span class="min-w-0 truncate font-mono text-[11px] text-slate-200">
                    {row.model_id}
                </span>
                <span class="shrink-0 text-right font-mono text-[11px] text-slate-400">
                    {row.use_count} <span class="text-slate-600">turns</span>
                </span>
            </>
        ),
    },
};

export const CostBreakdown: Story = {
    args: {
        title: "Highest average cost per turn",
        emptyHint: "No assistant turns recorded yet.",
        rows: [
            usage({
                model_id: "expensive/premium",
                average_cost_usd: 0.42,
                total_cost_usd: 12.4,
                use_count: 30,
            }),
            usage({
                model_id: "mid/standard",
                average_cost_usd: 0.06,
                total_cost_usd: 1.2,
                use_count: 20,
            }),
        ],
        renderRow: (row: store.OpenRouterModelUsage) => (
            <div class="flex min-w-0 flex-1 items-start justify-between gap-3">
                <span class="min-w-0 truncate font-mono text-[11px] text-slate-200">
                    {row.model_id}
                </span>
                <div class="flex shrink-0 flex-col items-end gap-0.5 text-right">
                    <span class="font-mono text-[11px] text-amber-200/90">
                        {formatUsd(row.average_cost_usd ?? 0)}{" "}
                        <span class="text-[10px] font-normal text-slate-500">
                            avg/turn
                        </span>
                    </span>
                    <span class="font-mono text-[10px] text-slate-500">
                        {row.use_count} turns · {formatUsd(row.total_cost_usd)}{" "}
                        total
                    </span>
                </div>
            </div>
        ),
    },
};
