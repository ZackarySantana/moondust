import type { RouteSectionProps } from "@solidjs/router";
import MessageSquare from "lucide-solid/icons/message-square";
import type { Component } from "solid-js";

export const HomePage: Component<RouteSectionProps> = () => {
    return (
        <div class="flex h-full items-center justify-center animate-fade-in">
            <div class="flex flex-col items-center gap-4 text-center">
                <div class="rounded-2xl bg-slate-900/30 p-4">
                    <MessageSquare
                        class="size-7 text-slate-700"
                        stroke-width={1.5}
                    />
                </div>
                <div class="space-y-1.5">
                    <h2 class="text-sm font-medium text-slate-400">
                        Start a new thread
                    </h2>
                    <p class="max-w-xs text-xs leading-relaxed text-slate-600">
                        Select a project from the sidebar or create a new one to
                        begin.
                    </p>
                </div>
            </div>
        </div>
    );
};
