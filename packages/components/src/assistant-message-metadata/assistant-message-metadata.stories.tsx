import type { JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import {
    AssistantMessageMetadataButton,
    MetadataPopoverPanel,
    type MetadataSection,
} from "./assistant-message-metadata";
import { AssistantMessageForkButton } from "../assistant-message-fork-button/assistant-message-fork-button";

const meta = {
    title: "Chat/AssistantMessageMetadataButton",
    component: AssistantMessageMetadataButton,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof AssistantMessageMetadataButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = (props: { children: JSX.Element; label?: string }) => (
    <div class="min-w-3xl bg-void-950 p-10">
        {props.label && (
            <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                {props.label}
            </p>
        )}
        <div class="space-y-6">{props.children}</div>
    </div>
);

const Row = (props: { label: string; children: JSX.Element }) => (
    <div class="grid grid-cols-[160px_1fr] items-start gap-6 border-l-2 border-void-700 pl-4">
        <span class="pt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
            {props.label}
        </span>
        <div>{props.children}</div>
    </div>
);

const OPENROUTER_FULL: MetadataSection[] = [
    {
        heading: "OpenRouter",
        subheading: "anthropic/claude-3.5-sonnet",
        hero: { label: "Total cost", value: "$0.0124" },
        pills: [
            { label: "Input", value: "1,420" },
            { label: "Output", value: "382" },
            { label: "Cache R", value: "0" },
            { label: "Cache W", value: "0" },
        ],
        rows: [
            { label: "Native finish", value: "stop" },
            { label: "Latency", value: "1.83s" },
        ],
        requestId: "or_01HX12345ABC67890XYZ",
        footnote: "Reported by OpenRouter generation API",
    },
];

const CLAUDE_API: MetadataSection[] = [
    {
        heading: "Claude API",
        subheading: "claude-3-5-sonnet-20241022",
        hero: { label: "Total cost", value: "$0.0089" },
        pills: [
            { label: "Input", value: "983" },
            { label: "Output", value: "421" },
            { label: "Cache R", value: "12,840" },
            { label: "Cache W", value: "0" },
        ],
        rows: [
            { label: "Stop reason", value: "end_turn" },
            { label: "Latency", value: "0.94s" },
        ],
        requestId: "msg_01H3X4Y5Z6ABC1234",
    },
];

const MULTI_SECTION: MetadataSection[] = [
    ...OPENROUTER_FULL,
    {
        heading: "Tool calls",
        rows: [
            { label: "shell", value: "3" },
            { label: "read_file", value: "5" },
            { label: "write_file", value: "1" },
        ],
    },
];

export const Playground: Story = {
    args: {
        sections: OPENROUTER_FULL,
        summary: "$0.0124",
    },
};

export const Default: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame label="default — open the popover by clicking the trigger">
            <Row label="icon only">
                <div class="flex items-center gap-3">
                    <AssistantMessageMetadataButton
                        sections={OPENROUTER_FULL}
                    />
                    <span class="text-xs text-void-400">
                        Bare info icon. Use when space is tight.
                    </span>
                </div>
            </Row>
            <Row label="icon + summary">
                <div class="flex items-center gap-3">
                    <AssistantMessageMetadataButton
                        sections={OPENROUTER_FULL}
                        summary="$0.0124"
                    />
                    <span class="text-xs text-void-400">
                        Inline cost (or any short summary) next to the icon.
                        Recommended default since cost is the headline.
                    </span>
                </div>
            </Row>
            <Row label="alternate summary">
                <div class="flex items-center gap-3">
                    <AssistantMessageMetadataButton
                        sections={OPENROUTER_FULL}
                        summary="1.8k tok"
                    />
                    <span class="text-xs text-void-400">
                        Pass any short string. Tokens, latency, cache rate.
                    </span>
                </div>
            </Row>
        </Frame>
    ),
};

export const DataShapes: Story = {
    parameters: { layout: "fullscreen" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-5xl">
                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    data shapes — every section is rendered with its popover
                    forced open
                </p>
                <h2 class="mt-1 text-xl font-semibold text-void-50">
                    Graceful degradation
                </h2>
                <p class="mt-1 max-w-prose text-sm text-void-400">
                    Each block is the popover from a different data shape.
                    Hero, pills, rows, request id and footnote are all
                    optional and simply drop out when missing.
                </p>

                <div class="mt-8 grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
                    <Demo
                        title="Full"
                        note="Hero + 4 pills + rows + request id + footnote. The canonical OpenRouter shape."
                        sections={OPENROUTER_FULL}
                    />
                    <Demo
                        title="Hero + pills + rows"
                        note="No request id or footnote. Same shape as above, just trimmed."
                        sections={[
                            {
                                ...OPENROUTER_FULL[0],
                                requestId: undefined,
                                footnote: undefined,
                            },
                        ]}
                    />
                    <Demo
                        title="Hero only"
                        note="Provider exposes cost but no token breakdown or rows. Header + nothing else."
                        sections={[
                            {
                                heading: "Cursor",
                                subheading: "claude-3.5-sonnet",
                                hero: {
                                    label: "Total cost",
                                    value: "$0.0064",
                                },
                                requestId: "csr_01HX9F8E7D6C5B4A",
                            },
                        ]}
                    />
                    <Demo
                        title="No hero — header fallback"
                        note="Local model with no cost concept. Header collapses to a name + model id."
                        sections={[
                            {
                                heading: "Local model",
                                subheading: "llama-3.1-8b-instruct",
                                rows: [
                                    {
                                        label: "Backend",
                                        value: "ollama",
                                    },
                                    { label: "Latency", value: "240ms" },
                                    {
                                        label: "Stop reason",
                                        value: "stop",
                                    },
                                ],
                            },
                        ]}
                    />
                    <Demo
                        title="Hero + pills (no rows)"
                        note="Token counts and cost without runtime metadata."
                        sections={[
                            {
                                heading: "OpenRouter",
                                subheading: "openai/gpt-4o",
                                hero: {
                                    label: "Total cost",
                                    value: "$0.0042",
                                },
                                pills: [
                                    { label: "Input", value: "612" },
                                    { label: "Output", value: "204" },
                                ],
                            },
                        ]}
                    />
                    <Demo
                        title="3-up pills"
                        note="The strip is 1, 2, 3 or 4 columns based on pill count. 5+ wraps to a second row."
                        sections={[
                            {
                                heading: "Anthropic",
                                subheading: "claude-3-opus",
                                hero: {
                                    label: "Total cost",
                                    value: "$0.0316",
                                },
                                pills: [
                                    { label: "Input", value: "1,420" },
                                    { label: "Output", value: "382" },
                                    { label: "Cache R", value: "8,200" },
                                ],
                            },
                        ]}
                    />
                    <Demo
                        title="Big numbers"
                        note="Wide values truncate with the full value in the tooltip. tabular-nums keeps columns aligned."
                        sections={CLAUDE_API}
                    />
                    <Demo
                        title="Multi-section"
                        note="Sections stack with a stronger 2px divider. Each renders its own header treatment."
                        sections={MULTI_SECTION}
                    />
                    <Demo
                        title="Just rows"
                        note="No hero, no pills. The minimum viable popover."
                        sections={[
                            {
                                heading: "Local",
                                rows: [
                                    {
                                        label: "Model",
                                        value: "llama-3.1-8b",
                                    },
                                    { label: "Latency", value: "240ms" },
                                ],
                            },
                        ]}
                    />
                </div>
            </div>
        </div>
    ),
};

const Demo = (props: {
    title: string;
    note: string;
    sections: MetadataSection[];
}) => (
    <div class="flex flex-col gap-3">
        <div>
            <p class="text-sm font-medium text-void-100">{props.title}</p>
            <p class="mt-1 text-[11px] leading-relaxed text-void-400">
                {props.note}
            </p>
        </div>
        <MetadataPopoverPanel
            sections={props.sections}
            class="w-72 self-start shadow-2xl shadow-black/50"
        />
    </div>
);

export const Anatomy: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-md">
                <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    anatomy — popover unfurled
                </p>
                <div class="grid grid-cols-[1fr_auto] items-start gap-6">
                    <div class="w-72 shadow-2xl shadow-black/60">
                        <div class="rounded-none border border-void-700 bg-void-900">
                            <header class="bg-void-850 px-3.5 py-2.5">
                                <p class="text-[10px] font-medium uppercase tracking-[0.14em] text-void-400">
                                    Total cost
                                </p>
                                <p class="mt-0.5 font-mono text-2xl font-semibold tabular-nums leading-none text-starlight-300">
                                    $0.0124
                                </p>
                                <p class="mt-2 text-[11px] text-void-400">
                                    OpenRouter ·{" "}
                                    <code class="font-mono text-nebula-300">
                                        claude-3.5-sonnet
                                    </code>
                                </p>
                            </header>
                        </div>
                    </div>
                    <ul class="space-y-2 text-[11px] leading-relaxed text-void-300">
                        <li>
                            <span class="text-void-500">label · </span>
                            10px uppercase tracked
                        </li>
                        <li>
                            <span class="text-void-500">value · </span>
                            2xl mono semibold starlight
                        </li>
                        <li>
                            <span class="text-void-500">
                                provider · model ·{" "}
                            </span>
                            11px void-400, model is mono nebula
                        </li>
                        <li>
                            <span class="text-void-500">surface · </span>
                            void-850, one shade lighter than the body
                        </li>
                    </ul>
                </div>
                <p class="mt-6 text-xs text-void-500">
                    The hero is the only required-feeling block. Everything
                    below it (pills, rows, request id, footnote) is optional
                    and falls away cleanly when not provided.
                </p>
            </div>
        </div>
    ),
};

export const InContext: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-2xl">
                <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    in context — assistant message footer with cost summary
                </p>
                <article class="border border-void-700 bg-void-900">
                    <div class="flex items-center justify-between border-b border-void-700 px-4 py-2">
                        <div class="flex items-center gap-2">
                            <span class="size-1.5 bg-starlight-400" />
                            <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-400">
                                assistant
                            </span>
                            <code class="font-mono text-[11px] text-nebula-300">
                                claude-3.5-sonnet
                            </code>
                        </div>
                        <div class="flex items-center gap-0.5">
                            <AssistantMessageMetadataButton
                                sections={OPENROUTER_FULL}
                                summary="$0.0124"
                            />
                            <AssistantMessageForkButton
                                onFork={() =>
                                    new Promise((r) => setTimeout(r, 500))
                                }
                            />
                        </div>
                    </div>
                    <div class="space-y-3 p-4 text-sm leading-relaxed text-void-200">
                        <p>
                            Sure. Here's the refactor split into two
                            commits:
                        </p>
                        <ul class="ml-4 list-disc text-void-300 marker:text-void-600">
                            <li>
                                <code class="text-[12px] text-nebula-300">
                                    refactor/router
                                </code>
                                : extract the route-loading logic into a hook.
                            </li>
                            <li>
                                <code class="text-[12px] text-nebula-300">
                                    refactor/router
                                </code>
                                : remove the legacy{" "}
                                <code class="text-[12px] text-nebula-300">
                                    useNavigate
                                </code>{" "}
                                wrapper.
                            </li>
                        </ul>
                        <p>
                            Want me to push them to a branch and open a draft
                            PR?
                        </p>
                    </div>
                </article>
                <p class="mt-3 text-xs text-void-500">
                    Cost is exposed inline on the trigger so the most-asked
                    question (
                    <span class="text-void-300">"how much did this cost"</span>
                    ) is answered without a click. Click the trigger for the
                    full breakdown.
                </p>
            </div>
        </div>
    ),
};
