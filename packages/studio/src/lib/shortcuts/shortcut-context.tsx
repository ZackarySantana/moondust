import {
    createContext,
    onCleanup,
    onMount,
    useContext,
    type ParentComponent,
} from "solid-js";
import {
    DEFAULT_SHORTCUTS,
    formatCombo,
    matchesCombo,
    SHORTCUT_ACTIONS,
    comboToCaps,
    type ShortcutActionDef,
    type ShortcutActionId,
    type ShortcutTier,
} from "./shortcuts";

type Handler = () => void;

export interface ShortcutContextValue {
    /**
     * Register a handler for `actionId`. Returns an unsubscribe fn. Multiple
     * subscribers are stacked LIFO; the topmost one fires first and may stop
     * propagation by calling `stopBubble()`.
     */
    onAction: (actionId: ShortcutActionId, handler: Handler) => () => void;
    /** Pretty-printed combo for an action (e.g. ⌘ K). */
    formatKey: (actionId: ShortcutActionId) => string;
    /** Caps array form, suitable for `<KbdHint combo={[...]} />`. */
    formatCaps: (actionId: ShortcutActionId) => readonly string[];
    /** Resolved shortcut map (defaults + future per-user overrides). */
    shortcuts: () => Readonly<Record<ShortcutActionId, string>>;
    /** All registered action defs (for the cheatsheet / palette). */
    actions: readonly ShortcutActionDef[];
}

const ShortcutContext = createContext<ShortcutContextValue>();

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);
const COMPOSER_TIER: ShortcutTier = "composer";

export interface ShortcutProviderProps {
    /** Optional override map; merged on top of `DEFAULT_SHORTCUTS`. */
    overrides?: Partial<Record<ShortcutActionId, string>>;
}

/**
 * Lightweight provider wrapping the SHORTCUT_ACTIONS registry. Doesn't talk
 * to settings storage directly so it stays unit-testable; pass `overrides`
 * from a query hook in the parent layout.
 */
export const ShortcutProvider: ParentComponent<ShortcutProviderProps> = (
    props,
) => {
    const handlers = new Map<ShortcutActionId, Handler[]>();

    function resolved(): Record<ShortcutActionId, string> {
        return { ...DEFAULT_SHORTCUTS, ...(props.overrides ?? {}) };
    }

    function onAction(id: ShortcutActionId, handler: Handler): () => void {
        const list = handlers.get(id) ?? [];
        list.push(handler);
        handlers.set(id, list);
        return () => {
            const cur = handlers.get(id);
            if (!cur) return;
            const idx = cur.lastIndexOf(handler);
            if (idx >= 0) cur.splice(idx, 1);
            if (cur.length === 0) handlers.delete(id);
        };
    }

    function formatKey(id: ShortcutActionId): string {
        const combo = resolved()[id];
        return combo ? formatCombo(combo) : "";
    }

    function formatCaps(id: ShortcutActionId): readonly string[] {
        const combo = resolved()[id];
        return combo ? comboToCaps(combo) : [];
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

            // Composer-tier shortcuts are only allowed *inside* inputs;
            // everything else must be outside one (we don't want ⌘1 to
            // hijack the composer).
            if (action.tier === COMPOSER_TIER && !inInput) continue;
            if (action.tier !== COMPOSER_TIER && inInput) continue;

            const list = handlers.get(action.id);
            if (!list || list.length === 0) continue;
            e.preventDefault();
            e.stopPropagation();
            for (let i = list.length - 1; i >= 0; i--) {
                list[i]();
            }
            return;
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
        formatCaps,
        shortcuts: resolved,
        actions: SHORTCUT_ACTIONS,
    };

    return (
        <ShortcutContext.Provider value={ctx}>
            {props.children}
        </ShortcutContext.Provider>
    );
};

export function useShortcuts(): ShortcutContextValue {
    const ctx = useContext(ShortcutContext);
    if (!ctx) {
        throw new Error("useShortcuts must be used inside <ShortcutProvider>");
    }
    return ctx;
}
