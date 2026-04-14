import { createMemoryHistory, MemoryRouter, Route } from "@solidjs/router";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import {
    OPENROUTER_CHAT_MODELS_FALLBACK,
    type ChatProviderId,
} from "@/lib/chat-provider";
import { ChatProviderBar } from "./chat-provider-bar";

function memoryAt(path: string) {
    const h = createMemoryHistory();
    h.set({ value: path, replace: true, scroll: false });
    return h;
}

function BarShell(props: {
    provider: ChatProviderId;
    model: string;
    showHint?: boolean;
}) {
    return (
        <div class="max-w-2xl rounded-lg border border-slate-800/60 bg-slate-950/30 p-3">
            <ChatProviderBar
                provider={props.provider}
                onProviderChange={() => {}}
                model={props.model}
                onModelChange={() => {}}
                modelChoices={OPENROUTER_CHAT_MODELS_FALLBACK}
                showOpenRouterKeyHint={props.showHint ?? false}
            />
        </div>
    );
}

const meta = {
    title: "Chat/ChatProviderBar",
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenRouter: Story = {
    render: () => (
        <MemoryRouter history={memoryAt("/project/demo/thread/t1")}>
            <Route
                path="/project/:projectId/thread/:threadId"
                component={() => (
                    <BarShell
                        provider="openrouter"
                        model="anthropic/claude-sonnet-4.6"
                    />
                )}
            />
        </MemoryRouter>
    ),
};

export const OpenRouterKeyHint: Story = {
    render: () => (
        <MemoryRouter history={memoryAt("/project/demo/thread/t1")}>
            <Route
                path="/project/:projectId/thread/:threadId"
                component={() => (
                    <BarShell
                        provider="openrouter"
                        model="openai/gpt-4o-mini"
                        showHint
                    />
                )}
            />
        </MemoryRouter>
    ),
};

export const Cursor: Story = {
    render: () => (
        <MemoryRouter history={memoryAt("/project/demo/thread/t1")}>
            <Route
                path="/project/:projectId/thread/:threadId"
                component={() => (
                    <BarShell
                        provider="cursor"
                        model="gpt-5.1"
                    />
                )}
            />
        </MemoryRouter>
    ),
};
