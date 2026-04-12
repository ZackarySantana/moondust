import type { ParentComponent } from "solid-js";
import { createContext, onCleanup, onMount, useContext } from "solid-js";
import { useQuery } from "@tanstack/solid-query";
import { queryKeys } from "@/lib/query-client";
import {
    DEFAULT_SHORTCUTS,
    formatCombo,
    matchesCombo,
    SHORTCUT_ACTIONS,
} from "@/lib/shortcuts";
import { GetSettings } from "@wails/go/app/App";

type Handler = () => void;

interface ShortcutContextValue {
    onAction: (actionId: string, handler: Handler) => () => void;
    formatKey: (actionId: string) => string;
    shortcuts: () => Record<string, string>;
}

const ShortcutContext = createContext<ShortcutContextValue>();

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);
const ALLOW_IN_INPUT = new Set(["close_diff", "Escape"]);

export const ShortcutProvider: ParentComponent = (props) => {
    const handlers = new Map<string, Set<Handler>>();

    const settingsQuery = useQuery(() => ({
        queryKey: queryKeys.settings,
        queryFn: GetSettings,
        staleTime: 60_000,
    }));

    function resolved(): Record<string, string> {
        const overrides = settingsQuery.data?.keyboard_shortcuts ?? {};
        return { ...DEFAULT_SHORTCUTS, ...overrides };
    }

    function onAction(actionId: string, handler: Handler): () => void {
        let set = handlers.get(actionId);
        if (!set) {
            set = new Set();
            handlers.set(actionId, set);
        }
        set.add(handler);
        return () => set!.delete(handler);
    }

    function formatKey(actionId: string): string {
        const combo = resolved()[actionId];
        return combo ? formatCombo(combo) : "";
    }

    function handleKeyDown(e: KeyboardEvent) {
        const target = e.target as HTMLElement | null;
        const inInput =
            target != null &&
            (INPUT_TAGS.has(target.tagName) || target.isContentEditable);

        const map = resolved();
        for (const action of SHORTCUT_ACTIONS) {
            const combo = map[action.id];
            if (!combo) continue;
            if (!matchesCombo(e, combo)) continue;

            if (inInput && !ALLOW_IN_INPUT.has(action.id)) continue;

            const actionHandlers = handlers.get(action.id);
            if (actionHandlers && actionHandlers.size > 0) {
                e.preventDefault();
                e.stopPropagation();
                for (const h of actionHandlers) h();
                return;
            }
        }
    }

    onMount(() => {
        document.addEventListener("keydown", handleKeyDown, true);
    });
    onCleanup(() => {
        document.removeEventListener("keydown", handleKeyDown, true);
    });

    const ctx: ShortcutContextValue = {
        onAction,
        formatKey,
        shortcuts: resolved,
    };

    return (
        <ShortcutContext.Provider value={ctx}>
            {props.children}
        </ShortcutContext.Provider>
    );
};

export function useShortcuts(): ShortcutContextValue {
    const ctx = useContext(ShortcutContext);
    if (!ctx)
        throw new Error("useShortcuts must be used inside ShortcutProvider");
    return ctx;
}
