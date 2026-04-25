import X from "lucide-solid/icons/x";
import type { Component } from "solid-js";
import { For } from "solid-js";

export interface NotificationToastItem {
    id: number;
    title: string;
    body: string;
    /** Optional deep link path; presence shows the action button. */
    deepLink?: string;
    /** Override label for the action button. Defaults are derived from `deepLink`. */
    actionLabel?: string;
}

export interface NotificationToastViewportProps {
    toasts: readonly NotificationToastItem[];
    onDismiss: (id: number) => void;
    onNavigate: (id: number, path: string) => void;
}

function defaultActionLabel(path: string): string {
    if (path.includes("/thread/")) return "View conversation";
    if (path.includes("/project/") && path.includes("/settings"))
        return "View project";
    return "Open";
}

/**
 * Stacked viewport for ephemeral notifications.
 *
 * Pure presentational: source of toasts and lifecycle (auto-dismiss timers,
 * deep-link navigation) are owned by the host application.
 */
export const NotificationToastViewport: Component<
    NotificationToastViewportProps
> = (props) => {
    return (
        <div class="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col gap-2">
            <For each={[...props.toasts]}>
                {(toast) => (
                    <div class="pointer-events-auto flex w-80 flex-col gap-2 rounded-lg border border-emerald-800/30 bg-slate-900/95 px-4 py-3 shadow-lg shadow-black/30 backdrop-blur-sm">
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
                                    props.onNavigate(toast.id, toast.deepLink!)
                                }
                            >
                                {toast.actionLabel ??
                                    defaultActionLabel(toast.deepLink)}
                            </button>
                        )}
                    </div>
                )}
            </For>
        </div>
    );
};
