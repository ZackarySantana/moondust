export const paths = {
    hub: () => "/",
    globalSettings: () => "/settings",
    workspace: (workspaceId: string) => `/w/${workspaceId}`,
    workspaceSettings: (workspaceId: string) => `/w/${workspaceId}/settings`,
    thread: (workspaceId: string, threadId: string) =>
        `/w/${workspaceId}/t/${encodeURIComponent(threadId)}`,
};
