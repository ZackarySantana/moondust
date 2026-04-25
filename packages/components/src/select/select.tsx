import { splitProps, type Component, type JSX } from "solid-js";
import { cn } from "../utils";

export interface SelectProps extends JSX.SelectHTMLAttributes<HTMLSelectElement> {
    class?: string;
}

export const Select: Component<SelectProps> = (props) => {
    const [local, rest] = splitProps(props, ["class"]);
    return (
        <select
            class={cn(
                "flex h-9 w-full cursor-pointer appearance-none rounded-lg border border-slate-700/50 bg-slate-950/50 bg-[length:16px_16px] bg-[position:right_0.5rem_center] bg-no-repeat px-3 py-1.5 pr-8 text-sm text-slate-200 transition-colors duration-150 focus-visible:border-emerald-700/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600/30 disabled:cursor-not-allowed disabled:opacity-50",
                "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]",
                local.class,
            )}
            {...rest}
        />
    );
};
