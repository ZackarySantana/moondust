import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { store } from "@wails/go/models";
import { queryKeys } from "@/lib/query-client";
import { OpenRouterUsageMetricsPanel } from "./openrouter-usage-metrics-panel";

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

function withMetrics(data: store.OpenRouterUsageMetrics) {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.openRouterUsageMetrics, data);
    return (
        <QueryClientProvider client={qc}>
            <div class="max-w-4xl rounded-lg border border-slate-800/50 bg-slate-950/20 p-4">
                <OpenRouterUsageMetricsPanel />
            </div>
        </QueryClientProvider>
    );
}

const meta = {
    title: "Settings/OpenRouterUsageMetricsPanel",
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
    render: () =>
        withMetrics(
            store.OpenRouterUsageMetrics.createFrom({
                total_assistant_messages: 42,
                distinct_models: 3,
                total_cost_usd: 12.34,
                average_cost_per_assistant_turn_usd: 0.29,
                total_prompt_tokens: 100_000,
                total_completion_tokens: 50_000,
                recently_used: [
                    usage({ model_id: "openai/gpt-4o" }),
                    usage({
                        model_id: "anthropic/claude-3.5-sonnet",
                        last_used_at: "2026-04-10T09:30:00.000Z",
                    }),
                ],
                most_used: [
                    usage({
                        model_id: "anthropic/claude-3.5-sonnet",
                        use_count: 24,
                    }),
                ],
                most_expensive: [
                    usage({
                        model_id: "anthropic/claude-opus-4.6",
                        average_cost_usd: 0.45,
                        total_cost_usd: 9,
                        use_count: 4,
                    }),
                ],
            }),
        ),
};

export const EmptyLists: Story = {
    render: () =>
        withMetrics(
            store.OpenRouterUsageMetrics.createFrom({
                total_assistant_messages: 0,
                distinct_models: 0,
                total_cost_usd: 0,
                average_cost_per_assistant_turn_usd: 0,
                total_prompt_tokens: 0,
                total_completion_tokens: 0,
                recently_used: [],
                most_used: [],
                most_expensive: [],
            }),
        ),
};
