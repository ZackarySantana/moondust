import AlertTriangle from "lucide-solid/icons/alert-triangle";
import Info from "lucide-solid/icons/info";
import {
    Show,
    createEffect,
    onCleanup,
    type Component,
    type JSX,
} from "solid-js";
import { Button } from "../button/button";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTitle,
} from "../dialog/dialog";
import { Spinner } from "../spinner/spinner";
import { cn } from "../utils";

export type ConfirmTone = "neutral" | "danger";

export interface ConfirmDialogProps {
    open: boolean;
    title: JSX.Element;
    /** Body text or arbitrary JSX (e.g. with inline `Code`). Optional. */
    children?: JSX.Element;
    /** Tonal treatment of the confirm action. Defaults to `neutral`. */
    tone?: ConfirmTone;
    confirmLabel?: string;
    cancelLabel?: string;
    /** Show a spinner on the confirm button and lock interaction. */
    pending?: boolean;
    /** Optional error message shown above the action buttons. */
    error?: string;
    /**
     * If true, Enter triggers confirm. Default: true. Disable when the body
     * contains form fields that need their own Enter handling.
     */
    confirmOnEnter?: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

const titleStyles: Record<ConfirmTone, string> = {
    neutral: "text-void-50",
    danger: "text-flare-100",
};

const iconStyles: Record<ConfirmTone, string> = {
    neutral: "text-nebula-300",
    danger: "text-flare-300",
};

/**
 * Standard confirm/cancel modal. Use for destructive actions ("Delete this
 * thread?"), risky operations ("Force-push?"), or any decision the user
 * should explicitly opt into. For text-input dialogs, prefer building on
 * `Dialog` directly.
 */
export const ConfirmDialog: Component<ConfirmDialogProps> = (props) => {
    createEffect(() => {
        if (!props.open) return;
        if (props.confirmOnEnter === false) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Enter") return;
            if (props.pending) return;
            const target = e.target as HTMLElement | null;
            if (
                target &&
                (target.tagName === "TEXTAREA" ||
                    (target.tagName === "INPUT" &&
                        (target as HTMLInputElement).type !== "button"))
            ) {
                return;
            }
            e.preventDefault();
            props.onConfirm();
        };
        document.addEventListener("keydown", onKey);
        onCleanup(() => document.removeEventListener("keydown", onKey));
    });

    const tone = () => props.tone ?? "neutral";

    return (
        <Dialog
            open={props.open}
            onEscapeKeyDown={() => {
                if (!props.pending) props.onClose();
            }}
        >
            <DialogOverlay
                aria-label="Close dialog"
                onClick={() => {
                    if (!props.pending) props.onClose();
                }}
            />
            <DialogContent role="alertdialog" aria-modal="true">
                <div class="mb-4 flex items-start gap-3">
                    <span
                        class={cn(
                            "mt-0.5 flex shrink-0 items-center justify-center",
                            iconStyles[tone()],
                        )}
                        aria-hidden
                    >
                        <Show
                            when={tone() === "danger"}
                            fallback={<Info class="size-4" stroke-width={1.75} />}
                        >
                            <AlertTriangle class="size-4" stroke-width={1.75} />
                        </Show>
                    </span>
                    <DialogTitle
                        class={cn("mb-0 text-base", titleStyles[tone()])}
                    >
                        {props.title}
                    </DialogTitle>
                </div>
                <Show when={props.children}>
                    <div class="mb-4 pl-7 text-sm leading-relaxed text-void-300">
                        {props.children}
                    </div>
                </Show>
                <Show when={props.error}>
                    <p class="mb-4 rounded-none border border-flare-600/40 bg-flare-700/10 px-3 py-2 text-xs text-flare-300">
                        {props.error}
                    </p>
                </Show>
                <div class="flex items-center justify-end gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => props.onClose()}
                        disabled={props.pending}
                    >
                        {props.cancelLabel ?? "Cancel"}
                    </Button>
                    <Button
                        variant={
                            tone() === "danger" ? "destructive" : "default"
                        }
                        onClick={() => props.onConfirm()}
                        disabled={props.pending}
                        class="min-w-[6rem]"
                    >
                        <Show
                            when={props.pending}
                            fallback={props.confirmLabel ?? "Confirm"}
                        >
                            <Spinner
                                size="sm"
                                tone={
                                    tone() === "danger" ? "default" : "default"
                                }
                            />
                            <span>Working…</span>
                        </Show>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
