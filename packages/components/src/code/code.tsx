import { splitProps, type Component, type JSX } from "solid-js";
import { cn } from "../utils";

export type CodeTone = "neutral" | "subtle" | "starlight" | "nebula" | "flare";
export type CodeSize = "sm" | "default";

export interface CodeProps extends JSX.HTMLAttributes<HTMLElement> {
    /**
     * Tonal color of the chip. Defaults to `neutral` (void surface).
     *
     * - `neutral`: dark surface chip, the default for inline tokens.
     * - `subtle`: no background, only color — useful inside paragraphs where the
     *   chip would otherwise overwhelm the line.
     * - `starlight`: brand gold; reserved for primary identifiers.
     * - `nebula`: cosmic violet; ideal for branch names, model ids, paths.
     * - `flare`: warm sun; for destructive/error tokens.
     */
    tone?: CodeTone;
    size?: CodeSize;
}

const toneStyles: Record<CodeTone, string> = {
    neutral: "bg-void-900 text-void-200 border border-void-700",
    subtle: "text-void-300",
    starlight:
        "bg-starlight-400/10 text-starlight-200 border border-starlight-400/25",
    nebula: "bg-nebula-500/10 text-nebula-200 border border-nebula-400/25",
    flare: "bg-flare-500/10 text-flare-200 border border-flare-400/25",
};

const sizeStyles: Record<CodeSize, string> = {
    sm: "text-[10px] px-1 py-px",
    default: "text-[11px] px-1.5 py-0.5",
};

/**
 * Inline monospace token chip. Use for keywords, command names, branch names,
 * file paths, env keys — anything that should be visually called out as
 * "literal". Use a `<pre>` block for multi-line code samples instead.
 */
export const Code: Component<CodeProps> = (props) => {
    const [local, rest] = splitProps(props, ["class", "tone", "size"]);
    const tone = () => local.tone ?? "neutral";
    const size = () => local.size ?? "default";

    return (
        <code
            class={cn(
                "inline-flex items-center rounded-none font-mono leading-none whitespace-nowrap",
                toneStyles[tone()],
                sizeStyles[size()],
                local.class,
            )}
            {...rest}
        />
    );
};
