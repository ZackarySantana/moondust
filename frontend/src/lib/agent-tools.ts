/** Chat agent tool ids (mirror backend workspace / optional tools). Used for settings UI. */

export const AGENT_TOOL_DEFINITIONS = [
    {
        id: "read_workspace_file",
        title: "Read workspace file",
        description:
            "Read text files under the thread working directory (relative paths).",
    },
    {
        id: "list_workspace_directory",
        title: "List workspace directory",
        description:
            "List files and folders in a path under the working directory (non-recursive).",
    },
    {
        id: "edit_workspace_file",
        title: "Edit workspace file",
        description:
            "Search-and-replace a single occurrence in an existing file.",
    },
    {
        id: "write_workspace_file",
        title: "Write workspace file",
        description:
            "Create or overwrite a file; parent directories are created as needed.",
    },
    {
        id: "grep_workspace",
        title: "Grep workspace",
        description:
            "Search files for a literal substring (skips heavy dirs like node_modules).",
    },
    {
        id: "find_workspace_files",
        title: "Find workspace files",
        description:
            "List file paths matching a filename prefix and/or suffix.",
    },
    {
        id: "web_search",
        title: "Web search",
        description:
            "Search the public web via DuckDuckGo instant answers (no API key).",
    },
] as const;

export type AgentToolId = (typeof AGENT_TOOL_DEFINITIONS)[number]["id"];

export function defaultAgentToolState(): Record<AgentToolId, boolean> {
    return Object.fromEntries(
        AGENT_TOOL_DEFINITIONS.map((t) => [t.id, true]),
    ) as Record<AgentToolId, boolean>;
}

/** Merge server map (from GetSettings) into a full tool → on/off record. */
export function agentToolStateFromSettings(
    settings:
        | { agent_tools_enabled?: Record<string, boolean> }
        | undefined,
): Record<AgentToolId, boolean> {
    const base = defaultAgentToolState();
    const m = settings?.agent_tools_enabled;
    if (!m) return base;
    for (const t of AGENT_TOOL_DEFINITIONS) {
        const v = m[t.id];
        if (typeof v === "boolean") {
            base[t.id] = v;
        }
    }
    return base;
}

export function agentToolStateToSettingsMap(
    state: Record<AgentToolId, boolean>,
): Record<string, boolean> {
    const out: Record<string, boolean> = {};
    for (const t of AGENT_TOOL_DEFINITIONS) {
        out[t.id] = state[t.id];
    }
    return out;
}
