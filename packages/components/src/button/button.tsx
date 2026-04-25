import { splitProps, type Component, type JSX } from "solid-js";
import { cn } from "../utils";

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
        "bg-starlight-300 text-void-950 hover:bg-starlight-200 active:bg-starlight-400 focus-visible:outline-starlight-300/70",
    destructive:
        "bg-flare-500 text-void-50 hover:bg-flare-400 active:bg-flare-600 focus-visible:outline-flare-400/70",
    outline:
        "border border-void-600 bg-transparent text-void-200 hover:bg-void-800 hover:border-void-500 active:bg-void-700 focus-visible:outline-void-500",
    secondary:
        "bg-void-800 text-void-100 border border-void-700 hover:bg-void-700 hover:border-void-600 active:bg-void-800 focus-visible:outline-void-500",
    ghost:
        "bg-transparent text-void-300 hover:bg-void-800 hover:text-void-100 active:bg-void-700 focus-visible:outline-void-600",
    link: "bg-transparent text-nebula-400 underline-offset-4 hover:text-nebula-300 hover:underline",
    icon: "bg-transparent text-void-400 hover:bg-void-800 hover:text-void-100 active:bg-void-700 focus-visible:outline-void-600",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
    default: "h-8 px-4",
    sm: "h-7 px-3 text-xs",
    lg: "h-10 px-6 text-[15px]",
    icon: "size-8 p-1.5",
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
                "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium tracking-tight transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40",
                variantStyles[v()],
                v() !== "link" ? sizeStyles[s()] : "h-auto p-0",
                local.class,
            )}
            {...rest}
        />
    );
};
