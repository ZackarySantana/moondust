import {
    Show,
    createEffect,
    splitProps,
    type Component,
    type JSX,
} from "solid-js";
import { pushModalEscapeHandler } from "@/lib/modal-escape-stack";
import { cn } from "@/lib/utils";

export interface DialogProps {
    open: boolean;
    children: JSX.Element;
    /**
     * Called when Escape is pressed while this dialog is open.
     * Handlers are stacked: the most recently opened dialog receives Escape first.
     * If omitted, `onClose` is used when provided.
     */
    onEscapeKeyDown?: () => void;
    /** Used for Escape when `onEscapeKeyDown` is omitted. Match overlay dismiss. */
    onClose?: () => void;
}

export const Dialog: Component<DialogProps> = (props) => {
    const [local] = splitProps(props, [
        "open",
        "children",
        "onEscapeKeyDown",
        "onClose",
    ]);

    createEffect(() => {
        if (!local.open) return;
        const onEsc = local.onEscapeKeyDown ?? local.onClose;
        if (!onEsc) return;
        return pushModalEscapeHandler(() => onEsc());
    });

    return (
        <Show when={local.open}>
            <div
                class="pointer-events-none fixed inset-0 z-100 flex items-center justify-center p-4"
                role="presentation"
            >
                {local.children}
            </div>
        </Show>
    );
};

export interface DialogOverlayProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    class?: string;
}

export const DialogOverlay: Component<DialogOverlayProps> = (props) => {
    const [local, rest] = splitProps(props, ["class"]);
    return (
        <button
            type="button"
            class={cn(
                "pointer-events-auto absolute inset-0 z-0 cursor-pointer bg-black/65 backdrop-blur-xs animate-overlay-in",
                local.class,
            )}
            {...rest}
        />
    );
};

export interface DialogContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
    class?: string;
}

export const DialogContent: Component<DialogContentProps> = (props) => {
    const [local, rest] = splitProps(props, ["class"]);
    return (
        <div
            class={cn(
                "pointer-events-auto relative z-10 w-full max-w-md rounded-xl border border-slate-800/60 bg-app-panel p-5 shadow-2xl shadow-black/40 ring-1 ring-white/3 animate-dialog-in",
                local.class,
            )}
            {...rest}
        />
    );
};

export interface DialogTitleProps extends JSX.HTMLAttributes<HTMLHeadingElement> {
    class?: string;
}

export const DialogTitle: Component<DialogTitleProps> = (props) => {
    const [local, rest] = splitProps(props, ["class"]);
    return (
        <h2
            class={cn(
                "mb-5 text-base font-semibold tracking-tight text-slate-100",
                local.class,
            )}
            {...rest}
        ></h2>
    );
};
