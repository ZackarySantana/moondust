import { describe, expect, test } from "vitest";
import {
    streamPartsFromSnapshot,
    streamPartsHaveVisibleContent,
} from "@/lib/chat/streaming";
import type { AssistantPart } from "@/lib/chat/types";

describe("streamPartsFromSnapshot", () => {
    test("emits thought when thinkingPhase even if reasoning empty", () => {
        const parts = streamPartsFromSnapshot({
            reasoningFull: "",
            reasoningDurationSec: null,
            thinkingPhase: true,
            chunks: [],
        });
        expect(parts).toHaveLength(1);
        expect(parts[0]).toMatchObject({
            kind: "thought",
            thinkingPhase: true,
            text: "",
        });
    });

    test("interleaves text and tools in chunk order", () => {
        const parts = streamPartsFromSnapshot({
            reasoningFull: "r",
            reasoningDurationSec: 1,
            thinkingPhase: false,
            chunks: [
                { kind: "text", text: "a" },
                {
                    kind: "tool",
                    tool: { name: "t1", arguments: "{}", output: "out" },
                },
                { kind: "text", text: "b" },
            ],
        });
        expect(parts.map((p) => p.kind)).toEqual([
            "thought",
            "text",
            "tool",
            "text",
        ]);
    });

    test("drops tool chunks with blank name", () => {
        const parts = streamPartsFromSnapshot({
            reasoningFull: "",
            reasoningDurationSec: null,
            thinkingPhase: false,
            chunks: [
                { kind: "tool", tool: { name: "   ", arguments: "{}" } },
                { kind: "tool", tool: { name: "ok", arguments: "{}" } },
            ],
        });
        expect(parts).toHaveLength(1);
        expect(parts[0]).toMatchObject({ kind: "tool", tool: { name: "ok" } });
    });

    test("skips whitespace-only text chunks", () => {
        const parts = streamPartsFromSnapshot({
            reasoningFull: "",
            reasoningDurationSec: null,
            thinkingPhase: false,
            chunks: [{ kind: "text", text: "   \n" }],
        });
        expect(parts).toHaveLength(0);
    });
});

describe("streamPartsHaveVisibleContent", () => {
    test("false for empty parts", () => {
        expect(streamPartsHaveVisibleContent([])).toBe(false);
    });

    test("true for thought with thinkingPhase", () => {
        const parts: AssistantPart[] = [
            {
                kind: "thought",
                text: "",
                durationSec: null,
                thinkingPhase: true,
            },
        ];
        expect(streamPartsHaveVisibleContent(parts)).toBe(true);
    });

    test("true for any tool part", () => {
        const parts: AssistantPart[] = [
            {
                kind: "tool",
                tool: { name: "x" },
            },
        ];
        expect(streamPartsHaveVisibleContent(parts)).toBe(true);
    });
});
