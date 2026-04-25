import Loader2 from "lucide-solid/icons/loader-2";
import { splitProps, type Component, type JSX } from "solid-js";
import { cn } from "../utils";

export type SpinnerSize = "xs" | "sm" | "default" | "lg";
export type SpinnerTone =
    | "muted"
    | "default"
    | "starlight"
    | "nebula"
    | "flare";

export interface SpinnerProps extends JSX.HTMLAttributes<HTMLSpanElement> {
    size?: SpinnerSize;
    tone?: SpinnerTone;
    /**
     * Optional accessible label. When provided, the spinner is announced as a
     * status; otherwise it is `aria-hidden` and assumed to be paired with
     * surrounding text.
     */
    label?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
    xs: "size-3 stroke-[2.25]",
    sm: "size-3.5 stroke-2",
    default: "size-4 stroke-2",
    lg: "size-5 stroke-2",
};

const toneStyles: Record<SpinnerTone, string> = {
    muted: "text-void-500",
    default: "text-void-200",
    starlight: "text-starlight-300",
    nebula: "text-nebula-300",
    flare: "text-flare-300",
};

/**
 * Indeterminate spinner. Pair with `label` for screen readers when shown
 * standalone, or omit `label` when the spinner accompanies visible text
 * (e.g. "Loading branches…").
 */
export const Spinner: Component<SpinnerProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "size",
        "tone",
        "label",
    ]);
    const size = () => local.size ?? "default";
    const tone = () => local.tone ?? "muted";
    return (
        <span
            class={cn(
                "inline-flex shrink-0 items-center justify-center",
                local.class,
            )}
            role={local.label ? "status" : undefined}
            aria-label={local.label}
            aria-hidden={local.label ? undefined : true}
            {...rest}
        >
            <Loader2
                class={cn("animate-spin", sizeStyles[size()], toneStyles[tone()])}
                aria-hidden
            />
        </span>
    );
};
