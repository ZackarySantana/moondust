import {
    autoUpdate,
    computePosition,
    flip,
    offset,
    shift,
} from "@floating-ui/dom";
import GitFork from "lucide-solid/icons/git-fork";
import Loader2 from "lucide-solid/icons/loader-2";
import type { Component } from "solid-js";
import { createEffect, createSignal, onCleanup, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { Button } from "@/components/ui/button";

export const AssistantMessageForkButton: Component<{
    /** Matches whether the current thread has a git worktree (fork follows the same rule). */
    sourceUsesWorktree: boolean;
    /** Runs the fork (Wails call lives in a parent container). */
    fork: () => Promise<unknown>;
    forkPending: boolean;
    forkError: unknown;
}> = (props) => {
    const [open, setOpen] = createSignal(false);
    const [pos, setPos] = createSignal<{ x: number; y: number } | null>(null);

    let buttonEl!: HTMLButtonElement;
    let panelEl!: HTMLDivElement;

    onMount(() => {
        const onDoc = (e: MouseEvent) => {
            if (!open()) return;
            const t = e.target as Node;
            if (buttonEl?.contains(t) || panelEl?.contains(t)) return;
            setOpen(false);
            setPos(null);
        };
        document.addEventListener("mousedown", onDoc);
        onCleanup(() => document.removeEventListener("mousedown", onDoc));
    });

    createEffect(() => {
        if (!open()) {
            setPos(null);
            return;
        }

        let stopAutoUpdate: (() => void) | undefined;
        let cancelled = false;
        let rafOuter = 0;
        let rafInner = 0;

        const start = () => {
            const reference = buttonEl;
            const floating = panelEl;
            if (!reference || !floating || cancelled) return;

            async function updatePosition() {
                const { x, y } = await computePosition(reference, floating, {
                    placement: "bottom-start",
                    strategy: "fixed",
                    middleware: [
                        offset(4),
                        flip({
                            padding: 8,
                            fallbackPlacements: [
                                "top-start",
                                "bottom-end",
                                "top-end",
                                "left-start",
                                "right-start",
                            ],
                        }),
                        shift({
                            padding: 8,
                            crossAxis: true,
                        }),
                    ],
                });
                if (!cancelled) {
                    setPos({ x, y });
                }
            }

            void updatePosition();
            stopAutoUpdate = autoUpdate(reference, floating, () => {
                void updatePosition();
            });
        };

        rafOuter = requestAnimationFrame(() => {
            rafInner = requestAnimationFrame(start);
        });

        onCleanup(() => {
            cancelled = true;
            cancelAnimationFrame(rafOuter);
            cancelAnimationFrame(rafInner);
            stopAutoUpdate?.();
            setPos(null);
        });
    });

    const explainer = () =>
        props.sourceUsesWorktree
            ? "This thread uses a git worktree. The new thread will get its own worktree and branch, like this one."
            : "This thread uses the project folder directly. The fork stays on that same directory—no new worktree.";

    return (
        <div class="inline-flex shrink-0">
            <button
                type="button"
                ref={(el) => {
                    buttonEl = el;
                }}
                class="rounded p-0.5 text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-300"
                title="Fork thread from here"
                aria-label="Fork thread from here"
                aria-expanded={open()}
                disabled={props.forkPending}
                onClick={() => {
                    if (props.forkPending) return;
                    if (open()) {
                        setOpen(false);
                        setPos(null);
                    } else {
                        setOpen(true);
                    }
                }}
            >
                <Show
                    when={props.forkPending}
                    fallback={
                        <GitFork
                            class="size-3.5"
                            stroke-width={2}
                            aria-hidden
                        />
                    }
                >
                    <Loader2
                        class="size-3.5 animate-spin"
                        stroke-width={2}
                        aria-hidden
                    />
                </Show>
            </button>
            <Show when={open()}>
                <Portal mount={document.body}>
                    <div
                        ref={(el) => {
                            panelEl = el;
                        }}
                        class="fixed z-100 max-w-[min(20rem,calc(100vw-1rem))] rounded-md border border-slate-800/60 bg-slate-950/98 px-3 py-2.5 text-[11px] text-slate-300 shadow-lg backdrop-blur-sm"
                        style={{
                            left: pos() != null ? `${pos()!.x}px` : "-9999px",
                            top: pos() != null ? `${pos()!.y}px` : "0px",
                            visibility: pos() != null ? "visible" : "hidden",
                        }}
                        role="dialog"
                        aria-label="Fork thread"
                    >
                        <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                            Fork thread
                        </p>
                        <p class="mb-3 leading-snug text-slate-400">
                            {explainer()}
                        </p>
                        <Show when={props.forkError != null}>
                            <p class="mb-2 rounded border border-red-900/35 bg-red-950/20 px-2 py-1.5 text-[10px] text-red-400">
                                {props.forkError instanceof Error
                                    ? props.forkError.message
                                    : String(props.forkError)}
                            </p>
                        </Show>
                        <div class="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                class="h-7 min-h-7 px-2 text-[11px]"
                                onClick={() => {
                                    setOpen(false);
                                    setPos(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                class="h-7 min-h-7 px-2 text-[11px]"
                                disabled={props.forkPending}
                                onClick={() => {
                                    void props
                                        .fork()
                                        .then(() => {
                                            setOpen(false);
                                            setPos(null);
                                        })
                                        .catch(() => {
                                            /* error surfaced via forkError */
                                        });
                                }}
                            >
                                Create fork
                            </Button>
                        </div>
                    </div>
                </Portal>
            </Show>
        </div>
    );
};
