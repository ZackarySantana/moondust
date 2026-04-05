import type { RouteSectionProps } from "@solidjs/router";
import { useLocation } from "@solidjs/router";
import type { Component } from "solid-js";
import { createMemo } from "solid-js";
import { VerticalNav } from "@/components/vertical-nav";
import { SETTINGS_SECTIONS } from "./sections";

export const SettingsLayout: Component<RouteSectionProps> = (props) => {
    const location = useLocation();
    const activeSegment = createMemo(() => {
        const m = location.pathname.match(/^\/settings\/([^/]+)/);
        return m?.[1] ?? "";
    });

    return (
        <div class="h-full min-h-0 w-full p-6 pt-8">
            <div class="mx-auto w-full max-w-5xl">
                <header class="mb-8 border-b border-slate-700/50 pb-6">
                    <h1 class="text-2xl font-semibold tracking-tight text-slate-50">
                        Settings
                    </h1>
                    <p class="mt-1.5 max-w-md text-sm leading-relaxed text-slate-500">
                        Workspace preferences, integrations, and app behavior.
                    </p>
                </header>

                <div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
                    <VerticalNav
                        items={SETTINGS_SECTIONS}
                        baseHref="/settings"
                        activeId={activeSegment()}
                        navLabel="Settings sections"
                    />
                    <div class="min-h-48 min-w-0 flex-1 text-left">
                        {props.children}
                    </div>
                </div>
            </div>
        </div>
    );
};
