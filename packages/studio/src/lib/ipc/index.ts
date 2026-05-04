/**
 * Browser ↔ Go sash RPC — single import surface (replaces `@wails/*`).
 */

import {
    API,
    configureSashBindings,
    devApiBaseURL,
    eventsURL,
} from "@/bindings";
import * as dm from "./dev-mock";

export type { GlobalSettingsRow, Thread, Workspace } from "./types";
export { API, configureSashBindings, devApiBaseURL, eventsURL };
export { installIPCDevMock, isIPCDevMock } from "./dev-mock";

export type GlobalSettingsSavePayload = Pick<
    import("./types").GlobalSettingsRow,
    "SSHAuthsocket" | "DefaultWorktree" | "UtilityProvider"
>;

async function thru<T>(
    prod: () => Promise<T>,
    mockFn: () => Promise<T>,
): Promise<T> {
    if (dm.isIPCDevMock()) return mockFn();
    return prod();
}

export async function ListWorkspaces(): Promise<import("./types").Workspace[]> {
    return thru(async () => {
        const list = await API.ListWorkspaces();
        return (list ?? []) as import("./types").Workspace[];
    }, dm.mockListWorkspaces);
}

export async function GetWorkspace(id: string) {
    return thru(
        async () => {
            const w = await API.GetWorkspace(id);
            return (w ?? null) as import("./types").Workspace | null;
        },
        () => dm.mockGetWorkspace(id),
    );
}

export async function SelectWorkspaceFolder(): Promise<string> {
    return thru(
        async () => (await API.SelectWorkspaceFolder()) ?? "",
        dm.mockSelectWorkspaceFolder,
    );
}

export async function CreateWorkspaceFromFolder(
    directory: string,
    name: string,
) {
    return thru(
        async () => {
            const w = await API.CreateWorkspaceFromFolder(directory, name);
            if (!w || !(w as { ID?: unknown }).ID) {
                throw new Error("CreateWorkspaceFromFolder: invalid response");
            }
            return w as import("./types").Workspace;
        },
        () => dm.mockCreateWorkspaceFromFolder(directory, name),
    );
}

export async function CreateWorkspaceFromGit(remoteURL: string, name: string) {
    return thru(
        async () => {
            const w = await API.CreateWorkspaceFromGit(remoteURL, name);
            if (!w || !(w as { ID?: unknown }).ID) {
                throw new Error("CreateWorkspaceFromGit: invalid response");
            }
            return w as import("./types").Workspace;
        },
        () => dm.mockCreateWorkspaceFromGit(remoteURL, name),
    );
}

export async function UpdateWorkspaceDetails(
    id: string,
    name: string,
    baseBranch: string,
): Promise<void> {
    return thru(
        async () => {
            await API.UpdateWorkspaceDetails(id, name, baseBranch);
        },
        async () => {
            await dm.mockUpdateWorkspaceDetails(id, name, baseBranch);
        },
    );
}

export async function ListThreads(): Promise<import("./types").Thread[]> {
    return thru(async () => {
        const list = await API.ListThreads();
        return (list ?? []) as import("./types").Thread[];
    }, dm.mockListThreads);
}

export async function ListThreadsByWorkspace(workspaceID: string) {
    return thru(
        async () => {
            const list = await API.ListThreadsByWorkspace(workspaceID);
            return (list ?? []) as import("./types").Thread[];
        },
        () => dm.mockListThreadsByWorkspace(workspaceID),
    );
}

export async function GetThread(id: string) {
    return thru(
        async () => {
            const t = await API.GetThread(id);
            return (t ?? null) as import("./types").Thread | null;
        },
        () => dm.mockGetThread(id),
    );
}

export async function CreateThread(workspaceID: string, title: string) {
    return thru(
        async () => {
            const t = await API.CreateThread(workspaceID, title);
            if (!t || !(t as { ID?: unknown }).ID) {
                throw new Error("CreateThread: invalid response");
            }
            return t as import("./types").Thread;
        },
        () => dm.mockCreateThread(workspaceID, title),
    );
}

export async function RenameThread(id: string, title: string): Promise<void> {
    return thru(
        async () => {
            await API.RenameThread(id, title);
        },
        async () => {
            await dm.mockRenameThread(id, title);
        },
    );
}

export async function GetGlobalSettings(): Promise<
    import("./types").GlobalSettingsRow
> {
    return thru(async () => {
        const g = await API.GetGlobalSettings();
        const row = g as import("./types").GlobalSettingsRow;
        return {
            SSHAuthsocket: String(row?.SSHAuthsocket ?? ""),
            DefaultWorktree: String(row?.DefaultWorktree ?? ""),
            UtilityProvider: String(row?.UtilityProvider ?? ""),
            UpdatedAt: row?.UpdatedAt,
        };
    }, dm.mockGetGlobalSettings);
}

export async function SaveGlobalSettings(
    row: GlobalSettingsSavePayload,
): Promise<void> {
    return thru(
        async () => {
            await API.SaveGlobalSettings(row);
        },
        async () => {
            await dm.mockSaveGlobalSettings(row);
        },
    );
}
