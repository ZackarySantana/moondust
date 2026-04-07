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
                "flex h-9 w-full rounded-lg border border-slate-700/50 bg-slate-950/50 px-3 py-2 text-sm text-slate-200 transition-colors duration-150 placeholder:text-slate-600 focus-visible:border-emerald-700/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600/30 disabled:cursor-not-allowed disabled:opacity-50",
                local.class,
            )}
            {...rest}
        />
    );
};
