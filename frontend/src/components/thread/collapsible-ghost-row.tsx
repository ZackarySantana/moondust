import ChevronDown from "lucide-solid/icons/chevron-down";
import ChevronRight from "lucide-solid/icons/chevron-right";
import Loader2 from "lucide-solid/icons/loader-2";
import type { JSX } from "solid-js";
import { Show } from "solid-js";

const ghostTriggerClass =
    "flex w-fit items-center gap-1.5 rounded px-1 py-0.5 text-[11px] text-slate-500 transition-colors hover:bg-slate-800/40 hover:text-slate-400";

/**
 * Shared chrome for transcript rows that use a ghost-style toggle (thought, tool calls).
 * Leading slot is either a busy spinner or expand/collapse chevrons.
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
        <div class="flex flex-col gap-0.5">
            <button
                type="button"
                onClick={() => props.onToggle()}
                class={ghostTriggerClass}
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
                        <Show
                            when={props.expanded}
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
                {props.children}
            </button>
            <Show when={props.expanded}>{props.body}</Show>
        </div>
    );
}
