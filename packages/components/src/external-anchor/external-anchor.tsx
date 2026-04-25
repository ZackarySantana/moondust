import type { Component, JSX } from "solid-js";
import { splitProps } from "solid-js";

function runAnchorClickHandlers(
    handlers: JSX.AnchorHTMLAttributes<HTMLAnchorElement>["onClick"],
    e: MouseEvent & { currentTarget: HTMLAnchorElement; target: Element },
): void {
    if (handlers == null) return;
    const list = Array.isArray(handlers) ? handlers : [handlers];
    for (const h of list) {
        if (typeof h === "function") {
            (h as (ev: typeof e) => void)(e);
        }
    }
}

export type ExternalAnchorProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    /**
     * Override how external links are opened. When provided, the default
     * navigation is prevented and this callback runs with the href.
     *
     * Use this to route through Wails / Tauri / Electron's open-in-system-browser
     * APIs instead of letting the embedded webview navigate.
     */
    onOpenExternal?: (href: string) => void;
};

/**
 * Like a regular `<a target="_blank">` but with a hook for native shells to
 * open the URL in the user's system browser instead of the embedded webview.
 */
export const ExternalAnchor: Component<ExternalAnchorProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "href",
        "onClick",
        "onOpenExternal",
    ]);
    return (
        <a
            {...rest}
            href={local.href}
            target={rest.target ?? "_blank"}
            rel={rest.rel ?? "noopener noreferrer"}
            onClick={(e) => {
                if (local.onOpenExternal) {
                    e.preventDefault();
                    local.onOpenExternal(local.href);
                }
                runAnchorClickHandlers(local.onClick, e);
            }}
        />
    );
};
