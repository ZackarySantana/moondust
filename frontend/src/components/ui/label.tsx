import { splitProps, type Component, type JSX } from "solid-js";
import { cn } from "@/lib/utils";

export interface LabelProps extends JSX.LabelHTMLAttributes<HTMLLabelElement> {
    class?: string;
}

export const Label: Component<LabelProps> = (props) => {
    const [local, rest] = splitProps(props, ["class"]);
    return (
        <label
            class={cn(
                "mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500",
                local.class,
            )}
            {...rest}
        />
    );
};
