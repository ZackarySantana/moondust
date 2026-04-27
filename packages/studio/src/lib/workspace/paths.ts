export const paths = {
    hub: () => "/",
    /** Default global settings tab (vertical nav). */
    globalSettings: () => "/settings/general",
    globalSettingsSection: (sectionId: string) => `/settings/${sectionId}`,
    globalSettingsGit: (subsection: "worktrees" | "authentication") =>
        `/settings/git/${subsection}`,
    workspace: (workspaceId: string) => `/w/${workspaceId}`,
    workspaceSettings: (workspaceId: string) => `/w/${workspaceId}/settings`,
    thread: (workspaceId: string, threadId: string) =>
        `/w/${workspaceId}/t/${encodeURIComponent(threadId)}`,
};
