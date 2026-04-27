/**
 * Global settings IPC — lives in studio so we do not edit Wails-generated `wailsjs/`.
 * After `wails generate`, bindings appear under `packages/wails-app/wailsjs/`; swap this
 * module to re-export from there if you prefer generated types.
 */

export type GlobalSettingsRow = {
    SSHAuthsocket: string;
    DefaultWorktree: string;
    UtilityProvider: string;
    UpdatedAt?: unknown;
};

type GlobalSettingsSavePayload = Pick<
    GlobalSettingsRow,
    "SSHAuthsocket" | "DefaultWorktree" | "UtilityProvider"
>;

type SettingsBinding = {
    GetGlobal: () => Promise<GlobalSettingsRow>;
    SaveGlobal: (row: GlobalSettingsSavePayload) => Promise<void>;
};

function getSettings(): SettingsBinding {
    const b = (
        window as unknown as {
            go?: { app?: { Settings?: SettingsBinding } };
        }
    ).go?.app?.Settings;
    if (!b?.GetGlobal || !b?.SaveGlobal) {
        throw new Error("Wails Settings binding is not available");
    }
    return b;
}

export function GetGlobalSettings(): Promise<GlobalSettingsRow> {
    return getSettings().GetGlobal();
}

/** Omits read-only fields the backend sets (e.g. UpdatedAt). */
export function SaveGlobalSettings(
    row: GlobalSettingsSavePayload,
): Promise<void> {
    return getSettings().SaveGlobal(row);
}
