import GitFork from "lucide-solid/icons/git-fork";
import Loader2 from "lucide-solid/icons/loader-2";
import type { Component } from "solid-js";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { Button } from "../button/button";

export interface AssistantMessageForkButtonProps {
    onFork: () => Promise<void> | void;
    /** Optional helper text shown in the confirm popover. */
    description?: string;
    confirmLabel?: string;
    title?: string;
}

export const AssistantMessageForkButton: Component<
    AssistantMessageForkButtonProps
> = (props) => {
    const [open, setOpen] = createSignal(false);
    const [pending, setPending] = createSignal(false);

    let buttonEl!: HTMLButtonElement;
    let panelEl!: HTMLDivElement;

    onMount(() => {
        const onDoc = (e: MouseEvent) => {
            if (!open()) return;
            const t = e.target as Node;
            if (buttonEl?.contains(t) || panelEl?.contains(t)) return;
            setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        onCleanup(() => document.removeEventListener("mousedown", onDoc));
    });

    async function confirm() {
        if (pending()) return;
        setPending(true);
        try {
            await props.onFork();
            setOpen(false);
        } finally {
            setPending(false);
        }
    }

    return (
        <div class="relative inline-flex">
            <button
                type="button"
                ref={(el) => {
                    buttonEl = el;
                }}
                class="cursor-pointer rounded-none p-1 text-void-500 transition-colors duration-100 hover:bg-void-800/60 hover:text-void-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={props.title ?? "Fork from this message"}
                aria-expanded={open()}
                onClick={() => setOpen((v) => !v)}
            >
                <GitFork
                    class="size-3.5"
                    stroke-width={2}
                    aria-hidden
                />
            </button>
            <Show when={open()}>
                <div
                    ref={(el) => {
                        panelEl = el;
                    }}
                    class="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-none border border-void-700 bg-void-900 p-3 shadow-2xl shadow-black/50"
                    role="dialog"
                    aria-label={props.title ?? "Fork from this message"}
                >
                    <p class="text-[12px] font-medium text-void-50">
                        {props.title ?? "Fork from this message"}
                    </p>
                    <p class="mt-1 text-[11px] leading-relaxed text-void-400">
                        {props.description ??
                            "Creates a new thread that branches off here. The original thread is unchanged."}
                    </p>
                    <div class="mt-3 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setOpen(false)}
                            disabled={pending()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            class="min-w-20"
                            disabled={pending()}
                            onClick={() => void confirm()}
                        >
                            <Show
                                when={pending()}
                                fallback={props.confirmLabel ?? "Fork"}
                            >
                                <>
                                    <Loader2
                                        class="size-3.5 animate-spin"
                                        stroke-width={2}
                                        aria-hidden
                                    />
                                    <span>Forking…</span>
                                </>
                            </Show>
                        </Button>
                    </div>
                </div>
            </Show>
        </div>
    );
};
