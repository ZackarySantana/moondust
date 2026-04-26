import Search from "lucide-solid/icons/search";
import { splitProps, type Component, type JSX } from "solid-js";
import { KbdHint } from "../kbd-hint/kbd-hint";
import { cn } from "../utils";

export interface CommandLauncherProps extends Omit<
    JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    "type"
> {
    /** Visible placeholder copy. Defaults to "Search & run…". */
    placeholder?: string;
    /** Shortcut hint shown on the right (defaults to ⌘K). */
    shortcut?: readonly string[];
}

const DEFAULT_SHORTCUT = ["⌘", "K"] as const;

/**
 * Search-shaped button that opens the command palette. Lives at the top of
 * the Workspace Rail. Looks like an input but is purely a trigger — the
 * palette is owned by the parent layout.
 */
export const CommandLauncher: Component<CommandLauncherProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "placeholder",
        "shortcut",
    ]);
    const shortcut = () => local.shortcut ?? DEFAULT_SHORTCUT;
    return (
        <button
            type="button"
            class={cn(
                "group/launcher flex h-7 w-full cursor-pointer items-center gap-2 border border-void-700 bg-void-850 px-2 text-left text-[12px] text-void-400 transition-colors hover:border-void-600 hover:text-void-100 hover:bg-void-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-starlight-400/60",
                local.class,
            )}
            {...rest}
        >
            <Search
                class="size-3.5 shrink-0 text-void-500 group-hover/launcher:text-void-300"
                stroke-width={1.75}
                aria-hidden
            />
            <span class="min-w-0 flex-1 truncate">
                {local.placeholder ?? "Search & run…"}
            </span>
            <KbdHint
                combo={shortcut() as readonly string[]}
                class="shrink-0 opacity-70 group-hover/launcher:opacity-100"
            />
        </button>
    );
};
