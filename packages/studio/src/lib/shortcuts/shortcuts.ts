/**
 * Tiered shortcut registry for the studio shell.
 *
 * Tiers (from the design notes):
 *   - global         — always active
 *   - navigational   — active when a thread is focused (workspace/thread nav)
 *   - view           — active when a particular main-pane view has focus
 *   - composer       — only matched while typing in the composer
 *
 * The registry is intentionally separate from the React-style provider that
 * binds it to the DOM. That provider lives in `./shortcut-context.tsx` and
 * subscribes to settings overrides via TanStack Query.
 */

const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/.test(navigator.platform);

export type ShortcutTier = "global" | "navigational" | "view" | "composer";

export interface ShortcutActionDef {
    id: ShortcutActionId;
    label: string;
    description: string;
    tier: ShortcutTier;
    /**
     * The view this action belongs to (only meaningful when `tier === "view"`).
     * `undefined` for non-view actions.
     */
    view?: ThreadViewId;
}

export type ThreadViewId =
    | "chat"
    | "diff"
    | "files"
    | "browser"
    | "terminal"
    | "tests"
    | "review"
    | "pr"
    | "git";

export const THREAD_VIEW_ORDER: readonly ThreadViewId[] = [
    "chat",
    "diff",
    "files",
    "browser",
    "terminal",
    "tests",
    "review",
    "pr",
    "git",
];

export const SHORTCUT_ACTIONS: readonly ShortcutActionDef[] = [
    {
        id: "open_command_palette",
        label: "Open command palette",
        description: "Search and run any command",
        tier: "global",
    },
    {
        id: "open_hub",
        label: "Open Hub",
        description: "Jump to the home dashboard",
        tier: "global",
    },
    {
        id: "open_global_settings",
        label: "Open global settings",
        description: "Open app-wide settings",
        tier: "global",
    },
    {
        id: "open_workspace_settings",
        label: "Open workspace settings",
        description: "Open settings scoped to the focused workspace",
        tier: "global",
    },
    {
        id: "new_workspace",
        label: "New workspace",
        description: "Open the create-workspace dialog",
        tier: "global",
    },
    {
        id: "new_thread",
        label: "New thread",
        description: "Create a thread in the focused workspace",
        tier: "global",
    },
    {
        id: "toggle_context_rail",
        label: "Toggle right rail",
        description: "Show or hide the context rail",
        tier: "global",
    },
    {
        id: "toggle_bottom_dock",
        label: "Toggle bottom dock",
        description: "Show or hide the bottom dock",
        tier: "global",
    },
    {
        id: "cycle_focus_region",
        label: "Cycle focus region",
        description: "Move focus between rail / main / context / dock",
        tier: "global",
    },
    {
        id: "show_shortcut_cheatsheet",
        label: "Show keyboard cheatsheet",
        description: "Display the full list of shortcuts",
        tier: "global",
    },

    {
        id: "view_chat",
        label: "Switch to Chat",
        description: "Open the chat view",
        tier: "navigational",
        view: "chat",
    },
    {
        id: "view_diff",
        label: "Switch to Diff",
        description: "Open the diff view",
        tier: "navigational",
        view: "diff",
    },
    {
        id: "view_files",
        label: "Switch to Files",
        description: "Open the file explorer view",
        tier: "navigational",
        view: "files",
    },
    {
        id: "view_browser",
        label: "Switch to Browser",
        description: "Open the embedded browser view",
        tier: "navigational",
        view: "browser",
    },
    {
        id: "view_terminal",
        label: "Switch to Terminal",
        description: "Open the full-screen terminal view",
        tier: "navigational",
        view: "terminal",
    },
    {
        id: "view_tests",
        label: "Switch to Tests",
        description: "Open the test runner view",
        tier: "navigational",
        view: "tests",
    },
    {
        id: "view_review",
        label: "Switch to Review",
        description: "Open the AI / human review view",
        tier: "navigational",
        view: "review",
    },
    {
        id: "view_pr",
        label: "Switch to PR / GitHub",
        description: "Open the inline PR view",
        tier: "navigational",
        view: "pr",
    },
    {
        id: "view_git",
        label: "Switch to Git log",
        description: "Open the commit graph view",
        tier: "navigational",
        view: "git",
    },
    {
        id: "view_cycle_next",
        label: "Next thread view",
        description:
            "Switch to the next thread tab (Chat, Diff, Files, …); wraps around",
        tier: "navigational",
    },
    {
        id: "view_cycle_prev",
        label: "Previous thread view",
        description: "Switch to the previous thread tab; wraps around",
        tier: "navigational",
    },

    {
        id: "go_thread_slot_1",
        label: "Jump to thread slot 1",
        description: "Open the first thread in the rail order",
        tier: "navigational",
    },
    {
        id: "go_thread_slot_2",
        label: "Jump to thread slot 2",
        description: "Open the second thread in the rail order",
        tier: "navigational",
    },
    {
        id: "go_thread_slot_3",
        label: "Jump to thread slot 3",
        description: "Open the third thread in the rail order",
        tier: "navigational",
    },
    {
        id: "go_thread_slot_4",
        label: "Jump to thread slot 4",
        description: "Open the fourth thread in the rail order",
        tier: "navigational",
    },
    {
        id: "go_thread_slot_5",
        label: "Jump to thread slot 5",
        description: "Open the fifth thread in the rail order",
        tier: "navigational",
    },
    {
        id: "go_thread_slot_6",
        label: "Jump to thread slot 6",
        description: "Open the sixth thread in the rail order",
        tier: "navigational",
    },

    {
        id: "focus_composer",
        label: "Focus composer",
        description: "Move keyboard focus to the chat composer",
        tier: "view",
        view: "chat",
    },

    {
        id: "diff_next_change",
        label: "Next change",
        description: "Jump to the next diff hunk",
        tier: "view",
        view: "diff",
    },
    {
        id: "diff_prev_change",
        label: "Previous change",
        description: "Jump to the previous diff hunk",
        tier: "view",
        view: "diff",
    },
];

export type ShortcutActionId =
    | "open_command_palette"
    | "open_hub"
    | "open_global_settings"
    | "open_workspace_settings"
    | "new_workspace"
    | "new_thread"
    | "toggle_context_rail"
    | "toggle_bottom_dock"
    | "cycle_focus_region"
    | "show_shortcut_cheatsheet"
    | "view_chat"
    | "view_diff"
    | "view_files"
    | "view_browser"
    | "view_terminal"
    | "view_tests"
    | "view_review"
    | "view_pr"
    | "view_git"
    | "view_cycle_next"
    | "view_cycle_prev"
    | "go_thread_slot_1"
    | "go_thread_slot_2"
    | "go_thread_slot_3"
    | "go_thread_slot_4"
    | "go_thread_slot_5"
    | "go_thread_slot_6"
    | "focus_composer"
    | "diff_next_change"
    | "diff_prev_change";

const MAC_DEFAULTS: Record<ShortcutActionId, string> = {
    open_command_palette: "Meta+K",
    open_hub: "Meta+Shift+H",
    open_global_settings: "Meta+,",
    open_workspace_settings: "Meta+Shift+,",
    new_workspace: "Meta+Shift+N",
    new_thread: "Meta+N",
    toggle_context_rail: "Meta+B",
    toggle_bottom_dock: "Meta+`",
    cycle_focus_region: "F6",
    show_shortcut_cheatsheet: "Shift+/",
    view_chat: "Meta+1",
    view_diff: "Meta+2",
    view_files: "Meta+3",
    view_browser: "Meta+4",
    view_terminal: "Meta+5",
    view_tests: "Meta+6",
    view_review: "Meta+7",
    view_pr: "Meta+8",
    view_git: "Meta+9",
    view_cycle_next: "Ctrl+Tab",
    view_cycle_prev: "Ctrl+Shift+Tab",
    go_thread_slot_1: "Meta+Alt+1",
    go_thread_slot_2: "Meta+Alt+2",
    go_thread_slot_3: "Meta+Alt+3",
    go_thread_slot_4: "Meta+Alt+4",
    go_thread_slot_5: "Meta+Alt+5",
    go_thread_slot_6: "Meta+Alt+6",
    focus_composer: "Meta+L",
    diff_next_change: "Alt+ArrowDown",
    diff_prev_change: "Alt+ArrowUp",
};

const OTHER_DEFAULTS: Record<ShortcutActionId, string> = {
    ...MAC_DEFAULTS,
    open_command_palette: "Ctrl+K",
    open_hub: "Ctrl+Shift+H",
    open_global_settings: "Ctrl+,",
    open_workspace_settings: "Ctrl+Shift+,",
    new_workspace: "Ctrl+Shift+N",
    new_thread: "Ctrl+N",
    toggle_context_rail: "Ctrl+B",
    toggle_bottom_dock: "Ctrl+`",
    view_chat: "Ctrl+1",
    view_diff: "Ctrl+2",
    view_files: "Ctrl+3",
    view_browser: "Ctrl+4",
    view_terminal: "Ctrl+5",
    view_tests: "Ctrl+6",
    view_review: "Ctrl+7",
    view_pr: "Ctrl+8",
    view_git: "Ctrl+9",
    view_cycle_next: "Ctrl+Tab",
    view_cycle_prev: "Ctrl+Shift+Tab",
    go_thread_slot_1: "Ctrl+Alt+1",
    go_thread_slot_2: "Ctrl+Alt+2",
    go_thread_slot_3: "Ctrl+Alt+3",
    go_thread_slot_4: "Ctrl+Alt+4",
    go_thread_slot_5: "Ctrl+Alt+5",
    go_thread_slot_6: "Ctrl+Alt+6",
    focus_composer: "Ctrl+L",
};

export const DEFAULT_SHORTCUTS: Record<ShortcutActionId, string> = isMac
    ? MAC_DEFAULTS
    : OTHER_DEFAULTS;

interface ParsedCombo {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    meta: boolean;
    key: string;
}

export function parseCombo(combo: string): ParsedCombo {
    const parts = combo.split("+");
    const key = parts.pop()!;
    const mods = new Set(parts.map((p) => p.toLowerCase()));
    return {
        ctrl: mods.has("ctrl"),
        shift: mods.has("shift"),
        alt: mods.has("alt"),
        meta: mods.has("meta"),
        key,
    };
}

export function matchesCombo(e: KeyboardEvent, combo: string): boolean {
    const parsed = parseCombo(combo);
    if (e.ctrlKey !== parsed.ctrl) return false;
    if (e.shiftKey !== parsed.shift) return false;
    if (e.altKey !== parsed.alt) return false;
    if (e.metaKey !== parsed.meta) return false;
    if (parsed.key.length === 1) {
        return e.key.toLowerCase() === parsed.key.toLowerCase();
    }
    return e.key === parsed.key;
}

export function comboFromEvent(e: KeyboardEvent): string | null {
    const ignored = new Set([
        "Control",
        "Shift",
        "Alt",
        "Meta",
        "CapsLock",
        "Tab",
        "NumLock",
        "ScrollLock",
    ]);
    if (ignored.has(e.key)) return null;
    const parts: string[] = [];
    if (e.ctrlKey) parts.push("Ctrl");
    if (e.metaKey) parts.push("Meta");
    if (e.altKey) parts.push("Alt");
    if (e.shiftKey) parts.push("Shift");
    parts.push(e.key);
    return parts.join("+");
}

/** Pretty-print a combo as human-friendly keycaps (e.g. ⌘ ⇧ H). */
export function formatCombo(combo: string): string {
    return combo
        .split("+")
        .map((part) => {
            const lower = part.toLowerCase();
            if (lower === "meta") return isMac ? "\u2318" : "Ctrl";
            if (lower === "ctrl") return isMac ? "\u2303" : "Ctrl";
            if (lower === "alt") return isMac ? "\u2325" : "Alt";
            if (lower === "shift") return isMac ? "\u21E7" : "Shift";
            if (lower === "arrowdown") return "\u2193";
            if (lower === "arrowup") return "\u2191";
            if (lower === "arrowleft") return "\u2190";
            if (lower === "arrowright") return "\u2192";
            if (lower === "escape") return "Esc";
            if (lower === "backquote" || part === "`") return "`";
            if (part === ",") return ",";
            return part.length === 1 ? part.toUpperCase() : part;
        })
        .join(isMac ? "" : "+");
}

/** Split a combo into individual cap labels. Useful for the `KbdHint` array form. */
export function comboToCaps(combo: string): string[] {
    return combo.split("+").map((p) => formatCombo(p));
}
