import { splitProps, type Component, type JSX } from "solid-js";
import { cn } from "../utils";

export type StatusDotTone =
    | "neutral"
    | "starlight"
    | "nebula"
    | "flare"
    | "muted";

export type StatusDotSize = "xs" | "sm" | "default";

export interface StatusDotProps extends JSX.HTMLAttributes<HTMLSpanElement> {
    tone?: StatusDotTone;
    size?: StatusDotSize;
    /** Soft pulsing animation. Use for "live"/"in-progress" states. */
    pulse?: boolean;
    /**
     * Optional accessible label. When provided, the dot is announced as a
     * status; otherwise it is decorative and `aria-hidden`.
     */
    label?: string;
}

const toneStyles: Record<StatusDotTone, { bg: string; ring: string }> = {
    neutral: {
        bg: "bg-void-300",
        ring: "shadow-[0_0_0_2px_rgba(138,147,189,0.18)]",
    },
    starlight: {
        bg: "bg-starlight-300",
        ring: "shadow-[0_0_0_2px_rgba(232,194,72,0.22)]",
    },
    nebula: {
        bg: "bg-nebula-300",
        ring: "shadow-[0_0_0_2px_rgba(185,166,230,0.22)]",
    },
    flare: {
        bg: "bg-flare-400",
        ring: "shadow-[0_0_0_2px_rgba(232,119,102,0.22)]",
    },
    muted: {
        bg: "bg-void-500",
        ring: "shadow-[0_0_0_2px_rgba(61,69,116,0.20)]",
    },
};

const sizeStyles: Record<StatusDotSize, string> = {
    xs: "size-1",
    sm: "size-1.5",
    default: "size-2",
};

/**
 * Tiny status indicator. Pair with text (e.g. "Connected", "Streaming") or use
 * standalone in dense lists. Pulsing variant is intentionally subtle so a
 * sidebar full of streaming threads remains readable.
 */
export const StatusDot: Component<StatusDotProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "tone",
        "size",
        "pulse",
        "label",
    ]);
    const tone = () => local.tone ?? "neutral";
    const size = () => local.size ?? "sm";

    return (
        <span
            class={cn(
                "inline-flex shrink-0 items-center justify-center",
                local.class,
            )}
            role={local.label ? "status" : undefined}
            aria-label={local.label}
            aria-hidden={local.label ? undefined : true}
            title={local.label}
            {...rest}
        >
            <span
                class={cn(
                    "block rounded-full",
                    sizeStyles[size()],
                    toneStyles[tone()].bg,
                    toneStyles[tone()].ring,
                    local.pulse && "animate-pulse",
                )}
            />
        </span>
    );
};
