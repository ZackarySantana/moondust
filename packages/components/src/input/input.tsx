import { splitProps, type Component, type JSX } from "solid-js";
import { cn } from "../utils";

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
    class?: string;
}

export const Input: Component<InputProps> = (props) => {
    const [local, rest] = splitProps(props, ["class"]);
    return (
        <input
            class={cn(
                "flex h-9 w-full rounded-none border border-void-700 bg-void-900 px-3 py-2 text-sm text-void-100 transition-colors duration-100 placeholder:text-void-500 focus-visible:border-starlight-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-starlight-400/40 disabled:cursor-not-allowed disabled:opacity-40",
                local.class,
            )}
            {...rest}
        />
    );
};
