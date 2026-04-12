const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/.test(navigator.platform);

export type ShortcutContext = "global" | "thread" | "diff";

export interface ShortcutActionDef {
    id: string;
    label: string;
    description: string;
    context: ShortcutContext;
}

const GO_THREAD_SLOT_DESCRIPTION =
    "Jump to that thread slot in the left sidebar: projects ordered by latest activity, then threads in each project newest first (same order across all projects)";

export const SHORTCUT_ACTIONS: readonly ShortcutActionDef[] = [
    {
        id: "new_project",
        label: "New project",
        description: "Open the create-project dialog",
        context: "global",
    },
    {
        id: "new_thread",
        label: "New thread",
        description: "Create a new thread in the current project",
        context: "global",
    },
    {
        id: "go_home",
        label: "Go home",
        description: "Navigate to the home page",
        context: "global",
    },
    {
        id: "open_settings",
        label: "Open settings",
        description: "Navigate to global settings",
        context: "global",
    },
    {
        id: "focus_chat",
        label: "Focus chat input",
        description: "Move focus to the chat composer",
        context: "thread",
    },
    {
        id: "toggle_terminal",
        label: "Toggle terminal",
        description: "Show or hide the terminal panel",
        context: "thread",
    },
    {
        id: "toggle_sidebar",
        label: "Toggle review sidebar",
        description: "Show or hide the Git review sidebar",
        context: "thread",
    },
    {
        id: "close_diff",
        label: "Close diff view",
        description: "Return to the chat from the diff viewer",
        context: "diff",
    },
    {
        id: "next_diff",
        label: "Next change",
        description: "Jump to the next diff hunk",
        context: "diff",
    },
    {
        id: "prev_diff",
        label: "Previous change",
        description: "Jump to the previous diff hunk",
        context: "diff",
    },
    {
        id: "toggle_diff_mode",
        label: "Toggle diff mode",
        description: "Switch between side-by-side and inline diff",
        context: "diff",
    },
    {
        id: "go_thread_1",
        label: "Open thread 1",
        description: GO_THREAD_SLOT_DESCRIPTION,
        context: "global",
    },
    {
        id: "go_thread_2",
        label: "Open thread 2",
        description: GO_THREAD_SLOT_DESCRIPTION,
        context: "global",
    },
    {
        id: "go_thread_3",
        label: "Open thread 3",
        description: GO_THREAD_SLOT_DESCRIPTION,
        context: "global",
    },
    {
        id: "go_thread_4",
        label: "Open thread 4",
        description: GO_THREAD_SLOT_DESCRIPTION,
        context: "global",
    },
    {
        id: "go_thread_5",
        label: "Open thread 5",
        description: GO_THREAD_SLOT_DESCRIPTION,
        context: "global",
    },
    {
        id: "go_thread_6",
        label: "Open thread 6",
        description: GO_THREAD_SLOT_DESCRIPTION,
        context: "global",
    },
] as const;

export type ShortcutActionId = (typeof SHORTCUT_ACTIONS)[number]["id"];

const MAC_DEFAULTS: Record<string, string> = {
    new_project: "Meta+Shift+N",
    new_thread: "Meta+N",
    go_home: "Meta+Shift+H",
    open_settings: "Meta+,",
    focus_chat: "Meta+L",
    toggle_terminal: "Meta+`",
    toggle_sidebar: "Meta+B",
    close_diff: "Escape",
    next_diff: "Alt+ArrowDown",
    prev_diff: "Alt+ArrowUp",
    toggle_diff_mode: "Meta+Shift+D",
    go_thread_1: "Meta+1",
    go_thread_2: "Meta+2",
    go_thread_3: "Meta+3",
    go_thread_4: "Meta+4",
    go_thread_5: "Meta+5",
    go_thread_6: "Meta+6",
};

const OTHER_DEFAULTS: Record<string, string> = {
    new_project: "Ctrl+Shift+N",
    new_thread: "Ctrl+N",
    go_home: "Ctrl+Shift+H",
    open_settings: "Ctrl+,",
    focus_chat: "Ctrl+L",
    toggle_terminal: "Ctrl+`",
    toggle_sidebar: "Ctrl+B",
    close_diff: "Escape",
    next_diff: "Alt+ArrowDown",
    prev_diff: "Alt+ArrowUp",
    toggle_diff_mode: "Ctrl+Shift+D",
    go_thread_1: "Ctrl+1",
    go_thread_2: "Ctrl+2",
    go_thread_3: "Ctrl+3",
    go_thread_4: "Ctrl+4",
    go_thread_5: "Ctrl+5",
    go_thread_6: "Ctrl+6",
};

export const DEFAULT_SHORTCUTS: Record<string, string> = isMac
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

export function comboFromEvent(e: KeyboardEvent): string | null {
    const ignoredKeys = new Set([
        "Control",
        "Shift",
        "Alt",
        "Meta",
        "CapsLock",
        "Tab",
        "NumLock",
        "ScrollLock",
    ]);
    if (ignoredKeys.has(e.key)) return null;

    const parts: string[] = [];
    if (e.ctrlKey) parts.push("Ctrl");
    if (e.metaKey) parts.push("Meta");
    if (e.altKey) parts.push("Alt");
    if (e.shiftKey) parts.push("Shift");
    parts.push(e.key);
    return parts.join("+");
}
