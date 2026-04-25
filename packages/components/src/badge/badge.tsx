import { splitProps, type Component, type JSX } from "solid-js";
import { cn } from "../utils";

export type BadgeTone =
    | "neutral"
    | "starlight"
    | "nebula"
    | "flare"
    | "outline";

export type BadgeSize = "sm" | "default";

export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
    /**
     * Tonal color of the badge. Defaults to `neutral` (void surface).
     *
     * - `neutral`: void surface, used for counts and inert metadata.
     * - `starlight`: brand gold, reserved for "primary" / "selected" status.
     * - `nebula`: cosmic violet, used for live identifiers and informational state.
     * - `flare`: warm sun, reserved for warnings and destructive states.
     * - `outline`: hollow ring, used when the surrounding surface should show through.
     */
    tone?: BadgeTone;
    size?: BadgeSize;
    /**
     * Renders a small filled circle on the left. Useful for status indicators
     * (e.g. "live", "running", "queued").
     */
    dot?: boolean;
    /**
     * Renders the badge with a uniform monospaced font and tabular numerals.
     * Use for numeric counts and short identifiers.
     */
    mono?: boolean;
}

const toneStyles: Record<BadgeTone, string> = {
    neutral: "bg-void-800 text-void-200 border border-void-700",
    starlight:
        "bg-starlight-400/15 text-starlight-200 border border-starlight-400/30",
    nebula: "bg-nebula-500/15 text-nebula-200 border border-nebula-400/30",
    flare: "bg-flare-500/15 text-flare-200 border border-flare-400/30",
    outline: "border border-void-600 text-void-300",
};

const dotStyles: Record<BadgeTone, string> = {
    neutral: "bg-void-400",
    starlight: "bg-starlight-300",
    nebula: "bg-nebula-300",
    flare: "bg-flare-300",
    outline: "bg-void-400",
};

const sizeStyles: Record<BadgeSize, string> = {
    sm: "h-4 px-1.5 text-[10px] gap-1",
    default: "h-5 px-2 text-[11px] gap-1.5",
};

const dotSize: Record<BadgeSize, string> = {
    sm: "size-1",
    default: "size-1.5",
};

export const Badge: Component<BadgeProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "tone",
        "size",
        "dot",
        "mono",
        "children",
    ]);

    const tone = () => local.tone ?? "neutral";
    const size = () => local.size ?? "default";

    return (
        <span
            class={cn(
                "inline-flex items-center justify-center rounded-none font-medium uppercase tracking-[0.1em] leading-none whitespace-nowrap",
                toneStyles[tone()],
                sizeStyles[size()],
                local.mono && "font-mono tabular-nums normal-case tracking-normal",
                local.class,
            )}
            {...rest}
        >
            {local.dot && (
                <span
                    class={cn(
                        "shrink-0 rounded-none",
                        dotSize[size()],
                        dotStyles[tone()],
                    )}
                    aria-hidden
                />
            )}
            {local.children}
        </span>
    );
};
