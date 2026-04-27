import type { Component, JSX, ParentComponent } from "solid-js";
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
    /** When set, used as the link target instead of `${baseHref}/${id}`. */
    href?: string;
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
    /**
     * When true, the nav fills the parent width only (use inside {@link VerticalNavRail}).
     * When false (default), the root applies `lg:w-48` for a standalone rail.
     */
    embedded?: boolean;
    /** Override link rendering (e.g. router-aware `<A>`). */
    renderLink?: VerticalNavLinkRenderer;
}

/** Row: fixed-width rail + fluid body (e.g. settings page). */
export const VerticalNavSplit: ParentComponent<{ class?: string }> = (props) => (
    <div class={cn("flex min-h-0 items-start gap-8", props.class)}>
        {props.children}
    </div>
);

/** Rail width matches standalone `VerticalNav` (`lg:w-48`). Override with `class` for nested rails. */
export const VerticalNavRail: ParentComponent<{ class?: string }> = (props) => (
    <div class={cn("w-full shrink-0 lg:w-48", props.class)}>{props.children}</div>
);

export const VerticalNavMain: ParentComponent<{ class?: string }> = (props) => (
    <div class={cn("min-h-0 min-w-0 flex-1", props.class)}>{props.children}</div>
);

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
        "embedded",
        "renderLink",
    ]);

    return (
        <div
            class={cn(
                local.embedded
                    ? "w-full min-w-0"
                    : "w-full shrink-0 lg:w-48",
                local.class,
            )}
        >
            <nav
                class="flex flex-col gap-0.5"
                aria-label={local.navLabel}
            >
                <For each={local.items}>
                    {(item) => {
                        const active = () => local.activeId === item.id;
                        const renderLink =
                            local.renderLink ?? defaultRenderLink;
                        // `class` must be read reactively: `<For>` does not re-run this row when
                        // only `activeId` changes, and a one-shot `cn(..., active())` would freeze
                        // the link background while icon `class` inside JSX still updates.
                        return renderLink({
                            href: item.href ?? `${local.baseHref}/${item.id}`,
                            get class() {
                                return cn(
                                    "flex w-full items-center gap-2.5 rounded-none border-l-2 py-2 pr-3 pl-3 text-left text-[13px] font-medium no-underline",
                                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-starlight-400/60",
                                    active()
                                        ? "border-starlight-400 bg-void-800 text-void-50"
                                        : "border-transparent text-void-400 hover:bg-void-800/60 hover:text-void-100",
                                );
                            },
                            children: (
                                <>
                                    {item.icon && (
                                        <Dynamic
                                            component={item.icon}
                                            class={cn(
                                                "size-4 shrink-0",
                                                active()
                                                    ? "text-starlight-300"
                                                    : "text-void-500",
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
