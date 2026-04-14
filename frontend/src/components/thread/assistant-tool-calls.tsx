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

    return (
        <CollapsibleGhostRow
            expanded={expanded()}
            onToggle={() => setExpanded(!expanded())}
            showBusy={isRunning()}
            ariaLabelExpanded={`Collapse ${props.tc.name}`}
            ariaLabelCollapsed={`Expand ${props.tc.name}`}
            body={
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
            }
        >
            <span class="font-mono">{props.tc.name}</span>
            <Show when={isRunning()}>
                <span class="text-[10px] text-slate-600">running…</span>
            </Show>
        </CollapsibleGhostRow>
    );
};
