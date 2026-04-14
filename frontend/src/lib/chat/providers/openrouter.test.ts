import { describe, expect, test } from "vitest";
import { openRouterPersistedAssistantParts } from "@/lib/chat/providers/openrouter";
import type { store } from "@wails/go/models";

describe("openRouterPersistedAssistantParts", () => {
    test("plain content when no OpenRouter metadata", () => {
        const parts = openRouterPersistedAssistantParts({
            role: "assistant",
            content: "hi",
        } as store.ChatMessage);
        expect(parts).toEqual([{ kind: "text", text: "hi" }]);
    });

    test("reasoning block then segments without duplicating msg.content", () => {
        const parts = openRouterPersistedAssistantParts({
            role: "assistant",
            content: "full reply text",
            metadata: {
                openrouter: {
                    reasoning: "because",
                    reasoning_duration_sec: 2,
                    segments: [
                        { text: "hello" },
                        {
                            tool: {
                                name: "list_files",
                                arguments: "{}",
                                output: "[]",
                            },
                        },
                    ],
                },
            },
        } as store.ChatMessage);
        expect(parts.map((p) => p.kind)).toEqual(["thought", "text", "tool"]);
        expect(parts[0]).toMatchObject({ kind: "thought", text: "because" });
        expect(parts[1]).toMatchObject({ kind: "text", text: "hello" });
    });

    test("content only when no segments", () => {
        const parts = openRouterPersistedAssistantParts({
            role: "assistant",
            content: "answer",
            metadata: {
                openrouter: {},
            },
        } as store.ChatMessage);
        expect(parts).toEqual([{ kind: "text", text: "answer" }]);
    });
});
