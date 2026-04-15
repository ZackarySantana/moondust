import type { store } from "@wails/go/models";

/** Anthropic account console (usage, billing, limits). */
export const ANTHROPIC_CONSOLE_URL = "https://console.anthropic.com/";

/** Claude Code install docs (when `claude` is not on PATH; matches backend probe). */
export const CLAUDE_CODE_INSTALL_URL =
    "https://docs.anthropic.com/en/docs/claude-code";

export const CLAUDE_NOT_INSTALLED_HINT = `Install from ${CLAUDE_CODE_INSTALL_URL}`;

/** Sign in to Claude Code in a terminal (Anthropic CLI). */
export const CLAUDE_LOGIN_COMMAND = "claude auth login";

/**
 * When `claude auth status` failed but stderr was JSON (e.g. older behavior),
 * avoid showing raw JSON in the UI.
 */
export function friendlyClaudeAuthErrorMessage(
    raw: string | undefined,
): string {
    const s = raw?.trim() ?? "";
    if (!s.startsWith("{")) return s;
    try {
        const o = JSON.parse(s) as { loggedIn?: unknown };
        if (o && o.loggedIn === false) {
            return `Not signed in. Run ${CLAUDE_LOGIN_COMMAND} in a terminal.`;
        }
    } catch {
        /* ignore */
    }
    return s;
}

export function formatClaudeSubscriptionLabel(s: string | undefined): string {
    const t = s?.trim();
    if (!t) return "—";
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

/** Short line for sidebar / summaries: email, auth method, or signed-in fallback. */
export function formatClaudeAccountLine(
    a: store.ClaudeAuthStatus | undefined,
): string {
    if (!a?.logged_in) return "Not signed in";
    const email = a.email?.trim();
    if (email) return email;
    const method = a.auth_method?.trim();
    if (method) return method;
    return "Signed in";
}
