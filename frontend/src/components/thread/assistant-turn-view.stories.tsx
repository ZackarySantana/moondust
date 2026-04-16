import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { store } from "@wails/go/models";
import { AssistantTurnView } from "./assistant-turn-view";

const metaMsg = store.ChatMessage.createFrom({
    id: "m-story",
    thread_id: "t1",
    role: "assistant",
    content: "ok",
    created_at: "2026-04-14T12:00:00.000Z",
    chat_provider: "openrouter",
    chat_model: "anthropic/claude-3.5-sonnet",
    metadata: {
        openrouter: {
            prompt_tokens: 400,
            completion_tokens: 120,
            total_tokens: 520,
            cost_usd: 0.002,
        },
    },
});

const meta = {
    title: "Thread/AssistantTurnView",
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextOnly: Story = {
    render: () => (
        <div class="max-w-2xl rounded-lg border border-slate-800/40 bg-slate-950/30 p-3">
            <AssistantTurnView
                parts={() => [
                    {
                        kind: "text",
                        text: "Here is a concise answer for the story.",
                    },
                ]}
                streaming={false}
                headerLine={() => "Claude Sonnet · OpenRouter"}
            />
        </div>
    ),
};

export const WithThinking: Story = {
    render: () => (
        <div class="max-w-2xl rounded-lg border border-slate-800/40 bg-slate-950/30 p-3">
            <AssistantTurnView
                parts={() => [
                    {
                        kind: "thought",
                        text: "The user is asking about SolidJS signals. I should explain createSignal and how it differs from React useState...",
                        thinkingPhase: false,
                        durationSec: 3,
                    },
                    {
                        kind: "text",
                        text: "SolidJS uses `createSignal` for reactive state management. Unlike React's `useState`, signals are **fine-grained** and only re-run the specific expressions that depend on them.",
                    },
                ]}
                streaming={false}
                headerLine={() => "Claude Sonnet · OpenRouter"}
            />
        </div>
    ),
};

export const WithToolCalls: Story = {
    render: () => (
        <div class="max-w-2xl rounded-lg border border-slate-800/40 bg-slate-950/30 p-3">
            <AssistantTurnView
                parts={() => [
                    {
                        kind: "tool",
                        tool: {
                            name: "read_file",
                            arguments: '{"path": "src/main.go"}',
                            output: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("hello")\n}',
                        },
                    },
                    {
                        kind: "text",
                        text: "I've read the file. The main function simply prints \"hello\".",
                    },
                ]}
                streaming={false}
                headerLine={() => "Claude Sonnet · OpenRouter"}
            />
        </div>
    ),
};

export const StreamingToolCall: Story = {
    render: () => (
        <div class="max-w-2xl rounded-lg border border-slate-800/40 bg-slate-950/30 p-3">
            <AssistantTurnView
                parts={() => [
                    {
                        kind: "tool",
                        tool: {
                            name: "execute_command",
                            arguments: '{"command": "go test ./..."}',
                            output: "",
                        },
                    },
                ]}
                streaming={true}
                headerLine={() => "Claude Sonnet · OpenRouter"}
            />
        </div>
    ),
};

export const CollapsedToolCalls: Story = {
    render: () => (
        <div class="max-w-2xl rounded-lg border border-slate-800/40 bg-slate-950/30 p-3">
            <AssistantTurnView
                parts={() => [
                    {
                        kind: "tool",
                        tool: {
                            name: "read",
                            arguments: '{"path": "src/main.go"}',
                            output: "package main...",
                        },
                    },
                    ...Array.from({ length: 14 }, (_, i) => ({
                        kind: "tool" as const,
                        tool: {
                            name: "edit",
                            arguments: `{"path": "src/file${i + 1}.go"}`,
                            output: "ok",
                        },
                    })),
                    {
                        kind: "tool",
                        tool: {
                            name: "shell",
                            arguments: '{"command": "go test ./..."}',
                            output: "PASS",
                        },
                    },
                    {
                        kind: "text",
                        text: "I've finished editing all the files and the tests pass.",
                    },
                ]}
                streaming={false}
                headerLine={() => "Claude Sonnet · OpenRouter"}
            />
        </div>
    ),
};

export const WithMetadataChrome: Story = {
    render: () => (
        <div class="max-w-2xl rounded-lg border border-slate-800/40 bg-slate-950/30 p-3">
            <AssistantTurnView
                parts={() => [
                    {
                        kind: "text",
                        text: "Assistant turn with metadata and fork affordances.",
                    },
                ]}
                streaming={false}
                headerLine={() => "gpt-4o · OpenRouter"}
                metadataMsg={() => metaMsg}
                forkFromMessage={() => ({
                    threadId: "t1",
                    projectId: "p1",
                    sourceUsesWorktree: true,
                    forkMessage: async () =>
                        store.Thread.createFrom({
                            id: "t2",
                            project_id: "p1",
                            title: "Fork",
                            created_at: "2026-04-14T12:00:00Z",
                            updated_at: "2026-04-14T12:00:00Z",
                            worktree_dir: "",
                            chat_provider: "openrouter",
                        }),
                    forkPending: () => false,
                    forkError: () => null,
                })}
            />
        </div>
    ),
};
