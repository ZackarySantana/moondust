/**
 * Centralized URL builders for the studio router. All consumers should
 * import from here so a future restructure is one-edit.
 */
export const paths = {
    hub: () => "/",
    workspace: (projectId: string) => `/w/${projectId}`,
    workspaceSettings: (projectId: string) => `/w/${projectId}/settings`,
    thread: (projectId: string, threadId: string) =>
        `/w/${projectId}/t/${encodeURIComponent(threadId)}`,
    globalSettings: () => "/settings",
};
