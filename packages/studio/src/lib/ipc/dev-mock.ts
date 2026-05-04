/**
 * Dev-only mock backend for `packages/studio`: use with `installIPCDevMock()` so
 * `bun dev` / Storybook work without the Go sash process.
 *
 * Payload shapes mirror Go encoding/json defaults (`ID`, `Name`, …).
 */

import type { GlobalSettingsRow, Thread, Workspace } from "./types";

declare global {
    interface Window {
        __MOONDUST_DEV_IPC_MOCK__?: true;
    }
}

const now = Date.now();
const minutes = (m: number): string => new Date(now - m * 60_000).toISOString();
const hours = (h: number): string =>
    new Date(now - h * 3_600_000).toISOString();
const days = (d: number): string =>
    new Date(now - d * 86_400_000).toISOString();

const WORKSPACES: Workspace[] = [
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

const THREADS: Thread[] = [
    {
        ID: "moon/refactor-router",
        WorkspaceID: "moondust",
        Title: "Refactor router and replace floating-ui",
        WorktreeDir: "~/code/moondust.worktrees/moon-refactor-router",
        ChatProvider: "cursor",
        ChatModel: "claude-sonnet-4.6",
        CreatedAt: hours(6),
        UpdatedAt: minutes(2),
    },
    {
        ID: "moon/studio-ipc",
        WorkspaceID: "moondust",
        Title: "Wire sash IPC into studio",
        WorktreeDir: "~/code/moondust.worktrees/moon-studio-ipc",
        ChatProvider: "cursor",
        ChatModel: "claude-sonnet-4.6",
        CreatedAt: hours(20),
        UpdatedAt: minutes(18),
    },
    {
        ID: "moon/thread-tests",
        WorkspaceID: "moondust",
        Title: "Tests for thread store",
        WorktreeDir: "~/code/moondust.worktrees/moon-thread-tests",
        ChatProvider: "cursor",
        ChatModel: "claude-sonnet-4.6",
        CreatedAt: days(2),
        UpdatedAt: hours(1),
    },
    {
        ID: "moon/theme-tokens",
        WorkspaceID: "moondust",
        Title: "Notes on theme tokens",
        WorktreeDir: "~/code/moondust.worktrees/moon-theme-tokens",
        ChatProvider: "cursor",
        ChatModel: "claude-sonnet-4.6",
        CreatedAt: days(4),
        UpdatedAt: days(2),
    },
    {
        ID: "studio/hub-page",
        WorkspaceID: "studio-design",
        Title: "Mock the Hub page",
        WorktreeDir: "~/code/studio-design.worktrees/hub-page",
        ChatProvider: "cursor",
        ChatModel: "claude-sonnet-4.6",
        CreatedAt: hours(8),
        UpdatedAt: hours(3),
    },
    {
        ID: "studio/keyboard-cheatsheet",
        WorkspaceID: "studio-design",
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
    return parts[parts.length - 1] ?? "repo";
}

/** In-memory global settings for dev / Storybook (lost on full reload). */
let mockGlobalSettings: GlobalSettingsRow = {
    SSHAuthsocket: "",
    DefaultWorktree: "on",
    UtilityProvider: "openrouter",
    UpdatedAt: new Date().toISOString(),
};

export async function mockListWorkspaces(): Promise<Workspace[]> {
    return [...WORKSPACES];
}

export async function mockGetWorkspace(id: string): Promise<Workspace | null> {
    return WORKSPACES.find((p) => p.ID === id) ?? null;
}

export async function mockSelectWorkspaceFolder(): Promise<string> {
    if (typeof window === "undefined") return "";
    const v = window.prompt(
        "Dev mock: enter a folder path (cancel to skip)",
        "/tmp/moondust-dev-workspace",
    );
    return v?.trim() ?? "";
}

export async function mockCreateWorkspaceFromFolder(
    directory: string,
    name: string,
): Promise<Workspace> {
    const dir = directory.trim();
    if (!dir) throw new Error("directory is required");
    const clean = dir.replace(/[/\\]+$/, "");
    for (const p of WORKSPACES) {
        if (p.Directory.replace(/[/\\]+$/, "") === clean) {
            throw new Error("this folder is already opened as a workspace");
        }
    }
    const ts = new Date().toISOString();
    const base =
        name.trim() ||
        clean.split(/[/\\]/).filter(Boolean).pop() ||
        "Workspace";
    const ws: Workspace = {
        ID: `dev-${Date.now().toString(36)}`,
        Name: base,
        Directory: clean,
        Branch: "main",
        CreatedAt: ts,
        UpdatedAt: ts,
    };
    WORKSPACES.push(ws);
    return ws;
}

export async function mockCreateWorkspaceFromGit(
    remoteURL: string,
    name: string,
): Promise<Workspace> {
    const url = remoteURL.trim();
    if (!url) throw new Error("git URL is required");
    const ts = new Date().toISOString();
    const id = `dev-${Date.now().toString(36)}`;
    const ws: Workspace = {
        ID: id,
        Name: name.trim() || nameFromGitURLMock(url),
        Directory: `~/.cache/moondust/repositories/${id}`,
        Branch: "main",
        CreatedAt: ts,
        UpdatedAt: ts,
    };
    WORKSPACES.push(ws);
    return ws;
}

export async function mockUpdateWorkspaceDetails(
    id: string,
    name: string,
    baseBranch: string,
): Promise<void> {
    const wid = id.trim();
    const n = name.trim();
    const b = baseBranch.trim();
    if (!wid) throw new Error("workspace id is required");
    if (!n) throw new Error("name is required");
    if (!b) throw new Error("base branch is required");
    const ws = WORKSPACES.find((w) => w.ID === wid);
    if (!ws) throw new Error("workspace not found");
    ws.Name = n;
    ws.Branch = b;
    ws.UpdatedAt = new Date().toISOString();
}

export async function mockListThreads(): Promise<Thread[]> {
    return [...THREADS];
}

export async function mockListThreadsByWorkspace(
    workspaceID: string,
): Promise<Thread[]> {
    return THREADS.filter((t) => t.WorkspaceID === workspaceID);
}

export async function mockGetThread(id: string): Promise<Thread | null> {
    return THREADS.find((t) => t.ID === id) ?? null;
}

export async function mockCreateThread(
    workspaceID: string,
    title: string,
): Promise<Thread> {
    const wid = workspaceID.trim();
    if (!wid) throw new Error("workspace is required");
    if (!WORKSPACES.some((p) => p.ID === wid)) {
        throw new Error("workspace: data not found");
    }
    const ts = new Date().toISOString();
    const id = `dev-thread-${Date.now().toString(36)}`;
    const t: Thread = {
        ID: id,
        WorkspaceID: wid,
        Title: title.trim(),
        WorktreeDir: "",
        ChatProvider: "Cursor Agent",
        ChatModel: "claude-sonnet-4.6",
        CreatedAt: ts,
        UpdatedAt: ts,
    };
    THREADS.push(t);
    return t;
}

export async function mockRenameThread(
    id: string,
    title: string,
): Promise<void> {
    const idx = THREADS.findIndex((t) => t.ID === id);
    if (idx < 0) return;
    THREADS[idx] = {
        ...THREADS[idx],
        Title: title,
        UpdatedAt: new Date().toISOString(),
    };
}

export async function mockGetGlobalSettings(): Promise<GlobalSettingsRow> {
    return { ...mockGlobalSettings };
}

export async function mockSaveGlobalSettings(row: {
    SSHAuthsocket?: string;
    DefaultWorktree?: string;
    UtilityProvider?: string;
}): Promise<void> {
    mockGlobalSettings = {
        ...mockGlobalSettings,
        ...row,
        UpdatedAt: new Date().toISOString(),
    };
}

/** False on the server / when the flag was never set. */
export function isIPCDevMock(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(window.__MOONDUST_DEV_IPC_MOCK__);
}

/**
 * Marks the SPA as offline-mock-backed. Actual RPC calls branch in `@/lib/ipc`.
 */
export function installIPCDevMock(): void {
    if (typeof window === "undefined") return;
    window.__MOONDUST_DEV_IPC_MOCK__ = true;
}
