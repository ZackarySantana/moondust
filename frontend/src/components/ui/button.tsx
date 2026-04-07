import { splitProps, type Component, type JSX } from "solid-js";
import { cn } from "@/lib/utils";

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:
        | "default"
        | "destructive"
        | "outline"
        | "secondary"
        | "ghost"
        | "link"
        | "icon";
    size?: "default" | "sm" | "lg" | "icon";
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
    default:
        "bg-emerald-700/90 text-white shadow-sm shadow-emerald-950/30 hover:bg-emerald-600/90 active:bg-emerald-700 focus-visible:outline-emerald-400/65",
    destructive:
        "bg-red-600/90 text-white shadow-sm shadow-red-950/30 hover:bg-red-500/90 active:bg-red-600 focus-visible:outline-red-400/60",
    outline:
        "border border-slate-700/60 bg-transparent text-slate-200 hover:bg-slate-800/50 hover:border-slate-600/60 active:bg-slate-800/70",
    secondary:
        "bg-slate-800/80 text-slate-100 hover:bg-slate-700/80 active:bg-slate-800",
    ghost: "bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-slate-100 active:bg-slate-800/70",
    link: "bg-transparent text-emerald-400/95 underline-offset-4 hover:text-emerald-300 hover:underline",
    icon: "bg-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 active:bg-slate-800/70",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
    icon: "size-8 rounded-md p-1.5",
};

export const Button: Component<ButtonProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "variant",
        "size",
        "type",
    ]);

    const v = () => local.variant ?? "default";
    const s = () => local.size ?? "default";

    return (
        <button
            type={local.type ?? "button"}
            class={cn(
                "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-emerald-500/55 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]",
                variantStyles[v()],
                v() !== "link" ? sizeStyles[s()] : "h-auto p-0",
                local.class,
            )}
            {...rest}
        />
    );
};
