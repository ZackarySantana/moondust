import { createEffect, createSignal, on, onCleanup, onMount } from "solid-js";

export type ChatProviderMenuPanel = "provider" | "model" | null;

/**
 * Dropdown open state, model-picker search / org filter, and detail panel for
 * {@link ChatProviderBar}.
 */
export function useChatProviderBarMenu(currentProvider: () => string) {
    const [open, setOpen] = createSignal<ChatProviderMenuPanel>(null);
    const [searchQuery, setSearchQuery] = createSignal("");
    const [filterOrg, setFilterOrg] = createSignal<string | null>(null);
    const [detailModelId, setDetailModelId] = createSignal<string | null>(null);

    let rootEl: HTMLDivElement | undefined;

    function close() {
        setOpen(null);
        setSearchQuery("");
        setFilterOrg(null);
        setDetailModelId(null);
    }

    onMount(() => {
        const onDoc = (e: MouseEvent) => {
            if (open() === null) return;
            const t = e.target as Node;
            if (rootEl?.contains(t)) return;
            close();
        };
        document.addEventListener("mousedown", onDoc);
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open() !== null) {
                close();
            }
        };
        window.addEventListener("keydown", onKey);
        onCleanup(() => {
            document.removeEventListener("mousedown", onDoc);
            window.removeEventListener("keydown", onKey);
        });
    });

    createEffect(
        on(currentProvider, (p) => {
            if (p === "cursor" || p === "claude") {
                setFilterOrg(null);
                setSearchQuery("");
            }
        }),
    );

    function setRootEl(el: HTMLDivElement) {
        rootEl = el;
    }

    return {
        open,
        setOpen,
        searchQuery,
        setSearchQuery,
        filterOrg,
        setFilterOrg,
        detailModelId,
        setDetailModelId,
        close,
        setRootEl,
    };
}
