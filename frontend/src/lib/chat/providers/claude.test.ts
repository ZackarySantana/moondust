import { describe, expect, test } from "vitest";
import { claudePersistedAssistantParts } from "@/lib/chat/providers/claude";
import type { store } from "@wails/go/models";

describe("claudePersistedAssistantParts", () => {
    test("plain content when no Claude metadata", () => {
        const parts = claudePersistedAssistantParts({
            role: "assistant",
            content: "hi",
        } as store.ChatMessage);
        expect(parts).toEqual([{ kind: "text", text: "hi" }]);
    });

    test("tool_calls then assistant text", () => {
        const parts = claudePersistedAssistantParts({
            role: "assistant",
            content: "done",
            metadata: {
                claude: {
                    tool_calls: [
                        {
                            name: "read_file",
                            arguments: '{"path":"a"}',
                            output: "x",
                        },
                    ],
                },
            },
        } as store.ChatMessage);
        expect(parts.map((p) => p.kind)).toEqual(["tool", "text"]);
        expect(parts[0]).toMatchObject({
            kind: "tool",
            tool: { name: "read_file" },
        });
        expect(parts[1]).toMatchObject({ kind: "text", text: "done" });
    });
});
