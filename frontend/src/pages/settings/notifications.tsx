import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import type { Component } from "solid-js";
import { createEffect, createSignal, on, Show } from "solid-js";
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
                    ssh_auth_sock: current?.ssh_auth_sock ?? "",
                    default_worktree: current?.default_worktree ?? "",
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

            <Separator />

            {EVENT_TYPES.map((evt, i) => (
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
                    {i < EVENT_TYPES.length - 1 && <Separator />}
                </>
            ))}
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
