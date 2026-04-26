/**
 * Dev-only mock for `window.go.app.*`. Lets `bun dev` (or Storybook) render
 * the app without a running Wails Go process.
 *
 * Shapes match `wailsjs/go/models.ts`: Go's default JSON keys (`ID`, `Name`, …).
 *
 * Activate by importing this module before any code that touches the
 * bindings (see `studio/src/index.tsx`).
 */

interface MockProject {
    ID: string;
    Name: string;
    Directory: string;
    Branch: string;
    CreatedAt: string;
    UpdatedAt: string;
}

interface MockThread {
    ID: string;
    ProjectID: string;
    Title: string;
    WorktreeDir: string;
    ChatProvider: string;
    ChatModel: string;
    CreatedAt: string;
    UpdatedAt: string;
}

const now = Date.now();
const minutes = (m: number) => new Date(now - m * 60_000).toISOString();
const hours = (h: number) => new Date(now - h * 3_600_000).toISOString();
const days = (d: number) => new Date(now - d * 86_400_000).toISOString();

const PROJECTS: readonly MockProject[] = [
    {
        ID: "moondust",
        Name: "moondust",
        Directory: "~/code/moondust",
        Branch: "main",
        CreatedAt: days(45),
        UpdatedAt: minutes(2),
    },
    {
        ID: "frontend-archive",
        Name: "frontend-archive",
        Directory: "~/code/frontend-archive",
        Branch: "main",
        CreatedAt: days(120),
        UpdatedAt: days(7),
    },
    {
        ID: "studio-design",
        Name: "studio-design",
        Directory: "~/code/studio-design",
        Branch: "main",
        CreatedAt: days(20),
        UpdatedAt: hours(3),
    },
];

const THREADS: MockThread[] = [
    {
        ID: "moon/refactor-router",
        ProjectID: "moondust",
        Title: "Refactor router and replace floating-ui",
        WorktreeDir: "~/code/moondust.worktrees/moon-refactor-router",
        ChatProvider: "cursor",
        ChatModel: "claude-sonnet-4.6",
        CreatedAt: hours(6),
        UpdatedAt: minutes(2),
    },
    {
        ID: "moon/studio-ipc",
        ProjectID: "moondust",
        Title: "Wire Wails IPC into studio",
        WorktreeDir: "~/code/moondust.worktrees/moon-studio-ipc",
        ChatProvider: "cursor",
        ChatModel: "claude-sonnet-4.6",
        CreatedAt: hours(20),
        UpdatedAt: minutes(18),
    },
    {
        ID: "moon/thread-tests",
        ProjectID: "moondust",
        Title: "Tests for thread store",
        WorktreeDir: "~/code/moondust.worktrees/moon-thread-tests",
        ChatProvider: "cursor",
        ChatModel: "claude-sonnet-4.6",
        CreatedAt: days(2),
        UpdatedAt: hours(1),
    },
    {
        ID: "moon/theme-tokens",
        ProjectID: "moondust",
        Title: "Notes on theme tokens",
        WorktreeDir: "~/code/moondust.worktrees/moon-theme-tokens",
        ChatProvider: "cursor",
        ChatModel: "claude-sonnet-4.6",
        CreatedAt: days(4),
        UpdatedAt: days(2),
    },
    {
        ID: "studio/hub-page",
        ProjectID: "studio-design",
        Title: "Mock the Hub page",
        WorktreeDir: "~/code/studio-design.worktrees/hub-page",
        ChatProvider: "cursor",
        ChatModel: "claude-sonnet-4.6",
        CreatedAt: hours(8),
        UpdatedAt: hours(3),
    },
    {
        ID: "studio/keyboard-cheatsheet",
        ProjectID: "studio-design",
        Title: "Draft keyboard cheatsheet",
        WorktreeDir: "~/code/studio-design.worktrees/keyboard-cheatsheet",
        ChatProvider: "claude",
        ChatModel: "claude-sonnet-4.6",
        CreatedAt: days(1),
        UpdatedAt: days(1),
    },
];

const ProjectMock = {
    Get: async (id: string): Promise<MockProject | null> =>
        PROJECTS.find((p) => p.ID === id) ?? null,
    List: async (): Promise<MockProject[]> => [...PROJECTS],
};

const ThreadMock = {
    Get: async (id: string): Promise<MockThread | null> =>
        THREADS.find((t) => t.ID === id) ?? null,
    List: async (): Promise<MockThread[]> => [...THREADS],
    ListByProject: async (projectID: string): Promise<MockThread[]> =>
        THREADS.filter((t) => t.ProjectID === projectID),
    Rename: async (id: string, title: string): Promise<void> => {
        const idx = THREADS.findIndex((t) => t.ID === id);
        if (idx < 0) return;
        THREADS[idx] = {
            ...THREADS[idx],
            Title: title,
            UpdatedAt: new Date().toISOString(),
        };
    },
};

interface WailsWindow {
    go?: {
        app?: Record<string, Record<string, (...args: unknown[]) => unknown>>;
    };
    runtime?: unknown;
    __MOONDUST_DEV_MOCK__?: true;
}

function getWailsWindow(): WailsWindow | undefined {
    if (typeof window === "undefined") return undefined;
    return window as unknown as WailsWindow;
}

/**
 * Returns true when the dev mock has been installed (or when there is no
 * window object at all). Use this to gate side effects that only make sense
 * against a real backend (e.g. event subscriptions).
 */
export function isWailsDevMock(): boolean {
    const w = getWailsWindow();
    return Boolean(w?.__MOONDUST_DEV_MOCK__);
}

/**
 * Idempotent. Installs `window.go.app.{Project,Thread}` and a no-op runtime
 * shim if the real Wails bridge isn't already present. Safe to call from
 * `index.tsx` before any module touches the bindings.
 */
export function installWailsDevMock(): void {
    const w = getWailsWindow();
    if (!w) return;
    if (w.go?.app?.Project && w.go?.app?.Thread) return;

    w.go = w.go ?? {};
    w.go.app = w.go.app ?? {};
    w.go.app.Project = w.go.app.Project ?? (ProjectMock as never);
    w.go.app.Thread = w.go.app.Thread ?? (ThreadMock as never);

    w.runtime = w.runtime ?? {
        EventsOn: () => () => {},
        EventsOff: () => {},
        EventsEmit: () => {},
        WindowSetTitle: () => {},
        BrowserOpenURL: (url: string) => window.open(url, "_blank"),
    };

    w.__MOONDUST_DEV_MOCK__ = true;
}
