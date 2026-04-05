import { A } from "@solidjs/router";
import { For, splitProps, type Component } from "solid-js";
import { cn } from "@/lib/utils";

export interface VerticalNavItem {
    id: string;
    label: string;
}

export interface VerticalNavProps {
    items: readonly VerticalNavItem[];
    /** Base path without trailing slash, e.g. `/settings` */
    baseHref: string;
    /** Segment used for active styling, e.g. `projects` from `/settings/projects` */
    activeId: string;
    /** Accessible name for the nav landmark */
    navLabel: string;
    class?: string;
}

export const VerticalNav: Component<VerticalNavProps> = (props) => {
    const [local] = splitProps(props, [
        "items",
        "baseHref",
        "activeId",
        "navLabel",
        "class",
    ]);

    return (
        <div class={cn("w-full shrink-0 lg:w-52", local.class)}>
            <nav
                class="flex flex-col gap-0.5"
                aria-label={local.navLabel}
            >
                <For each={local.items}>
                    {(item) => (
                        <A
                            href={`${local.baseHref}/${item.id}`}
                            class={cn(
                                "block w-full rounded-md border-l-2 py-2 pr-2 pl-3 text-left text-sm font-medium transition-colors no-underline",
                                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400/60",
                                local.activeId === item.id
                                    ? "border-sky-500 bg-slate-800/50 text-slate-100"
                                    : "border-transparent text-slate-400 hover:bg-slate-800/30 hover:text-slate-200",
                            )}
                        >
                            {item.label}
                        </A>
                    )}
                </For>
            </nav>
        </div>
    );
};
