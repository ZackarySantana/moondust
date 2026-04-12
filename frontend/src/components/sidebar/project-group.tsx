import { A } from "@solidjs/router";
import ChevronRight from "lucide-solid/icons/chevron-right";
import Plus from "lucide-solid/icons/plus";
import SettingsIcon from "lucide-solid/icons/settings";
import type { ParentComponent } from "solid-js";

export const ProjectGroup: ParentComponent<{
    id?: string;
    name: string;
    title?: string;
    shortcutHint?: string;
    onNewThread?: () => void;
}> = (props) => {
    return (
        <details
            class="group/project"
            open
        >
            <summary class="flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-slate-300 transition-colors duration-100 hover:bg-slate-800/30 [&::-webkit-details-marker]:hidden">
                <ChevronRight
                    class="size-3 shrink-0 text-slate-600 transition-transform duration-150 group-open/project:rotate-90"
                    stroke-width={2.5}
                    aria-hidden
                />
                <span
                    class="min-w-0 flex-1 truncate"
                    title={props.title}
                >
                    {props.name}
                </span>
                {props.id && (
                    <div class="relative shrink-0">
                        <kbd class="pointer-events-none absolute right-full top-1/2 mr-1 -translate-y-1/2 rounded border border-slate-700/50 bg-slate-800/40 px-1 py-0.5 font-mono text-[9px] leading-none text-slate-500 opacity-0 transition-opacity group-hover/project:opacity-100">
                            {props.shortcutHint}
                        </kbd>
                        <button
                            type="button"
                            class="cursor-pointer rounded-md p-1 text-slate-600 opacity-0 transition-all duration-100 hover:bg-slate-800/50 hover:text-slate-300 group-hover/project:opacity-100"
                            aria-label={`New thread in ${props.name}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                props.onNewThread?.();
                            }}
                        >
                            <Plus
                                class="size-3.5"
                                stroke-width={2}
                                aria-hidden
                            />
                        </button>
                    </div>
                )}
                {props.id && (
                    <A
                        href={`/project/${props.id}/settings`}
                        class="shrink-0 cursor-pointer rounded-md p-1 text-slate-600 opacity-0 transition-all duration-100 hover:bg-slate-800/50 hover:text-slate-300 group-hover/project:opacity-100"
                        aria-label={`${props.name} settings`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SettingsIcon
                            class="size-3.5"
                            stroke-width={2}
                            aria-hidden
                        />
                    </A>
                )}
            </summary>
            <div class="ml-[18px] border-l border-slate-800/30 pl-2 pt-0.5 pb-1">
                {props.children}
            </div>
        </details>
    );
};
