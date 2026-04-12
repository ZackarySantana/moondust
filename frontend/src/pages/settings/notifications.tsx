import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import Search from "lucide-solid/icons/search";
import X from "lucide-solid/icons/x";
import type { Component } from "solid-js";
import { createEffect, createMemo, createSignal, on, Show } from "solid-js";
import { Section } from "@/components/settings-form";
import { SaveButton } from "@/components/save-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { queryKeys } from "@/lib/query-client";
import { GetSettings, IsPushAvailable, SaveSettings } from "@wails/go/app/App";
import { store } from "@wails/go/models";

const EVENT_TYPES = [
    {
        key: "project_created",
        title: "Project Created",
        description:
            "Fires when a new project is successfully created from a remote URL or local folder.",
    },
    {
        key: "chat_message_received",
        title: "Chat Message Received",
        description: "Fires when the agent responds to a message in a thread.",
    },
] as const;

type EventKey = (typeof EVENT_TYPES)[number]["key"];

function defaultConfig(): store.NotificationChannelConfig {
    return new store.NotificationChannelConfig({
        push: false,
        in_app: true,
        slack: false,
        email: false,
        slack_webhook_url: "",
    });
}

export const SettingsNotificationsPage: Component = () => {
    const queryClient = useQueryClient();

    const settingsQuery = useQuery(() => ({
        queryKey: queryKeys.settings,
        queryFn: GetSettings,
    }));

    const pushQuery = useQuery(() => ({
        queryKey: ["pushAvailable"] as const,
        queryFn: IsPushAvailable,
        staleTime: Infinity,
    }));

    const [configs, setConfigs] = createSignal<
        Record<EventKey, store.NotificationChannelConfig>
    >({
        project_created: defaultConfig(),
        chat_message_received: defaultConfig(),
    });
    const [dirty, setDirty] = createSignal(false);

    createEffect(
        on(
            () => settingsQuery.data,
            (data) => {
                if (!data) return;
                const notifs = data.notifications ?? {};
                setConfigs({
                    project_created: notifs["project_created"]
                        ? new store.NotificationChannelConfig(
                              notifs["project_created"],
                          )
                        : defaultConfig(),
                    chat_message_received: notifs["chat_message_received"]
                        ? new store.NotificationChannelConfig(
                              notifs["chat_message_received"],
                          )
                        : defaultConfig(),
                });
                setDirty(false);
            },
        ),
    );

    function updateConfig(
        key: EventKey,
        patch: Partial<store.NotificationChannelConfig>,
    ) {
        setConfigs((prev) => {
            const current = prev[key];
            return {
                ...prev,
                [key]: new store.NotificationChannelConfig({
                    ...current,
                    ...patch,
                }),
            };
        });
        setDirty(true);
    }

    const saveMutation = useMutation(() => ({
        mutationFn: async () => {
            const current = settingsQuery.data;
            const c = configs();
            await SaveSettings(
                new store.Settings({
                    ...current,
                    notifications: {
                        project_created: c.project_created,
                        chat_message_received: c.chat_message_received,
                    },
                }),
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.settings });
            setDirty(false);
        },
    }));

    const pushDisabled = () => pushQuery.data === false;
    const [filter, setFilter] = createSignal("");

    const CHANNEL_LABELS = [
        "push notification",
        "in-app notification",
        "slack",
        "email",
    ];

    const filteredEvents = createMemo(() => {
        const q = filter().toLowerCase().trim();
        if (!q) return [...EVENT_TYPES];
        return EVENT_TYPES.filter(
            (evt) =>
                evt.title.toLowerCase().includes(q) ||
                evt.description.toLowerCase().includes(q) ||
                CHANNEL_LABELS.some((l) => l.includes(q)),
        );
    });

    return (
        <div class="space-y-8">
            <div class="flex items-center justify-between">
                <p class="text-base font-medium text-slate-200">
                    Notifications
                </p>
                <SaveButton
                    dirty={dirty()}
                    isPending={saveMutation.isPending}
                    onClick={() => saveMutation.mutate()}
                />
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
                    placeholder="Filter notifications…"
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
                when={filteredEvents().length > 0}
                fallback={
                    <p class="py-8 text-center text-sm text-slate-600">
                        No matching notification events.
                    </p>
                }
            >
                {filteredEvents().map((evt, i) => (
                    <>
                        <Section
                            title={evt.title}
                            description={evt.description}
                        >
                            <div class="space-y-4">
                                <ChannelToggle
                                    label="Push Notification"
                                    checked={configs()[evt.key].push}
                                    disabled={pushDisabled()}
                                    hint={
                                        pushDisabled()
                                            ? "Not available on macOS"
                                            : undefined
                                    }
                                    onChange={(v) =>
                                        updateConfig(evt.key, { push: v })
                                    }
                                />
                                <ChannelToggle
                                    label="In-App Notification"
                                    checked={configs()[evt.key].in_app}
                                    onChange={(v) =>
                                        updateConfig(evt.key, { in_app: v })
                                    }
                                />
                                <ChannelToggle
                                    label="Slack"
                                    checked={configs()[evt.key].slack}
                                    onChange={(v) =>
                                        updateConfig(evt.key, { slack: v })
                                    }
                                />
                                <Show when={configs()[evt.key].slack}>
                                    <div class="ml-44 space-y-1 pl-4">
                                        <Label
                                            for={`slack-url-${evt.key}`}
                                            class="text-[13px] text-slate-400"
                                        >
                                            Webhook URL
                                        </Label>
                                        <Input
                                            id={`slack-url-${evt.key}`}
                                            value={
                                                configs()[evt.key]
                                                    .slack_webhook_url ?? ""
                                            }
                                            placeholder="https://hooks.slack.com/services/..."
                                            onInput={(e) =>
                                                updateConfig(evt.key, {
                                                    slack_webhook_url:
                                                        e.currentTarget.value,
                                                })
                                            }
                                        />
                                    </div>
                                </Show>
                                <ChannelToggle
                                    label="Email"
                                    checked={false}
                                    disabled
                                    hint="Coming soon"
                                    onChange={() => {}}
                                />
                            </div>
                        </Section>
                        {i < filteredEvents().length - 1 && <Separator />}
                    </>
                ))}
            </Show>
        </div>
    );
};

const ChannelToggle: Component<{
    label: string;
    checked: boolean;
    disabled?: boolean;
    hint?: string;
    onChange: (checked: boolean) => void;
}> = (props) => (
    <div class="grid grid-cols-[11rem_1fr] items-center gap-4">
        <Label class="mb-0 text-right text-[13px] text-slate-400">
            {props.label}
        </Label>
        <div class="flex items-center gap-3">
            <button
                type="button"
                role="switch"
                aria-checked={props.checked}
                disabled={props.disabled}
                onClick={() =>
                    !props.disabled && props.onChange(!props.checked)
                }
                class={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                    props.disabled ? "cursor-not-allowed opacity-40" : ""
                } ${props.checked ? "bg-emerald-600" : "bg-slate-700"}`}
            >
                <span
                    class={`pointer-events-none inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        props.checked
                            ? "translate-x-[18px]"
                            : "translate-x-[3px]"
                    }`}
                />
            </button>
            <Show when={props.hint}>
                <span class="text-[11px] text-slate-600">{props.hint}</span>
            </Show>
        </div>
    </div>
);
