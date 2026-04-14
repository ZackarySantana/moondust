import { createSignal } from "solid-js";

/**
 * Shared layout for the thread workspace (Git sidebar, terminal dock, resize sizes).
 * Git sidebar and terminal start closed; toggles and drag sizes live at module scope
 * so they survive navigating away and back (e.g. home → thread) within one session.
 */
const DEFAULT_TERMINAL_HEIGHT = 208;
const DEFAULT_SIDEBAR_WIDTH = 320;

export const [terminalOpen, setTerminalOpen] = createSignal(false);
export const [sidebarOpen, setSidebarOpen] = createSignal(false);
export const [terminalHeight, setTerminalHeight] = createSignal(
    DEFAULT_TERMINAL_HEIGHT,
);
export const [sidebarWidth, setSidebarWidth] = createSignal(
    DEFAULT_SIDEBAR_WIDTH,
);
