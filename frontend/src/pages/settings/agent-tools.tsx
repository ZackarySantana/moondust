import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import type { Component } from "solid-js";
import {
    createEffect,
    createSignal,
    For,
    on,
    Show,
} from "solid-js";
import { SaveButton } from "@/components/save-button";
import { Separator } from "@/components/ui/separator";
import { Section } from "@/components/settings-form";
import {
    AGENT_TOOL_DEFINITIONS,
    type AgentToolId,
    agentToolStateFromSettings,
    agentToolStateToSettingsMap,
    defaultAgentToolState,
} from "@/lib/agent-tools";
import { queryKeys } from "@/lib/query-client";
import { GetSettings, SaveSettings } from "@wails/go/app/App";
import { store } from "@wails/go/models";

export const SettingsAgentToolsPage: Component = () => {
    const queryClient = useQueryClient();

    const settingsQuery = useQuery(() => ({
        queryKey: queryKeys.settings,
        queryFn: GetSettings,
    }));

    const [toolOn, setToolOn] = createSignal(defaultAgentToolState());
    const [dirty, setDirty] = createSignal(false);

    createEffect(
        on(
            () => settingsQuery.data,
            (data) => {
                if (!data) return;
                setToolOn(agentToolStateFromSettings(data));
                setDirty(false);
            },
        ),
    );

    function toggle(id: AgentToolId) {
        setToolOn((s) => ({ ...s, [id]: !s[id] }));
        setDirty(true);
    }

    const saveMutation = useMutation(() => ({
        mutationFn: async () => {
            const current = settingsQuery.data;
            await SaveSettings(
                new store.Settings({
                    ssh_auth_sock: current?.ssh_auth_sock ?? "",
                    default_worktree: current?.default_worktree ?? "",
                    notifications: current?.notifications ?? {},
                    keyboard_shortcuts: current?.keyboard_shortcuts ?? {},
                    agent_tools_enabled: agentToolStateToSettingsMap(
                        toolOn(),
                    ),
                }),
            );
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.settings,
            });
            setDirty(false);
        },
    }));

    return (
        <div class="space-y-8">
            <div class="flex items-center justify-between gap-4">
                <p class="text-base font-medium text-slate-200">Agent tools</p>
                <SaveButton
                    dirty={dirty()}
                    isPending={saveMutation.isPending}
                    onClick={() => saveMutation.mutate()}
                />
            </div>

            <Separator />

            <Section
                title="Tool availability"
                description="Controls which tools the chat agent can call for threads. Changes apply to new completions after saving."
            >
                <ul class="divide-y divide-slate-800/50 rounded-lg border border-slate-800/40 bg-slate-950/20">
                    <For each={AGENT_TOOL_DEFINITIONS}>
                        {(tool) => {
                            const on = () => toolOn()[tool.id];
                            return (
                                <li class="flex items-start justify-between gap-4 px-4 py-3.5 first:rounded-t-lg last:rounded-b-lg">
                                    <div class="min-w-0 flex-1">
                                        <p class="font-mono text-[11px] text-slate-500">
                                            {tool.id}
                                        </p>
                                        <p class="mt-0.5 text-[13px] font-medium text-slate-200">
                                            {tool.title}
                                        </p>
                                        <p class="mt-1 text-xs leading-snug text-slate-600">
                                            {tool.description}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={on()}
                                        aria-label={`Toggle ${tool.title}`}
                                        class="relative mt-0.5 h-7 w-12 shrink-0 cursor-pointer rounded-full border border-slate-700/60 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:outline-none"
                                        classList={{
                                            "bg-emerald-600/90": on(),
                                            "bg-slate-800": !on(),
                                        }}
                                        onClick={() => toggle(tool.id)}
                                    >
                                        <span
                                            class="absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform duration-150"
                                            classList={{
                                                "translate-x-5": on(),
                                                "translate-x-0": !on(),
                                            }}
                                        />
                                    </button>
                                </li>
                            );
                        }}
                    </For>
                </ul>
            </Section>

            <Show when={settingsQuery.isLoading}>
                <p class="text-xs text-slate-600">Loading settings…</p>
            </Show>
            <Show when={settingsQuery.isError}>
                <p class="text-xs text-amber-500/90">
                    Could not load settings. Toggles may not match the server.
                </p>
            </Show>
        </div>
    );
};
