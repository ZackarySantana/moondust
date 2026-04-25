import { splitProps, type Component, type JSX } from "solid-js";
import { cn } from "../utils";

export interface KbdProps extends JSX.HTMLAttributes<HTMLElement> {
    class?: string;
}

export const Kbd: Component<KbdProps> = (props) => {
    const [local, rest] = splitProps(props, ["class"]);
    return (
        <kbd
            class={cn(
                "inline-flex items-center rounded-none border border-b-2 border-void-700 bg-void-800 px-1.5 py-px font-mono text-[10px] leading-none text-void-200",
                local.class,
            )}
            {...rest}
        />
    );
};
