import type { Component, JSX } from "solid-js";
import { For, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "../utils";

export type IconComponent = Component<
    JSX.SvgSVGAttributes<SVGSVGElement> & { "stroke-width"?: number }
>;

export interface VerticalNavItem {
    id: string;
    label: string;
    icon?: IconComponent;
}

/**
 * Render prop for the link element, so consumers can plug in their router's
 * `<A>` (e.g. `@solidjs/router`) without coupling this package to it.
 *
 * Defaults to a plain `<a href={...}>` so stories and simple consumers work
 * out of the box.
 */
export type VerticalNavLinkRenderer = (props: {
    href: string;
    class: string;
    children: JSX.Element;
}) => JSX.Element;

export interface VerticalNavProps {
    items: readonly VerticalNavItem[];
    baseHref: string;
    activeId: string;
    navLabel: string;
    class?: string;
    /** Override link rendering (e.g. router-aware `<A>`). */
    renderLink?: VerticalNavLinkRenderer;
}

const defaultRenderLink: VerticalNavLinkRenderer = (props) => (
    <a
        href={props.href}
        class={props.class}
    >
        {props.children}
    </a>
);

export const VerticalNav: Component<VerticalNavProps> = (props) => {
    const [local] = splitProps(props, [
        "items",
        "baseHref",
        "activeId",
        "navLabel",
        "class",
        "renderLink",
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
                        const linkClass = cn(
                            "flex w-full items-center gap-2.5 rounded-lg py-2 pr-3 pl-3 text-left text-[13px] font-medium transition-all duration-100 no-underline",
                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500/55",
                            active()
                                ? "bg-slate-800/50 text-slate-100"
                                : "text-slate-500 hover:bg-slate-800/25 hover:text-slate-300",
                        );
                        const renderLink =
                            local.renderLink ?? defaultRenderLink;
                        return renderLink({
                            href: `${local.baseHref}/${item.id}`,
                            class: linkClass,
                            children: (
                                <>
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
                                </>
                            ),
                        });
                    }}
                </For>
            </nav>
        </div>
    );
};
