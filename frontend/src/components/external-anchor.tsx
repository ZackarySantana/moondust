import type { Component, JSX } from "solid-js";
import { splitProps } from "solid-js";
import { openExternalURL } from "@/lib/open-external-url";

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

/**
 * Like `<a href="https://…">` but opens in the system browser (Wails
 * {@link openExternalURL}) instead of an in-app webview.
 */
export const ExternalAnchor: Component<
    JSX.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
> = (props) => {
    const [local, rest] = splitProps(props, ["href", "onClick"]);
    return (
        <a
            {...rest}
            href={local.href}
            rel={rest.rel ?? "noreferrer"}
            onClick={(e) => {
                e.preventDefault();
                openExternalURL(local.href);
                runAnchorClickHandlers(local.onClick, e);
            }}
        />
    );
};
