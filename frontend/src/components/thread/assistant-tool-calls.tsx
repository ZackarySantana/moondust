import Check from "lucide-solid/icons/check";
import type { Component } from "solid-js";
import { createSignal, Show } from "solid-js";
import { CollapsibleGhostRow } from "@/components/thread/collapsible-ghost-row";
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
    const isDone = () => !isRunning() && !!props.tc.output?.trim();

    return (
        <CollapsibleGhostRow
            expanded={expanded()}
            onToggle={() => setExpanded(!expanded())}
            showBusy={isRunning()}
            ariaLabelExpanded={`Collapse ${props.tc.name}`}
            ariaLabelCollapsed={`Expand ${props.tc.name}`}
            body={
                <div class="ml-4 mt-1 overflow-hidden rounded-lg border border-slate-800/40 bg-slate-900/30">
                    <Show when={props.tc.arguments?.trim()}>
                        <div class="border-b border-slate-800/30 px-3 py-2">
                            <p class="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-slate-600">
                                Arguments
                            </p>
                            <pre class="max-h-48 overflow-y-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-400 wrap-anywhere">
                                {props.tc.arguments}
                            </pre>
                        </div>
                    </Show>
                    <Show when={props.tc.output?.trim()}>
                        <div class="px-3 py-2">
                            <p class="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-slate-600">
                                Result
                            </p>
                            <pre class="max-h-52 overflow-y-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-400 wrap-anywhere">
                                {props.tc.output}
                            </pre>
                        </div>
                    </Show>
                </div>
            }
        >
            <span class="flex items-center gap-1.5">
                <span class="font-mono text-slate-400">{props.tc.name}</span>
                <Show when={isDone()}>
                    <span class="flex size-3.5 items-center justify-center rounded-full bg-emerald-500/15">
                        <Check
                            class="size-2.5 text-emerald-400/80"
                            stroke-width={2.5}
                            aria-hidden
                        />
                    </span>
                </Show>
            </span>
        </CollapsibleGhostRow>
    );
};
