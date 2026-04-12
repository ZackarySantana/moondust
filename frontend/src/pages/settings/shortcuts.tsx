import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import RotateCcw from "lucide-solid/icons/rotate-ccw";
import Search from "lucide-solid/icons/search";
import X from "lucide-solid/icons/x";
import type { Component } from "solid-js";
import {
    createEffect,
    createMemo,
    createSignal,
    For,
    on,
    Show,
} from "solid-js";
import { SaveButton } from "@/components/save-button";
import { Separator } from "@/components/ui/separator";
import { queryKeys } from "@/lib/query-client";
import {
    comboFromEvent,
    DEFAULT_SHORTCUTS,
    formatCombo,
    SHORTCUT_ACTIONS,
    type ShortcutContext,
} from "@/lib/shortcuts";
import { GetSettings, SaveSettings } from "@wails/go/app/App";
import { store } from "@wails/go/models";

const CONTEXT_ORDER: ShortcutContext[] = ["global", "thread", "diff"];
const CONTEXT_LABELS: Record<ShortcutContext, string> = {
    global: "Global",
    thread: "Thread",
    diff: "Diff View",
};

export const SettingsShortcutsPage: Component = () => {
    const queryClient = useQueryClient();

    const settingsQuery = useQuery(() => ({
        queryKey: queryKeys.settings,
        queryFn: GetSettings,
    }));

    const [overrides, setOverrides] = createSignal<Record<string, string>>({});
    const [dirty, setDirty] = createSignal(false);
    const [recording, setRecording] = createSignal<string | null>(null);
    const [filter, setFilter] = createSignal("");

    createEffect(
        on(
            () => settingsQuery.data,
            (data) => {
                if (!data) return;
                setOverrides({ ...(data.keyboard_shortcuts ?? {}) });
                setDirty(false);
            },
        ),
    );

    function resolved(actionId: string): string {
        return overrides()[actionId] ?? DEFAULT_SHORTCUTS[actionId] ?? "";
    }

    function setBinding(actionId: string, combo: string) {
        setOverrides((prev) => ({ ...prev, [actionId]: combo }));
        setDirty(true);
    }

    function resetOne(actionId: string) {
        setOverrides((prev) => {
            const next = { ...prev };
            delete next[actionId];
            return next;
        });
        setDirty(true);
    }

    function resetAll() {
        setOverrides({});
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
                    keyboard_shortcuts: overrides(),
                }),
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.settings });
            setDirty(false);
        },
    }));

    function handleRecordKey(e: KeyboardEvent) {
        e.preventDefault();
        e.stopPropagation();
        const combo = comboFromEvent(e);
        if (!combo) return;
        const actionId = recording();
        if (!actionId) return;
        setBinding(actionId, combo);
        setRecording(null);
    }

    const filteredByContext = createMemo(() => {
        const q = filter().toLowerCase().trim();
        const groups: {
            context: ShortcutContext;
            actions: (typeof SHORTCUT_ACTIONS)[number][];
        }[] = [];

        for (const ctx of CONTEXT_ORDER) {
            const actions = SHORTCUT_ACTIONS.filter((a) => {
                if (a.context !== ctx) return false;
                if (!q) return true;
                return (
                    a.label.toLowerCase().includes(q) ||
                    a.description.toLowerCase().includes(q) ||
                    formatCombo(resolved(a.id)).toLowerCase().includes(q)
                );
            });
            if (actions.length > 0) groups.push({ context: ctx, actions });
        }
        return groups;
    });

    return (
        <div class="space-y-8">
            <div class="flex items-center justify-between">
                <p class="text-base font-medium text-slate-200">
                    Keyboard Shortcuts
                </p>
                <div class="flex items-center gap-2">
                    <button
                        type="button"
                        class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-800/40 px-2.5 py-1.5 text-[11px] text-slate-400 transition-colors hover:border-slate-700/60 hover:text-slate-200"
                        onClick={resetAll}
                    >
                        <RotateCcw
                            class="size-3"
                            stroke-width={2}
                            aria-hidden
                        />
                        Reset all
                    </button>
                    <SaveButton
                        dirty={dirty()}
                        isPending={saveMutation.isPending}
                        onClick={() => saveMutation.mutate()}
                    />
                </div>
            </div>

            <div class="relative">
                <Search
                    class="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-600"
                    stroke-width={2}
                    aria-hidden
                />
                <input
                    type="text"
                    value={filter()}
                    onInput={(e) => setFilter(e.currentTarget.value)}
                    placeholder="Filter shortcuts…"
                    class="h-8 w-full rounded-lg border border-slate-800/40 bg-slate-950/40 pr-8 pl-8.5 text-xs text-slate-300 transition-colors placeholder:text-slate-600 focus-visible:border-emerald-700/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600/30"
                />
                <Show when={filter()}>
                    <button
                        type="button"
                        class="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-slate-600 transition-colors hover:text-slate-300"
                        aria-label="Clear filter"
                        onClick={() => setFilter("")}
                    >
                        <X
                            class="size-3.5"
                            stroke-width={2}
                            aria-hidden
                        />
                    </button>
                </Show>
            </div>

            <Separator />

            <Show
                when={filteredByContext().length > 0}
                fallback={
                    <p class="py-8 text-center text-sm text-slate-600">
                        No matching shortcuts.
                    </p>
                }
            >
                <For each={filteredByContext()}>
                    {(group, gi) => (
                        <>
                            <section class="space-y-3">
                                <h3 class="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                    {CONTEXT_LABELS[group.context]}
                                </h3>
                                <div class="divide-y divide-slate-800/30 rounded-lg border border-slate-800/40 bg-slate-950/20">
                                    <For each={group.actions}>
                                        {(action) => {
                                            const isRecording = () =>
                                                recording() === action.id;
                                            const isCustom = () =>
                                                action.id in overrides() &&
                                                overrides()[action.id] !==
                                                    DEFAULT_SHORTCUTS[
                                                        action.id
                                                    ];

                                            return (
                                                <div class="flex items-center gap-4 px-4 py-3">
                                                    <div class="min-w-0 flex-1">
                                                        <p class="text-[13px] font-medium text-slate-200">
                                                            {action.label}
                                                        </p>
                                                        <p class="mt-0.5 text-[11px] text-slate-500">
                                                            {action.description}
                                                        </p>
                                                    </div>
                                                    <div class="flex items-center gap-2">
                                                        <Show when={isCustom()}>
                                                            <button
                                                                type="button"
                                                                class="cursor-pointer rounded p-1 text-slate-600 transition-colors hover:text-slate-300"
                                                                onClick={() =>
                                                                    resetOne(
                                                                        action.id,
                                                                    )
                                                                }
                                                                title="Reset to default"
                                                            >
                                                                <RotateCcw
                                                                    class="size-3"
                                                                    stroke-width={
                                                                        2
                                                                    }
                                                                    aria-hidden
                                                                />
                                                            </button>
                                                        </Show>
                                                        <button
                                                            type="button"
                                                            class={`inline-flex min-w-20 cursor-pointer items-center justify-center rounded-md border px-3 py-1.5 font-mono text-[11px] transition-colors ${
                                                                isRecording()
                                                                    ? "border-emerald-600/60 bg-emerald-900/20 text-emerald-300 animate-pulse"
                                                                    : "border-slate-700/50 bg-slate-900/40 text-slate-300 hover:border-slate-600/60 hover:text-slate-100"
                                                            }`}
                                                            onClick={() => {
                                                                if (
                                                                    isRecording()
                                                                ) {
                                                                    setRecording(
                                                                        null,
                                                                    );
                                                                } else {
                                                                    setRecording(
                                                                        action.id,
                                                                    );
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (
                                                                    isRecording()
                                                                ) {
                                                                    handleRecordKey(
                                                                        e,
                                                                    );
                                                                }
                                                            }}
                                                            onBlur={() => {
                                                                if (
                                                                    isRecording()
                                                                ) {
                                                                    setRecording(
                                                                        null,
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            {isRecording()
                                                                ? "Press a key…"
                                                                : formatCombo(
                                                                      resolved(
                                                                          action.id,
                                                                      ),
                                                                  )}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    </For>
                                </div>
                            </section>
                            <Show when={gi() < filteredByContext().length - 1}>
                                <Separator />
                            </Show>
                        </>
                    )}
                </For>
            </Show>
        </div>
    );
};
