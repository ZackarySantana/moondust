import type { store } from "@wails/go/models";

/** Anthropic account console (usage, billing, limits). */
export const ANTHROPIC_CONSOLE_URL = "https://console.anthropic.com/";

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
