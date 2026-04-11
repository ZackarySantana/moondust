import X from "lucide-solid/icons/x";
import type { Component } from "solid-js";
import { createSignal, For, onCleanup, onMount } from "solid-js";
import { EventsOn } from "@wails/runtime/runtime";

interface Toast {
    id: number;
    title: string;
    body: string;
}

let nextId = 0;

export const NotificationToast: Component = () => {
    const [toasts, setToasts] = createSignal<Toast[]>([]);

    onMount(() => {
        const off = EventsOn("notification", (...args: unknown[]) => {
            const payload = args[0] as {
                title?: string;
                body?: string;
            };
            if (!payload?.title) return;
            const id = nextId++;
            setToasts((prev) => [
                ...prev,
                { id, title: payload.title!, body: payload.body ?? "" },
            ]);
            setTimeout(() => dismiss(id), 5000);
        });
        onCleanup(off);
    });

    function dismiss(id: number) {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }

    return (
        <div class="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col gap-2">
            <For each={toasts()}>
                {(toast) => (
                    <div class="pointer-events-auto flex w-80 items-start gap-3 rounded-lg border border-emerald-800/30 bg-slate-900/95 px-4 py-3 shadow-lg shadow-black/30 backdrop-blur-sm animate-fade-in">
                        <div class="min-w-0 flex-1">
                            <p class="text-[13px] font-medium text-slate-100">
                                {toast.title}
                            </p>
                            {toast.body && (
                                <p class="mt-0.5 text-xs leading-relaxed text-slate-400">
                                    {toast.body}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            class="shrink-0 cursor-pointer rounded p-0.5 text-slate-600 transition-colors hover:text-slate-300"
                            onClick={() => dismiss(toast.id)}
                        >
                            <X
                                class="size-3.5"
                                stroke-width={2}
                                aria-hidden
                            />
                        </button>
                    </div>
                )}
            </For>
        </div>
    );
};
