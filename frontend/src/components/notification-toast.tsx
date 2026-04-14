import X from "lucide-solid/icons/x";
import { useNavigate } from "@solidjs/router";
import type { Component } from "solid-js";
import { createSignal, For, onCleanup, onMount } from "solid-js";
import { EventsOn } from "@wails/runtime/runtime";

export type NotificationToastItem = {
    id: number;
    title: string;
    body: string;
    deepLink: string;
};

let nextId = 0;

function openActionLabel(path: string): string {
    if (path.includes("/thread/")) return "View conversation";
    if (path.includes("/project/") && path.includes("/settings"))
        return "View project";
    return "Open";
}

/** Presentational stack for Storybook and tests; {@link NotificationToast} wires Wails events. */
export const NotificationToastViewport: Component<{
    toasts: readonly NotificationToastItem[];
    onDismiss: (id: number) => void;
    onNavigate: (id: number, path: string) => void;
}> = (props) => {
    return (
        <div class="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col gap-2">
            <For each={[...props.toasts]}>
                {(toast) => (
                    <div class="pointer-events-auto flex w-80 flex-col gap-2 rounded-lg border border-emerald-800/30 bg-slate-900/95 px-4 py-3 shadow-lg shadow-black/30 backdrop-blur-sm animate-fade-in">
                        <div class="flex items-start gap-3">
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
                                onClick={() => props.onDismiss(toast.id)}
                                aria-label="Dismiss notification"
                            >
                                <X
                                    class="size-3.5"
                                    stroke-width={2}
                                    aria-hidden
                                />
                            </button>
                        </div>
                        {toast.deepLink && (
                            <button
                                type="button"
                                class="cursor-pointer self-start rounded-md bg-emerald-900/40 px-2.5 py-1 text-[11px] font-medium text-emerald-200/90 transition-colors hover:bg-emerald-800/50"
                                onClick={() =>
                                    props.onNavigate(toast.id, toast.deepLink)
                                }
                            >
                                {openActionLabel(toast.deepLink)}
                            </button>
                        )}
                    </div>
                )}
            </For>
        </div>
    );
};

export const NotificationToast: Component = () => {
    const navigate = useNavigate();
    const [toasts, setToasts] = createSignal<NotificationToastItem[]>([]);

    onMount(() => {
        const off = EventsOn("notification", (...args: unknown[]) => {
            const payload = args[0] as {
                title?: string;
                body?: string;
                deepLink?: string;
            };
            if (!payload?.title) return;
            const id = nextId++;
            setToasts((prev) => [
                ...prev,
                {
                    id,
                    title: payload.title!,
                    body: payload.body ?? "",
                    deepLink: payload.deepLink?.trim() ?? "",
                },
            ]);
            setTimeout(() => dismiss(id), 8000);
        });
        onCleanup(off);
    });

    function dismiss(id: number) {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }

    function go(id: number, path: string) {
        if (path.startsWith("/")) navigate(path);
        dismiss(id);
    }

    return (
        <NotificationToastViewport
            toasts={toasts()}
            onDismiss={dismiss}
            onNavigate={(toastId, path) => go(toastId, path)}
        />
    );
};
