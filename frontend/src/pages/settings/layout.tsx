import type { RouteSectionProps } from "@solidjs/router";
import { useLocation } from "@solidjs/router";
import type { Component } from "solid-js";
import { createMemo } from "solid-js";
import { Separator } from "@/components/ui/separator";
import { VerticalNav } from "@/components/vertical-nav";
import { SETTINGS_SECTIONS } from "./sections";

export const SettingsLayout: Component<RouteSectionProps> = (props) => {
    const location = useLocation();
    const activeSegment = createMemo(() => {
        const m = location.pathname.match(/^\/settings\/([^/]+)/);
        return m?.[1] ?? "";
    });

    return (
        <div class="h-full min-h-0 w-full overflow-y-auto p-8 pt-10 animate-fade-in">
            <div class="mx-auto w-full max-w-4xl">
                <header class="mb-8">
                    <h1 class="text-xl font-semibold tracking-tight text-slate-100">
                        Settings
                    </h1>
                    <p class="mt-1 max-w-md text-sm text-slate-600">
                        Workspace preferences, integrations, and app behavior.
                    </p>
                </header>

                <Separator class="mb-8 bg-slate-800/30" />

                <div class="flex flex-col gap-10 lg:flex-row lg:items-start">
                    <VerticalNav
                        items={SETTINGS_SECTIONS}
                        baseHref="/settings"
                        activeId={activeSegment()}
                        navLabel="Settings sections"
                    />
                    <div class="min-h-48 min-w-0 flex-1 animate-fade-in">
                        {props.children}
                    </div>
                </div>
            </div>
        </div>
    );
};
