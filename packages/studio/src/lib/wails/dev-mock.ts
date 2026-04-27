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

const PROJECTS: MockProject[] = [
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

function nameFromGitURLMock(url: string): string {
    const u = url.replace(/\.git$/i, "").replace(/\/+$/, "");
    const parts = u.split(/[/:]/);
    return parts[parts.length - 1] || "repo";
}

const ProjectMock = {
    Get: async (id: string): Promise<MockProject | null> =>
        PROJECTS.find((p) => p.ID === id) ?? null,
    List: async (): Promise<MockProject[]> => [...PROJECTS],
    SelectWorkspaceFolder: async (): Promise<string> => {
        if (typeof window === "undefined") return "";
        const v = window.prompt(
            "Dev mock: enter a folder path (cancel to skip)",
            "/tmp/moondust-dev-workspace",
        );
        return v?.trim() ?? "";
    },
    CreateWorkspaceFromFolder: async (
        directory: string,
        name: string,
    ): Promise<MockProject> => {
        const dir = directory.trim();
        if (!dir) {
            throw new Error("directory is required");
        }
        const clean = dir.replace(/[/\\]+$/, "");
        for (const p of PROJECTS) {
            if (p.Directory.replace(/[/\\]+$/, "") === clean) {
                throw new Error("this folder is already opened as a workspace");
            }
        }
        const ts = new Date().toISOString();
        const base =
            name.trim() ||
            clean.split(/[/\\]/).filter(Boolean).pop() ||
            "Workspace";
        const proj: MockProject = {
            ID: `dev-${Date.now().toString(36)}`,
            Name: base,
            Directory: clean,
            Branch: "main",
            CreatedAt: ts,
            UpdatedAt: ts,
        };
        PROJECTS.push(proj);
        return proj;
    },
    CreateWorkspaceFromGit: async (
        remoteURL: string,
        name: string,
    ): Promise<MockProject> => {
        const url = remoteURL.trim();
        if (!url) {
            throw new Error("git URL is required");
        }
        const ts = new Date().toISOString();
        const id = `dev-${Date.now().toString(36)}`;
        const proj: MockProject = {
            ID: id,
            Name: name.trim() || nameFromGitURLMock(url),
            Directory: `~/.cache/moondust/repositories/${id}`,
            Branch: "main",
            CreatedAt: ts,
            UpdatedAt: ts,
        };
        PROJECTS.push(proj);
        return proj;
    },
};

const ThreadMock = {
    Create: async (
        projectID: string,
        title: string,
    ): Promise<MockThread> => {
        const pid = projectID.trim();
        if (!pid) {
            throw new Error("project is required");
        }
        if (!PROJECTS.some((p) => p.ID === pid)) {
            throw new Error("project: data not found");
        }
        const ts = new Date().toISOString();
        const id = `dev-thread-${Date.now().toString(36)}`;
        const t: MockThread = {
            ID: id,
            ProjectID: pid,
            Title: title.trim(),
            WorktreeDir: "",
            ChatProvider: "Cursor Agent",
            ChatModel: "claude-sonnet-4.6",
            CreatedAt: ts,
            UpdatedAt: ts,
        };
        THREADS.push(t);
        return t;
    },
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
