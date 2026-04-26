import ChevronRight from "lucide-solid/icons/chevron-right";
import { For, Show, splitProps, type Component, type JSX } from "solid-js";
import { cn } from "../utils";

export interface BreadcrumbSegment {
    /** Stable identifier for keyed rendering. */
    id: string;
    /** Visible label. */
    label: JSX.Element;
    /** Optional href; when present the segment becomes a link. */
    href?: string;
    /** Optional click handler (e.g. open a picker). Called as well for links. */
    onClick?: (e: MouseEvent) => void;
    /** Marks the final / current segment (rendered with stronger color). */
    current?: boolean;
}

export interface BreadcrumbProps extends JSX.HTMLAttributes<HTMLElement> {
    segments: readonly BreadcrumbSegment[];
    /** Override the segment renderer (e.g. router `<A>` for hrefs). */
    renderSegment?: (props: {
        segment: BreadcrumbSegment;
        class: string;
        children: JSX.Element;
    }) => JSX.Element;
    /** Tailwind class applied to the chevron separator. */
    separatorClass?: string;
}

const baseSegmentClass =
    "inline-flex max-w-[14rem] cursor-pointer items-center gap-1 truncate px-1.5 py-0.5 text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-starlight-400/60";

/**
 * Inline breadcrumb. Each segment can be a link, a button (picker trigger),
 * or static text. The last segment defaults to "current" — render with
 * `<Breadcrumb segments={[...]} />`.
 */
export const Breadcrumb: Component<BreadcrumbProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "segments",
        "renderSegment",
        "separatorClass",
    ]);

    function defaultRender(p: {
        segment: BreadcrumbSegment;
        class: string;
        children: JSX.Element;
    }): JSX.Element {
        const seg = p.segment;
        if (seg.href) {
            return (
                <a
                    href={seg.href}
                    class={p.class}
                    onClick={seg.onClick}
                >
                    {p.children}
                </a>
            );
        }
        if (seg.onClick) {
            return (
                <button
                    type="button"
                    class={p.class}
                    onClick={seg.onClick}
                >
                    {p.children}
                </button>
            );
        }
        return <span class={p.class}>{p.children}</span>;
    }

    return (
        <nav
            aria-label="Breadcrumb"
            class={cn("flex min-w-0 items-center gap-0.5", local.class)}
            {...rest}
        >
            <For each={local.segments}>
                {(segment, idx) => {
                    const last = () => idx() === local.segments.length - 1;
                    const isCurrent = () => segment.current ?? last();
                    const segClass = cn(
                        baseSegmentClass,
                        isCurrent()
                            ? "text-void-50 font-medium"
                            : "text-void-400 hover:text-void-100 hover:bg-void-800/60",
                    );
                    const render = local.renderSegment ?? defaultRender;
                    return (
                        <>
                            <Show when={idx() > 0}>
                                <ChevronRight
                                    class={cn(
                                        "size-3 shrink-0 text-void-600",
                                        local.separatorClass,
                                    )}
                                    stroke-width={2}
                                    aria-hidden
                                />
                            </Show>
                            {render({
                                segment,
                                class: segClass,
                                children: (
                                    <span class="truncate">
                                        {segment.label}
                                    </span>
                                ),
                            })}
                        </>
                    );
                }}
            </For>
        </nav>
    );
};
