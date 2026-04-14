import Bot from "lucide-solid/icons/bot";
import Wrench from "lucide-solid/icons/wrench";
import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import { AssistantMessageMetadataButton } from "@/components/assistant-message-metadata";
import { AssistantPartMessageRow } from "@/components/thread/assistant-message-parts";
import type { AssistantPart } from "@/lib/chat/types";
import type { store } from "@wails/go/models";

const iconColClass = "flex w-5 shrink-0 justify-center pt-0.5";

function partLeadingIcon(part: AssistantPart) {
    if (part.kind === "text") {
        return (
            <Bot
                class="size-3.5 text-slate-500"
                stroke-width={2}
                aria-hidden
            />
        );
    }
    if (part.kind === "tool") {
        return (
            <Wrench
                class="size-3.5 text-slate-500"
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
                    <div class="flex w-full min-w-0 flex-col gap-1 overflow-x-hidden py-1">
                        <Show when={index() === 0 && showHeader()}>
                            <div class="flex min-w-0 gap-2">
                                <div
                                    class="w-5 shrink-0"
                                    aria-hidden
                                />
                                <div class="flex min-w-0 flex-1 items-center gap-2">
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
                            </div>
                        </Show>
                        <div class="flex min-w-0 gap-2">
                            <div class={iconColClass}>
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
