import Bot from "lucide-solid/icons/bot";
import Wrench from "lucide-solid/icons/wrench";
import type { Component } from "solid-js";
import { For, Show } from "solid-js";
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

    return (
        <div class="flex w-full min-w-0 flex-col items-stretch">
            <For each={props.parts()}>
                {(part, index) => (
                    <div class="flex w-full min-w-0 flex-col gap-0.5 overflow-x-hidden py-0.5">
                        <Show when={index() === 0 && showFirstRowChrome()}>
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
                )}
            </For>
        </div>
    );
};
