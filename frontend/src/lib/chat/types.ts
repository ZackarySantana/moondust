/**
 * Provider-agnostic view model for assistant turns. Adapters map OpenRouter / Cursor / Claude
 * storage into these parts; the thread UI renders only this shape.
 */

import type { StreamChunk } from "@/lib/chat-stream-sidebar-store";

export type ChatToolPayload = {
    id?: string;
    name: string;
    arguments?: string;
    output?: string;
};

/** One block inside a single logical assistant turn (persisted or streaming). */
export type AssistantPart =
    | {
          kind: "thought";
          text: string;
          durationSec: number | null;
          thinkingPhase?: boolean;
      }
    | { kind: "text"; text: string }
    | { kind: "tool"; tool: ChatToolPayload };

export type StreamingAssistantArgs = {
    reasoningFull: string;
    reasoningDurationSec: number | null;
    thinkingPhase: boolean;
    chunks: StreamChunk[];
};
