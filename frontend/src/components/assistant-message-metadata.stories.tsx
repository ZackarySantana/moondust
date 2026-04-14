import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { store } from "@wails/go/models";
import { AssistantMessageMetadataButton } from "./assistant-message-metadata";

const openRouterMsg = store.ChatMessage.createFrom({
    id: "m1",
    thread_id: "t1",
    role: "assistant",
    content: "Hello",
    created_at: "2026-04-14T12:00:00.000Z",
    chat_provider: "openrouter",
    chat_model: "anthropic/claude-3.5-sonnet",
    metadata: {
        openrouter: {
            prompt_tokens: 1200,
            completion_tokens: 400,
            total_tokens: 1600,
            cost_usd: 0.0042,
        },
    },
});

const mixedMsg = store.ChatMessage.createFrom({
    id: "m2",
    thread_id: "t1",
    role: "assistant",
    content: "Hi",
    created_at: "2026-04-14T12:00:00.000Z",
    chat_provider: "openrouter",
    metadata: {
        openrouter: {
            total_tokens: 900,
            cost_usd: 0.001,
        },
        cursor: {
            input_tokens: 800,
            output_tokens: 100,
            plan_auto_percent_delta: -0.5,
            plan_api_percent_delta: 0.1,
            request_id: "req_abc123",
            tool_calls: [
                {
                    name: "bash",
                    arguments: "{}",
                },
            ],
        },
    },
});

const meta = {
    title: "Chat/AssistantMessageMetadata",
    component: AssistantMessageMetadataButton,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof AssistantMessageMetadataButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenRouter: Story = {
    render: () => (
        <div class="flex justify-end p-4">
            <AssistantMessageMetadataButton msg={openRouterMsg} />
        </div>
    ),
};

export const OpenRouterAndCursor: Story = {
    render: () => (
        <div class="flex justify-end p-4">
            <AssistantMessageMetadataButton msg={mixedMsg} />
        </div>
    ),
};
