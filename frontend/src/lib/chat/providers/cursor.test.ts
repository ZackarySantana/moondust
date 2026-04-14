import { describe, expect, test } from "vitest";
import { cursorPersistedAssistantParts } from "@/lib/chat/providers/cursor";
import type { store } from "@wails/go/models";

describe("cursorPersistedAssistantParts", () => {
    test("plain content when no Cursor metadata", () => {
        const parts = cursorPersistedAssistantParts({
            role: "assistant",
            content: "hi",
        } as store.ChatMessage);
        expect(parts).toEqual([{ kind: "text", text: "hi" }]);
    });

    test("tool_calls then assistant text", () => {
        const parts = cursorPersistedAssistantParts({
            role: "assistant",
            content: "done",
            metadata: {
                cursor: {
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
