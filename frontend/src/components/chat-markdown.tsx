import DOMPurify from "dompurify";
import { marked } from "marked";
import type { Component } from "solid-js";
import { createEffect } from "solid-js";
import { openExternalURL } from "@/lib/open-external-url";
import { cn } from "@/lib/utils";

marked.setOptions({
    gfm: true,
    breaks: true,
});

function markdownToSafeHtml(source: string): string {
    if (source.length === 0) {
        return "";
    }
    const raw = marked.parse(source, { async: false }) as string;
    const sanitized = DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
    const doc = new DOMParser().parseFromString(sanitized, "text/html");
    doc.querySelectorAll("a[href]").forEach((a) => {
        a.setAttribute("rel", "noopener noreferrer");
    });
    return doc.body.innerHTML;
}

/**
 * Renders assistant/user message bodies as sanitized HTML.
 *
 * **Not normal Tailwind:** content is produced by `marked` and injected as HTML, so inner nodes
 * are styled via `.chat-markdown` / `.chat-markdown--user` in `style.css`, not per-element utilities.
 */
export const ChatMarkdown: Component<{
    source: string;
    class?: string;
    /** Tweak link contrast for user bubbles on emerald background. */
    variant?: "assistant" | "user";
}> = (props) => {
    let root!: HTMLDivElement;

    createEffect(() => {
        const src = props.source;
        try {
            root.innerHTML = markdownToSafeHtml(src);
        } catch {
            root.textContent = src;
        }
    });

    function onLinkClick(e: MouseEvent) {
        const t = e.target as HTMLElement | null;
        const a = t?.closest?.("a[href]") as HTMLAnchorElement | null;
        if (!a || !root?.contains(a)) return;
        const href = a.getAttribute("href");
        if (!href || (!href.startsWith("http://") && !href.startsWith("https://")))
            return;
        e.preventDefault();
        e.stopPropagation();
        openExternalURL(href);
    }

    return (
        <div
            ref={(el) => {
                root = el;
            }}
            class={cn(
                "chat-markdown min-w-0 wrap-break-word",
                props.variant === "user" && "chat-markdown--user",
                props.class,
            )}
            onClick={onLinkClick}
        />
    );
};
