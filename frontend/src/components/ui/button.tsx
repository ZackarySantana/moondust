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
        "bg-sky-600 text-white hover:bg-sky-500 focus-visible:outline-sky-300/80",
    destructive:
        "bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-400/60",
    outline:
        "border border-slate-600 bg-transparent text-slate-200 hover:bg-slate-800/80",
    secondary: "bg-slate-700 text-slate-100 hover:bg-slate-600",
    ghost: "bg-transparent text-slate-300 hover:bg-slate-700/55 hover:text-slate-100",
    link: "bg-transparent text-sky-400 underline-offset-4 hover:underline",
    icon: "bg-transparent text-slate-300 hover:bg-slate-700/55 hover:text-slate-100",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
    icon: "size-9 rounded-md p-1.5",
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
                "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400/60 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40",
                variantStyles[v()],
                v() !== "link" ? sizeStyles[s()] : "h-auto p-0",
                local.class,
            )}
            {...rest}
        />
    );
};
