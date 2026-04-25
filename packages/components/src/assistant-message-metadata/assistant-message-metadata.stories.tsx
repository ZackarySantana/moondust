import type { Meta, StoryObj } from "storybook-solidjs-vite";
import {
    AssistantMessageMetadataButton,
    type MetadataSection,
} from "./assistant-message-metadata";

const meta = {
    title: "Chat/AssistantMessageMetadataButton",
    component: AssistantMessageMetadataButton,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof AssistantMessageMetadataButton>;

export default meta;
type Story = StoryObj<typeof meta>;

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

export const OpenRouter: Story = {
    args: { sections: OPENROUTER },
};

export const Claude: Story = {
    args: { sections: CLAUDE },
};

export const MultipleSections: Story = {
    args: {
        sections: [
            ...OPENROUTER,
            {
                heading: "Tool calls",
                rows: [
                    { label: "shell", value: "3" },
                    { label: "read_file", value: "5" },
                    { label: "write_file", value: "1" },
                ],
            },
        ],
    },
};

export const MinimalRowsOnly: Story = {
    args: {
        sections: [
            {
                heading: "Local model",
                rows: [
                    { label: "Model", value: "llama-3.1-8b" },
                    { label: "Latency", value: "240ms" },
                ],
            },
        ],
    },
};

export const Empty: Story = {
    args: { sections: [] },
};

export const InMessageRow: Story = {
    render: () => (
        <div class="flex max-w-md items-center gap-2 rounded-lg border border-slate-800/40 bg-app-panel px-3 py-2 text-sm text-slate-300">
            <span class="flex-1">Sure, here's the refactor you asked for…</span>
            <AssistantMessageMetadataButton sections={OPENROUTER} />
        </div>
    ),
};
