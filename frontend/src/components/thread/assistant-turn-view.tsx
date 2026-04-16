import Bot from "lucide-solid/icons/bot";
import ChevronsUpDown from "lucide-solid/icons/chevrons-up-down";
import Wrench from "lucide-solid/icons/wrench";
import type { Component } from "solid-js";
import { createSignal, For, Show } from "solid-js";
import { AssistantMessageForkButton } from "@/components/assistant-message-fork-button";
import { AssistantMessageMetadataButton } from "@/components/assistant-message-metadata";
import { AssistantPartMessageRow } from "@/components/thread/assistant-message-parts";
import type { AssistantPart } from "@/lib/chat/types";
import type { store } from "@wails/go/models";

function partLeadingIcon(part: AssistantPart) {
    if (part.kind === "text") {
        return (
            <Bot
                class="size-3.5 text-slate-600"
                stroke-width={1.75}
                aria-hidden
            />
        );
    }
    if (part.kind === "tool") {
        return (
            <Wrench
                class="size-3 text-slate-600"
                stroke-width={2}
                aria-hidden
            />
        );
    }
    return null;
}

type DisplaySegment =
    | { type: "part"; part: AssistantPart; globalIndex: number }
    | { type: "collapse"; hiddenCount: number; runId: number };

function buildDisplaySegments(
    parts: AssistantPart[],
    expandedRuns: Set<number>,
): DisplaySegment[] {
    const segments: DisplaySegment[] = [];
    let i = 0;
    let runId = 0;

    while (i < parts.length) {
        if (parts[i].kind !== "tool") {
            segments.push({ type: "part", part: parts[i], globalIndex: i });
            i++;
            continue;
        }

        const runStart = i;
        while (i < parts.length && parts[i].kind === "tool") i++;
        const runLen = i - runStart;
        const thisRunId = runId++;

        if (runLen < 4 || expandedRuns.has(thisRunId)) {
            for (let j = runStart; j < i; j++) {
                segments.push({ type: "part", part: parts[j], globalIndex: j });
            }
        } else {
            segments.push({
                type: "part",
                part: parts[runStart],
                globalIndex: runStart,
            });
            segments.push({
                type: "collapse",
                hiddenCount: runLen - 2,
                runId: thisRunId,
            });
            segments.push({
                type: "part",
                part: parts[i - 1],
                globalIndex: i - 1,
            });
        }
    }
    return segments;
}

/**
 * Renders one assistant turn from {@link AssistantPart}s: shared layout for persisted
 * messages and the live streaming bubble (header + part rows).
 */
export const AssistantTurnView: Component<{
    parts: () => AssistantPart[];
    streaming: boolean;
    headerLine: () => string | null;
    metadataMsg?: () => store.ChatMessage | undefined;
    forkFromMessage?: () =>
        | {
              threadId: string;
              projectId: string;
              sourceUsesWorktree: boolean;
              forkMessage: (messageId: string) => Promise<store.Thread>;
              forkPending: () => boolean;
              forkError: () => unknown;
          }
        | undefined;
}> = (props) => {
    const hasTools = () => props.parts().some((p) => p.kind === "tool");
    const hasThought = () => props.parts().some((p) => p.kind === "thought");
    const showHeader = () =>
        Boolean(props.headerLine()?.trim()) || hasTools() || hasThought();

    const metadata = () => props.metadataMsg?.();
    const forkOpts = () => props.forkFromMessage?.();

    const showFirstRowChrome = () =>
        props.parts().length > 0 &&
        (showHeader() || metadata() != null || forkOpts() != null);

    const [expandedRuns, setExpandedRuns] = createSignal<Set<number>>(
        new Set(),
    );
    const expandRun = (runId: number) =>
        setExpandedRuns((prev) => new Set([...prev, runId]));

    const segments = () =>
        buildDisplaySegments(props.parts(), expandedRuns());

    return (
        <div class="flex w-full min-w-0 flex-col items-stretch">
            <For each={segments()}>
                {(seg) => {
                    if (seg.type === "collapse") {
                        return (
                            <div class="flex w-full min-w-0 items-center gap-2 py-0.5">
                                <div
                                    class="w-5 shrink-0"
                                    aria-hidden
                                />
                                <button
                                    type="button"
                                    onClick={() => expandRun(seg.runId)}
                                    class="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-slate-500 transition-colors hover:bg-slate-800/40 hover:text-slate-300"
                                >
                                    <ChevronsUpDown
                                        class="size-3"
                                        stroke-width={2}
                                    />
                                    {seg.hiddenCount} more tool call
                                    {seg.hiddenCount !== 1 ? "s" : ""}
                                </button>
                            </div>
                        );
                    }

                    const part = seg.part;
                    const isFirst = seg.globalIndex === 0;

                    return (
                        <div class="flex w-full min-w-0 flex-col gap-0.5 overflow-x-hidden py-0.5">
                            <Show when={isFirst && showFirstRowChrome()}>
                                <div class="flex min-w-0 items-center gap-2 pb-0.5">
                                    <div
                                        class="w-5 shrink-0"
                                        aria-hidden
                                    />
                                    <Show when={props.headerLine()?.trim()}>
                                        <p class="min-w-0 flex-1 text-[10px] leading-tight text-slate-600">
                                            {props.headerLine()}
                                        </p>
                                    </Show>
                                    <div class="ml-auto flex shrink-0 items-center gap-0.5">
                                        <Show when={metadata()}>
                                            {(msg) => {
                                                const o = forkOpts();
                                                return (
                                                    <>
                                                        <Show when={!!o}>
                                                            <AssistantMessageForkButton
                                                                sourceUsesWorktree={
                                                                    o!
                                                                        .sourceUsesWorktree
                                                                }
                                                                fork={() =>
                                                                    o!.forkMessage(
                                                                        msg()
                                                                            .id,
                                                                    )
                                                                }
                                                                forkPending={o!.forkPending()}
                                                                forkError={o!.forkError()}
                                                            />
                                                        </Show>
                                                        <AssistantMessageMetadataButton
                                                            msg={msg()}
                                                        />
                                                    </>
                                                );
                                            }}
                                        </Show>
                                    </div>
                                </div>
                            </Show>
                            <div class="flex min-w-0 gap-2">
                                <div class="flex w-5 shrink-0 justify-center pt-1">
                                    {partLeadingIcon(part)}
                                </div>
                                <div class="flex min-w-0 max-w-full flex-1 flex-col">
                                    <AssistantPartMessageRow
                                        part={part}
                                        streaming={props.streaming}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                }}
            </For>
        </div>
    );
};
