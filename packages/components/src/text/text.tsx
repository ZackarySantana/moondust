import { splitProps, type Component, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "../utils";

export type TextVariant =
    | "display"
    | "title"
    | "subtitle"
    | "body"
    | "small"
    | "eyebrow"
    | "caption"
    | "mono";

export type TextTone =
    | "default"
    | "strong"
    | "muted"
    | "subtle"
    | "starlight"
    | "nebula"
    | "flare";

export type TextWeight = "normal" | "medium" | "semibold";
export type TextAlign = "left" | "center" | "right";

export interface TextProps extends JSX.HTMLAttributes<HTMLElement> {
    variant?: TextVariant;
    tone?: TextTone;
    weight?: TextWeight;
    align?: TextAlign;
    /** Single-line ellipsis. Wraps content in `truncate` so the parent must constrain width. */
    truncate?: boolean;
    /** Override the rendered tag. Defaults to `p`. */
    as?: keyof JSX.IntrinsicElements;
}

const variantStyles: Record<TextVariant, string> = {
    display: "text-3xl font-semibold tracking-tight",
    title: "text-xl font-semibold tracking-tight",
    subtitle: "text-sm font-medium leading-snug",
    body: "text-[13px] leading-relaxed",
    small: "text-xs leading-relaxed",
    eyebrow: "font-mono text-[10px] uppercase tracking-[0.16em]",
    caption: "text-[11px] font-semibold uppercase tracking-widest",
    mono: "font-mono text-[12px] leading-relaxed",
};

const variantDefaultTone: Record<TextVariant, TextTone> = {
    display: "strong",
    title: "strong",
    subtitle: "strong",
    body: "default",
    small: "subtle",
    eyebrow: "muted",
    caption: "muted",
    mono: "default",
};

const toneStyles: Record<TextTone, string> = {
    default: "text-void-200",
    strong: "text-void-50",
    muted: "text-void-500",
    subtle: "text-void-400",
    starlight: "text-starlight-200",
    nebula: "text-nebula-200",
    flare: "text-flare-200",
};

const weightStyles: Record<TextWeight, string> = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
};

const alignStyles: Record<TextAlign, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
};

/**
 * Typography primitive. Pick a `variant` for size/family/letter-spacing,
 * a `tone` for color (defaulted per variant), and an optional `weight` /
 * `align` / `truncate`. Polymorphic via `as` (defaults to `<p>`).
 */
export const Text: Component<TextProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "variant",
        "tone",
        "weight",
        "align",
        "truncate",
        "as",
    ]);

    const variant = () => local.variant ?? "body";
    const tone = () => local.tone ?? variantDefaultTone[variant()];
    const tag = () => local.as ?? "p";

    return (
        <Dynamic
            component={tag()}
            class={cn(
                variantStyles[variant()],
                toneStyles[tone()],
                local.weight ? weightStyles[local.weight] : undefined,
                local.align ? alignStyles[local.align] : undefined,
                local.truncate ? "truncate" : undefined,
                local.class,
            )}
            {...rest}
        />
    );
};
