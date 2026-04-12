/** Derive a GitHub browse URL from a git remote URL (https or git@github.com). */
export function deriveGitHubURL(remoteURL: string | undefined): string | null {
    if (!remoteURL) return null;
    const sshMatch = remoteURL.match(/^git@github\.com:(.+?)(?:\.git)?$/);
    if (sshMatch) return `https://github.com/${sshMatch[1]}`;
    try {
        const url = new URL(remoteURL);
        if (url.hostname === "github.com") {
            return `https://github.com${url.pathname.replace(/\.git$/, "")}`;
        }
    } catch {
        /* not a URL */
    }
    return null;
}

/** Strip porcelain "branch...upstream" suffix for display. */
export function cleanBranchName(raw: string): string {
    const dotIdx = raw.indexOf("...");
    return dotIdx >= 0 ? raw.slice(0, dotIdx) : raw;
}

export const gitStatusColorMap: Record<string, string> = {
    A: "text-emerald-400",
    M: "text-amber-400",
    D: "text-red-400",
    R: "text-sky-400",
    C: "text-sky-400",
    untracked: "text-sky-400",
};

export function gitStatusColor(status: string): string {
    return gitStatusColorMap[status] ?? "text-slate-400";
}
