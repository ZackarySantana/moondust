import ChevronDown from "lucide-solid/icons/chevron-down";
import ChevronRight from "lucide-solid/icons/chevron-right";
import Loader2 from "lucide-solid/icons/loader-2";
import type { Component } from "solid-js";
import { createSignal, Show } from "solid-js";
import type { StreamToolPayload } from "@/lib/chat-stream-sidebar-store";
import type { store } from "@wails/go/models";

export type ToolCallRowPayload =
    | store.OpenRouterToolCallRecord
    | StreamToolPayload;

export const AssistantToolCallMessageRow: Component<{
    tc: ToolCallRowPayload;
    streaming?: boolean;
}> = (props) => {
    const [expanded, setExpanded] = createSignal(false);
    const isRunning = () => !!props.streaming && !props.tc.output?.trim();

    return (
        <div class="flex flex-col gap-0.5">
            <button
                type="button"
                onClick={() => setExpanded(!expanded())}
                class="flex w-fit items-center gap-1.5 rounded px-1 py-0.5 text-[11px] text-slate-500 transition-colors hover:bg-slate-800/40 hover:text-slate-400"
                aria-expanded={expanded()}
                aria-label={
                    expanded()
                        ? `Collapse ${props.tc.name}`
                        : `Expand ${props.tc.name}`
                }
            >
                <Show
                    when={isRunning()}
                    fallback={
                        <Show
                            when={expanded()}
                            fallback={
                                <ChevronRight
                                    class="size-3 shrink-0"
                                    stroke-width={2}
                                    aria-hidden
                                />
                            }
                        >
                            <ChevronDown
                                class="size-3 shrink-0"
                                stroke-width={2}
                                aria-hidden
                            />
                        </Show>
                    }
                >
                    <Loader2
                        class="size-3 shrink-0 animate-spin"
                        stroke-width={2}
                        aria-hidden
                    />
                </Show>
                <span class="font-mono">{props.tc.name}</span>
                <Show when={isRunning()}>
                    <span class="text-[10px] text-slate-600">running…</span>
                </Show>
            </button>
            <Show when={expanded()}>
                <div class="ml-1 overflow-hidden rounded-md border border-slate-700/30 bg-slate-900/50">
                    <Show when={props.tc.arguments?.trim()}>
                        <div class="border-b border-slate-700/25 px-3 py-2">
                            <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                                Arguments
                            </p>
                            <pre class="max-h-48 overflow-y-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-400 wrap-anywhere">
                                {props.tc.arguments}
                            </pre>
                        </div>
                    </Show>
                    <Show when={props.tc.output?.trim()}>
                        <div class="px-3 py-2">
                            <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                                Result
                            </p>
                            <pre class="max-h-52 overflow-y-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-400 wrap-anywhere">
                                {props.tc.output}
                            </pre>
                        </div>
                    </Show>
                </div>
            </Show>
        </div>
    );
};
