import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import {
    ChatProviderBar,
    type ChatProviderBarProps,
} from "./chat-provider-bar";

const meta = {
    title: "Chat/ChatProviderBar",
    component: ChatProviderBar,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof ChatProviderBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const PROVIDERS = [
    { id: "openrouter", label: "OpenRouter" },
    { id: "cursor", label: "Cursor" },
    { id: "claude", label: "Claude Code" },
];

const MODELS = [
    {
        id: "anthropic/claude-3.5-sonnet",
        label: "Claude 3.5 Sonnet",
        description: "Balanced reasoning + coding workhorse",
    },
    {
        id: "openai/gpt-4o",
        label: "GPT-4o",
        description: "Multimodal, fast, default-good",
    },
    {
        id: "google/gemini-2.0-flash",
        label: "Gemini 2.0 Flash",
        description: "Cheap and snappy",
    },
    {
        id: "meta-llama/llama-3.1-405b",
        label: "Llama 3.1 405B",
        description: "Open-weight flagship",
    },
    {
        id: "mistralai/mistral-large-2",
        label: "Mistral Large 2",
        description: "Strong European frontier model",
    },
];

export const Default: Story = {
    render: () => {
        const [provider, setProvider] = createSignal(PROVIDERS[0].id);
        const [model, setModel] = createSignal(MODELS[0].id);
        return (
            <div class="flex h-72 flex-col justify-end gap-4 rounded-lg border border-slate-800/60 bg-app-panel p-4">
                <p class="text-xs text-slate-500">
                    The bar opens menus upward, like a chat composer.
                </p>
                <ChatProviderBar
                    provider={provider()}
                    onProviderChange={setProvider}
                    providers={PROVIDERS}
                    model={model()}
                    onModelChange={setModel}
                    models={MODELS}
                />
            </div>
        );
    },
};

export const WithWarning: Story = {
    args: {
        provider: "openrouter",
        onProviderChange: () => {},
        providers: PROVIDERS,
        model: "anthropic/claude-3.5-sonnet",
        onModelChange: () => {},
        models: MODELS,
        warning: (
            <>
                Add an OpenRouter API key in Settings → Providers to use this
                provider.
            </>
        ),
    },
    render: (args: ChatProviderBarProps) => (
        <div class="flex h-48 flex-col justify-end rounded-lg border border-slate-800/60 bg-app-panel p-4">
            <ChatProviderBar {...args} />
        </div>
    ),
};

export const ProviderDisabled: Story = {
    args: {
        provider: "claude",
        onProviderChange: () => {},
        providers: PROVIDERS,
        model: "anthropic/claude-3.5-sonnet",
        onModelChange: () => {},
        models: MODELS,
        providerDisabled: true,
    },
    render: (args: ChatProviderBarProps) => (
        <div class="flex h-32 flex-col justify-end rounded-lg border border-slate-800/60 bg-app-panel p-4">
            <ChatProviderBar {...args} />
        </div>
    ),
};

export const ModelDisabled: Story = {
    args: {
        provider: "claude",
        onProviderChange: () => {},
        providers: PROVIDERS,
        model: "anthropic/claude-3.5-sonnet",
        onModelChange: () => {},
        models: MODELS,
        modelDisabled: true,
    },
    render: (args: ChatProviderBarProps) => (
        <div class="flex h-32 flex-col justify-end rounded-lg border border-slate-800/60 bg-app-panel p-4">
            <ChatProviderBar {...args} />
        </div>
    ),
};

export const UnknownModel: Story = {
    args: {
        provider: "openrouter",
        onProviderChange: () => {},
        providers: PROVIDERS,
        model: "x-ai/some-experimental-model-not-in-list",
        onModelChange: () => {},
        models: MODELS,
    },
    render: (args: ChatProviderBarProps) => (
        <div class="flex h-32 flex-col justify-end rounded-lg border border-slate-800/60 bg-app-panel p-4">
            <ChatProviderBar {...args} />
        </div>
    ),
};
