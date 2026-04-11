import { A } from "@solidjs/router";
import type { Component, JSX } from "solid-js";
import { For, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "@/lib/utils";

export type IconComponent = Component<
    JSX.SvgSVGAttributes<SVGSVGElement> & { "stroke-width"?: number }
>;

export interface VerticalNavItem {
    id: string;
    label: string;
    icon?: IconComponent;
}

export interface VerticalNavProps {
    items: readonly VerticalNavItem[];
    baseHref: string;
    activeId: string;
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
        <div class={cn("w-full shrink-0 lg:w-48", local.class)}>
            <nav
                class="flex flex-col gap-0.5"
                aria-label={local.navLabel}
            >
                <For each={local.items}>
                    {(item) => {
                        const active = () => local.activeId === item.id;
                        return (
                            <A
                                href={`${local.baseHref}/${item.id}`}
                                class={cn(
                                    "flex w-full items-center gap-2.5 rounded-lg py-2 pr-3 pl-3 text-left text-[13px] font-medium transition-all duration-100 no-underline",
                                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500/55",
                                    active()
                                        ? "bg-slate-800/50 text-slate-100"
                                        : "text-slate-500 hover:bg-slate-800/25 hover:text-slate-300",
                                )}
                            >
                                {item.icon && (
                                    <Dynamic
                                        component={item.icon}
                                        class={cn(
                                            "size-4 shrink-0 transition-colors duration-100",
                                            active()
                                                ? "text-emerald-500/80"
                                                : "text-slate-600",
                                        )}
                                        stroke-width={1.75}
                                        aria-hidden
                                    />
                                )}
                                {item.label}
                            </A>
                        );
                    }}
                </For>
            </nav>
        </div>
    );
};
