import type { RouteSectionProps } from "@solidjs/router";
import { A, useLocation } from "@solidjs/router";
import ArrowLeft from "lucide-solid/icons/arrow-left";
import type { Component, JSX } from "solid-js";
import { createMemo, Show } from "solid-js";
import { Separator } from "@/components/ui/separator";
import { VerticalNav, type VerticalNavItem } from "@/components/vertical-nav";
import { SETTINGS_SECTIONS } from "./sections";

interface SettingsShellProps {
    title: string;
    subtitle: string;
    backHref?: string;
    backLabel?: string;
    items: readonly VerticalNavItem[];
    baseHref: string;
    navLabel: string;
    trailing?: JSX.Element;
    children: JSX.Element;
}

export const SettingsShell: Component<SettingsShellProps> = (props) => {
    const location = useLocation();
    const activeSegment = createMemo(() => {
        const base = props.baseHref.replace(/\/$/, "");
        const re = new RegExp(
            `^${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/([^/]+)`,
        );
        const m = location.pathname.match(re);
        return m?.[1] ?? "";
    });

    return (
        <div class="h-full min-h-0 w-full overflow-y-auto p-8 pt-10 animate-fade-in">
            <div class="mx-auto w-full max-w-4xl">
                <header class="mb-8">
                    <Show when={props.backHref}>
                        {(href) => (
                            <A
                                href={href()}
                                class="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors duration-100 hover:text-slate-300"
                            >
                                <ArrowLeft
                                    class="size-3.5"
                                    stroke-width={2}
                                    aria-hidden
                                />
                                {props.backLabel ?? "Back"}
                            </A>
                        )}
                    </Show>
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-xl font-semibold tracking-tight text-slate-100">
                                {props.title}
                            </h1>
                            <p class="mt-1 max-w-md text-sm text-slate-600">
                                {props.subtitle}
                            </p>
                        </div>
                        {props.trailing}
                    </div>
                </header>

                <Separator class="mb-8 bg-slate-800/30" />

                <div class="flex flex-col gap-10 lg:flex-row lg:items-start">
                    <VerticalNav
                        items={props.items}
                        baseHref={props.baseHref}
                        activeId={activeSegment()}
                        navLabel={props.navLabel}
                    />
                    <div class="min-h-48 min-w-0 flex-1 animate-fade-in">
                        {props.children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const SettingsLayout: Component<RouteSectionProps> = (props) => {
    return (
        <SettingsShell
            title="Settings"
            subtitle="Workspace preferences, integrations, and app behavior."
            items={SETTINGS_SECTIONS}
            baseHref="/settings"
            navLabel="Settings sections"
        >
            {props.children}
        </SettingsShell>
    );
};
