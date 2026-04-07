import { splitProps, type Component, type JSX } from "solid-js";
import { cn } from "@/lib/utils";

export interface SeparatorProps extends JSX.HTMLAttributes<HTMLDivElement> {
    orientation?: "horizontal" | "vertical";
    class?: string;
}

export const Separator: Component<SeparatorProps> = (props) => {
    const [local, rest] = splitProps(props, ["orientation", "class"]);
    return (
        <div
            class={cn(
                local.orientation === "vertical"
                    ? "h-full w-px bg-slate-800/50"
                    : "h-px w-full bg-slate-800/50",
                local.class,
            )}
            role="separator"
            aria-orientation={local.orientation ?? "horizontal"}
            {...rest}
        />
    );
};
