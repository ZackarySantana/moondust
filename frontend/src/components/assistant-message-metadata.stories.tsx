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
            cache_read_tokens: 450,
            plan_auto_percent_delta: -0.5,
            plan_api_percent_delta: 0.1,
            request_id: "req_abc123def456",
            tool_calls: [
                {
                    name: "bash",
                    arguments: "{}",
                },
            ],
        },
    },
});

const claudeMsg = store.ChatMessage.createFrom({
    id: "m3",
    thread_id: "t1",
    role: "assistant",
    content: "Claude response",
    created_at: "2026-04-14T12:00:00.000Z",
    chat_provider: "claude",
    metadata: {
        claude: {
            input_tokens: 2400,
            output_tokens: 800,
            cache_read_tokens: 1200,
            cache_write_tokens: 300,
            tool_calls: [
                { name: "read_file", arguments: '{"path":"main.go"}' },
                { name: "write_file", arguments: '{"path":"main.go"}' },
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

export const ClaudeCode: Story = {
    render: () => (
        <div class="flex justify-end p-4">
            <AssistantMessageMetadataButton msg={claudeMsg} />
        </div>
    ),
};
