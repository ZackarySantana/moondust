/** Normalizes persisted `default_worktree` from settings for new-thread UX. */
export type DefaultWorktreePref = "ask" | "on" | "off";

export function normalizeDefaultWorktreePref(
    raw: string | undefined,
): DefaultWorktreePref {
    const t = (raw ?? "ask").trim().toLowerCase();
    if (t === "on" || t === "off") return t;
    return "ask";
}
