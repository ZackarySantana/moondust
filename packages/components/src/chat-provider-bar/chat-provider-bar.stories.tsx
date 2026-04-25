import ArrowUp from "lucide-solid/icons/arrow-up";
import Paperclip from "lucide-solid/icons/paperclip";
import { createSignal, type JSX } from "solid-js";
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
    { id: "anthropic", label: "Anthropic" },
];

const MODELS = [
    {
        id: "anthropic/claude-3.5-sonnet",
        label: "Claude 3.5 Sonnet",
        description: "Balanced reasoning and coding workhorse",
    },
    {
        id: "anthropic/claude-3.7-sonnet",
        label: "Claude 3.7 Sonnet",
        description: "Newer reasoning, better long context",
    },
    {
        id: "openai/gpt-4o",
        label: "GPT-4o",
        description: "Multimodal, fast, default-good",
    },
    {
        id: "openai/o3-mini",
        label: "o3-mini",
        description: "Reasoning model for hard problems",
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

const Frame = (props: { children: JSX.Element; label?: string }) => (
    <div class="min-h-screen bg-void-950 p-10">
        <div class="mx-auto max-w-3xl">
            {props.label && (
                <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    {props.label}
                </p>
            )}
            {props.children}
        </div>
    </div>
);

const Composer = (props: {
    children: JSX.Element;
    placeholder?: string;
}) => (
    <div class="flex h-80 flex-col justify-end border border-void-700 bg-void-900">
        <div class="flex-1 overflow-auto p-5 text-sm text-void-400">
            <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                conversation
            </p>
            <p class="mt-2">
                Ask Moondust anything. Switch the provider and model in the
                bar below before sending.
            </p>
        </div>
        <div class="border-t border-void-700 p-3">
            <div class="border border-void-700 bg-void-850 p-2.5">
                <textarea
                    rows="2"
                    placeholder={
                        props.placeholder ?? "Refactor the router to…"
                    }
                    class="block w-full resize-none bg-transparent text-sm text-void-100 outline-none placeholder:text-void-500"
                />
                <div class="mt-2 flex items-end justify-between gap-2">
                    {props.children}
                    <div class="flex shrink-0 items-center gap-1">
                        <button
                            type="button"
                            class="grid size-7 cursor-pointer place-items-center rounded-none text-void-400 transition-colors duration-100 hover:bg-void-800 hover:text-void-100"
                            aria-label="Attach file"
                        >
                            <Paperclip
                                class="size-3.5"
                                stroke-width={2}
                                aria-hidden
                            />
                        </button>
                        <button
                            type="submit"
                            class="grid size-7 cursor-pointer place-items-center rounded-none bg-starlight-400 text-void-950 transition-colors duration-100 hover:bg-starlight-300"
                            aria-label="Send"
                        >
                            <ArrowUp
                                class="size-3.5"
                                stroke-width={2.5}
                                aria-hidden
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const Playground: Story = {
    args: {
        provider: "openrouter",
        onProviderChange: () => {},
        providers: PROVIDERS,
        model: "anthropic/claude-3.5-sonnet",
        onModelChange: () => {},
        models: MODELS,
    },
    render: (args: ChatProviderBarProps) => (
        <div class="flex h-32 flex-col justify-end border border-void-700 bg-void-900 p-4">
            <ChatProviderBar {...args} />
        </div>
    ),
};

export const Default: Story = {
    render: () => {
        const [provider, setProvider] = createSignal(PROVIDERS[0].id);
        const [model, setModel] = createSignal(MODELS[0].id);
        return (
            <Frame label="default — both menus open upward like a chat composer">
                <Composer>
                    <ChatProviderBar
                        provider={provider()}
                        onProviderChange={setProvider}
                        providers={PROVIDERS}
                        model={model()}
                        onModelChange={setModel}
                        models={MODELS}
                    />
                </Composer>
                <p class="mt-3 text-xs text-void-500">
                    Click the provider or model trigger to open the menu. The
                    model menu is searchable.
                </p>
            </Frame>
        );
    },
};

export const States: Story = {
    render: () => (
        <Frame label="states">
            <div class="grid gap-6">
                <div class="border-l-2 border-void-700 pl-4">
                    <p class="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        with warning
                    </p>
                    <div class="flex h-28 flex-col justify-end border border-void-700 bg-void-900 p-3">
                        <ChatProviderBar
                            provider="openrouter"
                            onProviderChange={() => {}}
                            providers={PROVIDERS}
                            model="anthropic/claude-3.5-sonnet"
                            onModelChange={() => {}}
                            models={MODELS}
                            warning={
                                <>
                                    Add an OpenRouter API key in Settings to
                                    use this provider.
                                </>
                            }
                        />
                    </div>
                </div>
                <div class="border-l-2 border-void-700 pl-4">
                    <p class="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        provider locked
                    </p>
                    <div class="flex h-20 flex-col justify-end border border-void-700 bg-void-900 p-3">
                        <ChatProviderBar
                            provider="claude"
                            onProviderChange={() => {}}
                            providers={PROVIDERS}
                            model="anthropic/claude-3.5-sonnet"
                            onModelChange={() => {}}
                            models={MODELS}
                            providerDisabled
                        />
                    </div>
                    <p class="mt-1.5 text-[11px] text-void-500">
                        Useful for Claude Code where the provider is fixed.
                    </p>
                </div>
                <div class="border-l-2 border-void-700 pl-4">
                    <p class="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        model locked
                    </p>
                    <div class="flex h-20 flex-col justify-end border border-void-700 bg-void-900 p-3">
                        <ChatProviderBar
                            provider="claude"
                            onProviderChange={() => {}}
                            providers={PROVIDERS}
                            model="anthropic/claude-3.5-sonnet"
                            onModelChange={() => {}}
                            models={MODELS}
                            modelDisabled
                        />
                    </div>
                    <p class="mt-1.5 text-[11px] text-void-500">
                        Useful for managed providers that pin a single model.
                    </p>
                </div>
                <div class="border-l-2 border-void-700 pl-4">
                    <p class="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        unknown model
                    </p>
                    <div class="flex h-20 flex-col justify-end border border-void-700 bg-void-900 p-3">
                        <ChatProviderBar
                            provider="openrouter"
                            onProviderChange={() => {}}
                            providers={PROVIDERS}
                            model="x-ai/some-experimental-model-not-in-list"
                            onModelChange={() => {}}
                            models={MODELS}
                        />
                    </div>
                    <p class="mt-1.5 text-[11px] text-void-500">
                        When the current model id is not in the catalog, the
                        raw id is shown verbatim.
                    </p>
                </div>
            </div>
        </Frame>
    ),
};

export const InContext: Story = {
    parameters: { layout: "fullscreen" },
    render: () => {
        const [provider, setProvider] = createSignal(PROVIDERS[0].id);
        const [model, setModel] = createSignal(MODELS[0].id);
        return (
            <div class="min-h-screen bg-void-950 p-10">
                <div class="mx-auto max-w-2xl">
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        chat composer — full surface
                    </p>
                    <Composer placeholder="What do you want to ship today?">
                        <ChatProviderBar
                            provider={provider()}
                            onProviderChange={setProvider}
                            providers={PROVIDERS}
                            model={model()}
                            onModelChange={setModel}
                            models={MODELS}
                            warning={
                                provider() === "claude" ? (
                                    <>Claude Code requires the local CLI.</>
                                ) : undefined
                            }
                        />
                    </Composer>
                </div>
            </div>
        );
    },
};
