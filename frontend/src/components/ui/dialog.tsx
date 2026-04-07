import { Show, splitProps, type Component, type JSX } from "solid-js";
import { cn } from "@/lib/utils";

export interface DialogProps {
    open: boolean;
    children: JSX.Element;
}

export const Dialog: Component<DialogProps> = (props) => {
    return (
        <Show when={props.open}>
            <div
                class="fixed inset-0 z-100 flex items-center justify-center p-4"
                role="presentation"
            >
                {props.children}
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
                "absolute inset-0 bg-black/65 backdrop-blur-xs animate-overlay-in",
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
                "relative z-10 w-full max-w-md rounded-xl border border-slate-800/60 bg-app-panel p-5 shadow-2xl shadow-black/40 ring-1 ring-white/3 animate-dialog-in",
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
