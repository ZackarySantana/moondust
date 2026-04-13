import ChevronDown from "lucide-solid/icons/chevron-down";
import ChevronRight from "lucide-solid/icons/chevron-right";
import Wrench from "lucide-solid/icons/wrench";
import type { Component } from "solid-js";
import { createSignal, Show } from "solid-js";
import { Button } from "@/components/ui/button";
import type { StreamToolPayload } from "@/lib/chat-stream-sidebar-store";
import type { store } from "@wails/go/models";

export type ToolCallRowPayload =
    | store.OpenRouterToolCallRecord
    | StreamToolPayload;

/**
 * One tool invocation as its own chat row: ghost toggle (like “Thought”) + expanded
 * request (arguments) and response (result).
 */
export const AssistantToolCallMessageRow: Component<{
    tc: ToolCallRowPayload;
}> = (props) => {
    const [expanded, setExpanded] = createSignal(false);

    return (
        <div class="flex w-full min-w-0 flex-col">
            <div class="flex gap-2.5 py-1">
                <div class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-slate-800/50">
                    <Wrench
                        class="size-3.5 text-slate-500/80"
                        stroke-width={1.5}
                        aria-hidden
                    />
                </div>
                <div class="flex min-w-0 flex-1 flex-col gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        class="h-7 w-fit shrink-0 gap-0.5 px-2 text-[10px] font-normal text-slate-500 hover:text-slate-400"
                        aria-expanded={expanded()}
                        aria-label={
                            expanded()
                                ? `Hide ${props.tc.name} details`
                                : `Show ${props.tc.name} details`
                        }
                        onClick={() => setExpanded(!expanded())}
                    >
                        <span class="font-mono">{props.tc.name}</span>
                        <Show
                            when={expanded()}
                            fallback={
                                <ChevronRight
                                    class="size-3 text-slate-500"
                                    stroke-width={2}
                                    aria-hidden
                                />
                            }
                        >
                            <ChevronDown
                                class="size-3 text-slate-500"
                                stroke-width={2}
                                aria-hidden
                            />
                        </Show>
                    </Button>
                    <Show when={expanded()}>
                        <div class="rounded-md border border-slate-700/35 bg-slate-900/40">
                            <Show when={props.tc.arguments?.trim()}>
                                <div class="border-b border-slate-700/25 px-2 py-2 last:border-b-0">
                                    <p class="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                                        Arguments
                                    </p>
                                    <pre class="max-h-48 overflow-y-auto whitespace-pre-wrap font-mono text-[10px] leading-snug text-slate-400">
                                        {props.tc.arguments}
                                    </pre>
                                </div>
                            </Show>
                            <Show when={props.tc.output?.trim()}>
                                <div class="px-2 py-2">
                                    <p class="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                                        Result
                                    </p>
                                    <pre class="max-h-52 overflow-y-auto whitespace-pre-wrap font-mono text-[10px] leading-snug text-slate-400">
                                        {props.tc.output}
                                    </pre>
                                </div>
                            </Show>
                        </div>
                    </Show>
                </div>
            </div>
        </div>
    );
};
