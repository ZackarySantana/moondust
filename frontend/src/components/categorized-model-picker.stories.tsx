import type { Meta, StoryObj } from "storybook-solidjs-vite";
import type { ModelChoice } from "@/lib/chat-provider";
import {
    CategorizedModelList,
    MODEL_LIST_SCROLL_CLASS,
    MODEL_PANEL_HEIGHT_CLASS,
    ModelRowButton,
    OrgBadge,
} from "./categorized-model-picker";

const models: ModelChoice[] = [
    {
        id: "anthropic/claude-sonnet-4.6",
        label: "Anthropic: Claude Sonnet 4.6",
        provider: "anthropic",
        description: "Strong general model.",
        pricing_tier: "$$",
        vision: true,
        reasoning: true,
        context_length: 200_000,
    },
    {
        id: "openai/gpt-5.4-mini",
        label: "OpenAI: GPT-5.4 Mini",
        provider: "openai",
        description: "Faster, cheaper.",
        pricing_tier: "$",
        long_context: true,
        context_length: 128_000,
    },
];

const meta = {
    title: "Chat/CategorizedModelPicker",
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const OrgBadges: Story = {
    render: () => (
        <div class="flex flex-wrap gap-3">
            <OrgBadge slug="anthropic" />
            <OrgBadge slug="openai" />
            <OrgBadge slug="google" />
            <OrgBadge slug="meta-llama" />
            <OrgBadge slug="deepseek" />
            <OrgBadge slug="x-ai" />
            <OrgBadge slug="qwen" />
            <OrgBadge slug="mistralai" />
            <OrgBadge slug="cursor" />
        </div>
    ),
};

export const OrgBadgesCompact: Story = {
    name: "Org badges (compact)",
    render: () => (
        <div class="flex flex-wrap gap-3">
            <OrgBadge
                slug="anthropic"
                compact
            />
            <OrgBadge
                slug="openai"
                compact
            />
            <OrgBadge
                slug="google"
                compact
            />
        </div>
    ),
};

export const ModelRow: Story = {
    render: () => (
        <div class="w-[min(28rem,100%)] overflow-hidden rounded-md border border-slate-800/60 bg-slate-950/40">
            <ModelRowButton
                m={models[0]!}
                selected={false}
                onPick={() => {}}
                onInfoHover={() => {}}
                onInfoLeave={() => {}}
            />
            <ModelRowButton
                m={models[1]!}
                selected
                onPick={() => {}}
                onInfoHover={() => {}}
                onInfoLeave={() => {}}
            />
        </div>
    ),
};

export const ModelRowNoInfo: Story = {
    render: () => (
        <div class="w-[min(28rem,100%)] overflow-hidden rounded-md border border-slate-800/60 bg-slate-950/40">
            <ModelRowButton
                m={models[0]!}
                selected={false}
                showInfoButton={false}
                onPick={() => {}}
                onInfoHover={() => {}}
                onInfoLeave={() => {}}
            />
        </div>
    ),
};

export const CategorizedList: Story = {
    render: () => (
        <div
            class={`flex w-[min(28rem,100%)] flex-col overflow-hidden rounded-md border border-slate-800/60 bg-slate-950/40 ${MODEL_PANEL_HEIGHT_CLASS}`}
        >
            <div
                class={MODEL_LIST_SCROLL_CLASS}
                role="listbox"
            >
                <CategorizedModelList
                    categories={[
                        { id: "a", label: "Flagship", models },
                        { id: "b", label: "Fast", models: [models[1]!] },
                    ]}
                    selectedId="openai/gpt-5.4-mini"
                    onPick={() => {}}
                    onInfoHover={() => {}}
                    onInfoLeave={() => {}}
                    showSectionHeaders
                    showInfoButton
                />
            </div>
        </div>
    ),
};
