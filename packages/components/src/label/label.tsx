import { splitProps, type Component, type JSX } from "solid-js";
import { cn } from "../utils";

export interface LabelProps extends JSX.LabelHTMLAttributes<HTMLLabelElement> {
    class?: string;
}

export const Label: Component<LabelProps> = (props) => {
    const [local, rest] = splitProps(props, ["class"]);
    return (
        <label
            class={cn(
                "mb-1.5 block text-xs font-medium text-slate-400",
                local.class,
            )}
            {...rest}
        />
    );
};
