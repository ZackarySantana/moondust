import ChevronRight from "lucide-solid/icons/chevron-right";
import Loader2 from "lucide-solid/icons/loader-2";
import type { JSX } from "solid-js";
import { Show } from "solid-js";

const ghostTriggerBase =
    "flex w-fit items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] transition-all duration-150 select-none";
const ghostTriggerIdle =
    "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300";
const ghostTriggerBusy = "text-slate-400";

/**
 * Shared chrome for transcript rows that use a ghost-style toggle (thought, tool calls).
 * Leading slot is either a busy spinner or expand/collapse chevron.
 */
export function CollapsibleGhostRow(props: {
    expanded: boolean;
    onToggle: () => void;
    showBusy?: boolean;
    ariaLabelExpanded: string;
    ariaLabelCollapsed: string;
    children: JSX.Element;
    body?: JSX.Element;
}) {
    return (
        <div class="flex flex-col">
            <button
                type="button"
                onClick={() => props.onToggle()}
                class={`${ghostTriggerBase} ${props.showBusy ? ghostTriggerBusy : ghostTriggerIdle}`}
                aria-expanded={props.expanded}
                aria-label={
                    props.expanded
                        ? props.ariaLabelExpanded
                        : props.ariaLabelCollapsed
                }
            >
                <Show
                    when={props.showBusy}
                    fallback={
                        <ChevronRight
                            class="size-3 shrink-0 transition-transform duration-150"
                            classList={{ "rotate-90": props.expanded }}
                            stroke-width={2}
                            aria-hidden
                        />
                    }
                >
                    <Loader2
                        class="size-3 shrink-0 animate-spin text-emerald-500/70"
                        stroke-width={2}
                        aria-hidden
                    />
                </Show>
                {props.children}
            </button>
            <div
                class="grid transition-[grid-template-rows] duration-200 ease-out"
                style={{
                    "grid-template-rows": props.expanded ? "1fr" : "0fr",
                }}
            >
                <div class="overflow-hidden">
                    {props.body}
                </div>
            </div>
        </div>
    );
}
