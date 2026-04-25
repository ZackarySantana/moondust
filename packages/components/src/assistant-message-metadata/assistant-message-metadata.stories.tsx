import type { JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import {
    AssistantMessageMetadataButton,
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
    <div class="grid grid-cols-[140px_1fr] items-start gap-6 border-l-2 border-void-700 pl-4">
        <span class="pt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
            {props.label}
        </span>
        <div>{props.children}</div>
    </div>
);

const OPENROUTER: MetadataSection[] = [
    {
        heading: "OpenRouter",
        pills: [
            { label: "Input", value: "1,420" },
            { label: "Output", value: "382" },
            { label: "Cache R", value: "0" },
            { label: "Cache W", value: "0" },
            { label: "Total", value: "$0.0124", accent: true },
        ],
        rows: [
            { label: "Native finish", value: "stop" },
            { label: "Latency", value: "1.83s" },
        ],
        requestId: "or_01HX12345ABC67890XYZ",
        footnote: "Reported by OpenRouter generation API",
    },
];

const CLAUDE: MetadataSection[] = [
    {
        heading: "Claude API",
        pills: [
            { label: "Input", value: "983" },
            { label: "Output", value: "421" },
            { label: "Cache R", value: "12,840" },
            { label: "Cache W", value: "0" },
            { label: "Total", value: "$0.0089", accent: true },
        ],
        rows: [
            { label: "Stop reason", value: "end_turn" },
            { label: "Model", value: "claude-3-5-sonnet" },
        ],
        requestId: "msg_01H3X4Y5Z6ABC1234",
    },
];

const MULTI: MetadataSection[] = [
    ...OPENROUTER,
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
    args: { sections: OPENROUTER },
};

export const Providers: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame label="providers — click each i to open the popover">
            <Row label="openrouter">
                <div class="flex items-center gap-3">
                    <AssistantMessageMetadataButton sections={OPENROUTER} />
                    <span class="text-xs text-void-400">
                        Includes pills, rows, request id and footnote.
                    </span>
                </div>
            </Row>
            <Row label="claude api">
                <div class="flex items-center gap-3">
                    <AssistantMessageMetadataButton sections={CLAUDE} />
                    <span class="text-xs text-void-400">
                        Cache reads tracked separately.
                    </span>
                </div>
            </Row>
            <Row label="multi-section">
                <div class="flex items-center gap-3">
                    <AssistantMessageMetadataButton sections={MULTI} />
                    <span class="text-xs text-void-400">
                        Sections are visually divided by a hairline.
                    </span>
                </div>
            </Row>
            <Row label="rows only">
                <div class="flex items-center gap-3">
                    <AssistantMessageMetadataButton
                        sections={[
                            {
                                heading: "Local model",
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
                    <span class="text-xs text-void-400">
                        Pills are optional; rows can stand alone.
                    </span>
                </div>
            </Row>
            <Row label="empty (hidden)">
                <div class="flex items-center gap-3">
                    <div class="grid size-6 place-items-center border border-dashed border-void-700 text-[9px] text-void-600">
                        ·
                    </div>
                    <span class="text-xs text-void-400">
                        With no sections the button does not render.
                    </span>
                </div>
            </Row>
        </Frame>
    ),
};

export const Anatomy: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-md">
                <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    anatomy — popover unfurled
                </p>
                <div class="rounded-none border border-void-700 bg-void-900">
                    <div class="flex flex-col gap-3 p-3">
                        <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-void-500">
                            OpenRouter
                        </p>
                        <div class="grid grid-cols-2 gap-1.5">
                            <div class="flex flex-col gap-0.5 bg-void-800/60 px-2 py-1.5">
                                <span class="font-mono text-[9px] uppercase tracking-[0.16em] text-void-500">
                                    Input
                                </span>
                                <span class="font-mono text-[11px] tabular-nums text-void-100">
                                    1,420
                                </span>
                            </div>
                            <div class="flex flex-col gap-0.5 bg-void-800/60 px-2 py-1.5">
                                <span class="font-mono text-[9px] uppercase tracking-[0.16em] text-void-500">
                                    Output
                                </span>
                                <span class="font-mono text-[11px] tabular-nums text-void-100">
                                    382
                                </span>
                            </div>
                            <div class="col-span-2 flex flex-col gap-0.5 bg-void-800/60 px-2 py-1.5">
                                <span class="font-mono text-[9px] uppercase tracking-[0.16em] text-void-500">
                                    Total
                                </span>
                                <span class="font-mono text-[11px] tabular-nums text-starlight-300">
                                    $0.0124
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <p class="mt-3 text-xs text-void-500">
                    Pills marked{" "}
                    <code class="text-[12px] text-starlight-300">accent</code>{" "}
                    use the starlight tint to highlight totals and cost.
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
                    in context — assistant message footer with metadata + fork
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
                                sections={OPENROUTER}
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
                    Click the{" "}
                    <code class="text-[12px] text-void-200">i</code> in the
                    header to inspect token usage and the request id.
                </p>
            </div>
        </div>
    ),
};
