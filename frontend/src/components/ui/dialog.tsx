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
            class={cn("absolute inset-0 bg-black/55", local.class)}
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
                "relative z-10 w-full max-w-md rounded-lg border border-slate-700/80 bg-[rgb(24,31,42)] p-4 shadow-xl ring-1 ring-black/20",
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
                "mb-4 text-base font-semibold text-slate-100",
                local.class,
            )}
            {...rest}
        ></h2>
    );
};
