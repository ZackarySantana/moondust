import X from "lucide-solid/icons/x";
import {
    Show,
    splitProps,
    type Component,
    type JSX,
    type ParentComponent,
} from "solid-js";
import { cn } from "../utils";

export type ChipTone =
    | "neutral"
    | "starlight"
    | "nebula"
    | "flare"
    | "outline";

export type ChipSize = "sm" | "default";

export interface ChipProps extends JSX.HTMLAttributes<HTMLSpanElement> {
    /** Optional leading icon. Sized automatically by `size`. */
    icon?: Component<{ class?: string; "stroke-width"?: number }>;
    tone?: ChipTone;
    size?: ChipSize;
    /**
     * Render as a `<button>` and apply the selected/pressed visual treatment.
     * Useful for filter chips and tag pickers.
     */
    selectable?: boolean;
    /** Required when `selectable` is true; mirrors `aria-pressed`. */
    selected?: boolean;
    /** Show a trailing dismiss button. Calls `onRemove` when clicked. */
    onRemove?: () => void;
    /** Callback for `selectable` chip clicks. */
    onSelect?: () => void;
}

const toneStyles: Record<
    ChipTone,
    { idle: string; selected: string; icon: string }
> = {
    neutral: {
        idle: "bg-void-800 text-void-200 border border-void-700",
        selected: "bg-void-700 text-void-50 border border-void-600",
        icon: "text-void-400",
    },
    starlight: {
        idle: "bg-starlight-400/10 text-starlight-200 border border-starlight-400/25",
        selected:
            "bg-starlight-400/25 text-starlight-100 border border-starlight-300/50",
        icon: "text-starlight-300",
    },
    nebula: {
        idle: "bg-nebula-500/10 text-nebula-200 border border-nebula-400/25",
        selected:
            "bg-nebula-500/25 text-nebula-100 border border-nebula-300/50",
        icon: "text-nebula-300",
    },
    flare: {
        idle: "bg-flare-500/10 text-flare-200 border border-flare-400/25",
        selected:
            "bg-flare-500/25 text-flare-100 border border-flare-300/50",
        icon: "text-flare-300",
    },
    outline: {
        idle: "border border-void-600 text-void-300",
        selected: "border border-void-500 bg-void-800 text-void-100",
        icon: "text-void-400",
    },
};

const sizeStyles: Record<ChipSize, { container: string; icon: string }> = {
    sm: { container: "h-5 px-1.5 text-[10px] gap-1", icon: "size-2.5" },
    default: { container: "h-6 px-2 text-[11px] gap-1.5", icon: "size-3" },
};

/**
 * Compact, optionally-iconic chip. Use for capabilities (e.g. "Vision",
 * "Reasoning"), tags, filters. For status / counts / identifier badges,
 * prefer `Badge`.
 */
export const Chip: ParentComponent<ChipProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "icon",
        "tone",
        "size",
        "selectable",
        "selected",
        "onRemove",
        "onSelect",
        "children",
    ]);

    const tone = () => local.tone ?? "neutral";
    const size = () => local.size ?? "default";
    const sz = () => sizeStyles[size()];
    const ts = () => toneStyles[tone()];

    const baseClass = cn(
        "inline-flex items-center justify-center rounded-none font-medium leading-none whitespace-nowrap",
        sz().container,
        local.selectable && local.selected ? ts().selected : ts().idle,
        local.selectable &&
            "cursor-pointer transition-colors hover:bg-void-800/60",
        local.class,
    );

    const innerContent = (
        <>
            <Show when={local.icon}>
                {(IconCmp) => {
                    const Cmp = IconCmp();
                    return (
                        <Cmp
                            class={cn("shrink-0", sz().icon, ts().icon)}
                            stroke-width={2.25}
                            aria-hidden
                        />
                    );
                }}
            </Show>
            <span class="min-w-0 truncate">{local.children}</span>
            <Show when={local.onRemove}>
                <button
                    type="button"
                    class={cn(
                        "ml-0.5 -mr-0.5 inline-flex shrink-0 cursor-pointer items-center justify-center transition-colors hover:bg-void-800/60",
                        sz().icon === "size-2.5" ? "size-3" : "size-3.5",
                    )}
                    aria-label="Remove"
                    onClick={(e) => {
                        e.stopPropagation();
                        local.onRemove?.();
                    }}
                >
                    <X
                        class={sz().icon}
                        stroke-width={2.5}
                        aria-hidden
                    />
                </button>
            </Show>
        </>
    );

    if (local.selectable) {
        return (
            <button
                type="button"
                class={baseClass}
                aria-pressed={local.selected}
                onClick={() => local.onSelect?.()}
            >
                {innerContent}
            </button>
        );
    }

    return (
        <span class={baseClass} {...rest}>
            {innerContent}
        </span>
    );
};
