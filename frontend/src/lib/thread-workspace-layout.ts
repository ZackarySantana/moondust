import { createSignal } from "solid-js";

/**
 * Shared layout for the thread workspace (Git sidebar, terminal dock, resize sizes).
 * Lives at module scope so toggles and drag sizes survive navigating away and back
 * (e.g. home → thread) within one app session.
 */
const DEFAULT_TERMINAL_HEIGHT = 208;
const DEFAULT_SIDEBAR_WIDTH = 320;

export const [terminalOpen, setTerminalOpen] = createSignal(true);
export const [sidebarOpen, setSidebarOpen] = createSignal(true);
export const [terminalHeight, setTerminalHeight] = createSignal(
    DEFAULT_TERMINAL_HEIGHT,
);
export const [sidebarWidth, setSidebarWidth] = createSignal(
    DEFAULT_SIDEBAR_WIDTH,
);
