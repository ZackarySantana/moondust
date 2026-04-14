const GIT_SCP_REMOTE_RE = /^[^@\s]+@[^:\s]+:(.+)$/;

export type CreateProjectTab = "url" | "folder";

function repoNameFromPathSegment(lastSegment: string): string {
    return lastSegment.replace(/\.git$/i, "").trim();
}

export function deriveNameFromUrl(raw: string): string {
    const t = raw.trim();
    if (!t) return "";

    const scp = t.match(GIT_SCP_REMOTE_RE);
    if (scp) {
        const segments = scp[1].split("/").filter(Boolean);
        const last = segments[segments.length - 1] ?? "";
        return repoNameFromPathSegment(last);
    }

    try {
        const u = new URL(t.includes("://") ? t : `https://${t}`);
        const parts = u.pathname.split("/").filter(Boolean);
        if (parts.length >= 1) {
            return (
                repoNameFromPathSegment(parts[parts.length - 1] ?? "") ||
                u.hostname.replace(/^www\./, "")
            );
        }
        return u.hostname.replace(/^www\./, "") || "";
    } catch {
        return "";
    }
}

export function parseGitRemoteUrl(raw: string): { cloneUrl: string } | null {
    const t = raw.trim();
    if (!t) return null;
    if (GIT_SCP_REMOTE_RE.test(t)) return { cloneUrl: t };
    try {
        const u = new URL(t.includes("://") ? t : `https://${t}`);
        return { cloneUrl: u.href };
    } catch {
        return null;
    }
}

export function deriveNameFromFolderPath(path: string): string {
    const t = path.trim();
    if (!t) return "";
    const parts = t.split(/[/\\]/).filter(Boolean);
    return parts[parts.length - 1] ?? "";
}

export function isUserCanceled(err: unknown): boolean {
    const msg = err instanceof Error ? err.message : String(err);
    return /context canceled|context cancelled/i.test(msg);
}

export function canSubmitCreateProjectForm(
    tab: CreateProjectTab,
    resolvedName: string,
    urlDraft: string,
    folderPath: string,
    folderDefaultBranch: string,
): boolean {
    if (!resolvedName.trim()) return false;
    if (tab === "url") {
        return urlDraft.trim().length > 0;
    }
    return (
        folderPath.trim().length > 0 && folderDefaultBranch.trim().length > 0
    );
}
