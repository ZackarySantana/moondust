import AlertTriangle from "lucide-solid/icons/alert-triangle";
import CheckCircle2 from "lucide-solid/icons/check-circle-2";
import Info from "lucide-solid/icons/info";
import X from "lucide-solid/icons/x";
import XCircle from "lucide-solid/icons/x-circle";
import {
    Show,
    splitProps,
    type Component,
    type JSX,
    type ParentComponent,
} from "solid-js";
import { cn } from "../utils";

export type CalloutTone = "info" | "success" | "warn" | "danger" | "neutral";

export interface CalloutProps
    extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "title"> {
    tone?: CalloutTone;
    /** Leading title; rendered above the body in slightly stronger color. */
    title?: JSX.Element;
    /**
     * Override the leading icon. Pass an icon component (e.g. `Info`) or
     * `false` to hide the icon entirely. Defaults to a tone-appropriate icon.
     */
    icon?: Component<{ class?: string; "stroke-width"?: number }> | false;
    /** Optional trailing actions (buttons, links). */
    actions?: JSX.Element;
    /** Show a dismiss button. Calls `onDismiss` when clicked. */
    onDismiss?: () => void;
}

const toneStyles: Record<
    CalloutTone,
    { container: string; icon: string; title: string; body: string }
> = {
    info: {
        container: "border-nebula-400/30 bg-nebula-500/10",
        icon: "text-nebula-300",
        title: "text-nebula-100",
        body: "text-nebula-200",
    },
    success: {
        container: "border-starlight-400/30 bg-starlight-400/10",
        icon: "text-starlight-300",
        title: "text-starlight-100",
        body: "text-starlight-200",
    },
    warn: {
        container: "border-flare-400/25 bg-flare-500/8",
        icon: "text-flare-300",
        title: "text-flare-100",
        body: "text-flare-200",
    },
    danger: {
        container: "border-flare-400/40 bg-flare-500/15",
        icon: "text-flare-300",
        title: "text-flare-100",
        body: "text-flare-200",
    },
    neutral: {
        container: "border-void-700 bg-void-900",
        icon: "text-void-400",
        title: "text-void-100",
        body: "text-void-300",
    },
};

const defaultIcon: Record<
    CalloutTone,
    Component<{ class?: string; "stroke-width"?: number }>
> = {
    info: Info,
    success: CheckCircle2,
    warn: AlertTriangle,
    danger: XCircle,
    neutral: Info,
};

/**
 * Tonal notice block. Use sparingly — one or two per page — to call out
 * status, errors, or required follow-up. For inline transient feedback prefer
 * `NotificationToast`; for invariants and contextual hints, prefer `Tooltip`.
 *
 * Children render as the body; `title` is the optional heading line.
 */
export const Callout: ParentComponent<CalloutProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "tone",
        "title",
        "icon",
        "actions",
        "onDismiss",
        "children",
    ]);

    const tone = () => local.tone ?? "info";
    const styles = () => toneStyles[tone()];
    const Icon = () => {
        if (local.icon === false) return null;
        return local.icon ?? defaultIcon[tone()];
    };

    return (
        <div
            class={cn(
                "relative flex items-start gap-3 rounded-none border px-3.5 py-3",
                styles().container,
                local.class,
            )}
            role={
                tone() === "danger" || tone() === "warn" ? "alert" : "status"
            }
            {...rest}
        >
            <Show when={Icon()}>
                {(IconCmp) => {
                    const Cmp = IconCmp();
                    return (
                        <span
                            class={cn(
                                "mt-0.5 flex shrink-0 items-center justify-center",
                                styles().icon,
                            )}
                            aria-hidden
                        >
                            <Cmp class="size-4" stroke-width={1.75} />
                        </span>
                    );
                }}
            </Show>
            <div class="min-w-0 flex-1 space-y-1">
                <Show when={local.title}>
                    <p
                        class={cn(
                            "text-[13px] font-medium leading-tight",
                            styles().title,
                        )}
                    >
                        {local.title}
                    </p>
                </Show>
                <Show when={local.children}>
                    <div
                        class={cn(
                            "text-[12px] leading-relaxed",
                            styles().body,
                        )}
                    >
                        {local.children}
                    </div>
                </Show>
                <Show when={local.actions}>
                    <div class="flex flex-wrap items-center gap-2 pt-1">
                        {local.actions}
                    </div>
                </Show>
            </div>
            <Show when={local.onDismiss}>
                <button
                    type="button"
                    class={cn(
                        "shrink-0 cursor-pointer p-0.5 transition-colors hover:bg-void-800/40",
                        styles().icon,
                    )}
                    aria-label="Dismiss"
                    onClick={() => local.onDismiss?.()}
                >
                    <X class="size-3.5" stroke-width={2} aria-hidden />
                </button>
            </Show>
        </div>
    );
};
