import { BrowserOpenURL } from "@wails/runtime";

/**
 * Opens an http(s) URL in the system default browser.
 *
 * In Wails, `window.open` and `<a target="_blank">` open an extra in-app webview
 * window instead of the user's browser — use this for external links.
 */
export function openExternalURL(url: string): void {
    const u = url.trim();
    if (!u) return;
    try {
        BrowserOpenURL(u);
    } catch {
        if (typeof window !== "undefined") {
            window.open(u, "_blank", "noopener,noreferrer");
        }
    }
}
