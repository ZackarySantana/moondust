import { splitProps, type Component, type JSX } from "solid-js";
import { cn } from "@/lib/utils";

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
    class?: string;
}

export const Input: Component<InputProps> = (props) => {
    const [local, rest] = splitProps(props, ["class"]);
    return (
        <input
            class={cn(
                "flex h-9 w-full rounded-md border border-slate-600/80 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 ring-offset-slate-950 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 disabled:cursor-not-allowed disabled:opacity-50",
                local.class,
            )}
            {...rest}
        />
    );
};
