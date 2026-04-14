import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import { AssistantMessageMetadataButton } from "@/components/assistant-message-metadata";
import { AssistantPartMessageRow } from "@/components/thread/assistant-message-parts";
import type { AssistantPart } from "@/lib/chat/types";
import type { store } from "@wails/go/models";

/**
 * Renders one assistant turn from {@link AssistantPart}s: shared layout for persisted
 * messages and the live streaming bubble (header + part rows).
 */
export const AssistantTurnView: Component<{
    parts: () => AssistantPart[];
    streaming: boolean;
    /** Small attribution line (model / provider); optional when tools/thought imply a header. */
    headerLine: () => string | null;
    /** When set, shows per-message actions (e.g. metadata) on the header row. */
    metadataMsg?: () => store.ChatMessage | undefined;
}> = (props) => {
    const hasTools = () => props.parts().some((p) => p.kind === "tool");
    const hasThought = () => props.parts().some((p) => p.kind === "thought");
    const showHeader = () =>
        Boolean(props.headerLine()?.trim()) || hasTools() || hasThought();

    const metadata = () => props.metadataMsg?.();

    return (
        <div class="flex w-full min-w-0 flex-col items-stretch">
            <For each={props.parts()}>
                {(part, index) => (
                    <div class="flex w-full min-w-0 justify-start overflow-x-hidden py-1">
                        <div class="flex min-w-0 max-w-full flex-1 flex-col gap-1">
                            <Show when={index() === 0 && showHeader()}>
                                <div class="flex min-w-0 items-center gap-2">
                                    <Show when={props.headerLine()?.trim()}>
                                        <p class="min-w-0 flex-1 text-[10px] leading-tight text-slate-500">
                                            {props.headerLine()}
                                        </p>
                                    </Show>
                                    <Show when={metadata()}>
                                        {(msg) => (
                                            <AssistantMessageMetadataButton
                                                msg={msg()}
                                            />
                                        )}
                                    </Show>
                                </div>
                            </Show>
                            <AssistantPartMessageRow
                                part={part}
                                streaming={props.streaming}
                            />
                        </div>
                    </div>
                )}
            </For>
        </div>
    );
};
