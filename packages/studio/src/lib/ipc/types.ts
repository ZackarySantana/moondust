/** JSON payloads from moondust `internal/v2/store` structs (exported field names). */
export type Workspace = {
    ID: string;
    Name: string;
    Directory: string;
    Branch: string;
    CreatedAt?: string;
    UpdatedAt?: string;
};

export type Thread = {
    ID: string;
    WorkspaceID: string;
    Title: string;
    WorktreeDir: string;
    ChatProvider: string;
    ChatModel: string;
    CreatedAt?: string;
    UpdatedAt?: string;
};

/** Matches Go `GlobalSettings` json tags (`SSHAuthsocket`, …). */
export type GlobalSettingsRow = {
    SSHAuthsocket: string;
    DefaultWorktree: string;
    UtilityProvider: string;
    UpdatedAt?: unknown;
};
