import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import Check from "lucide-solid/icons/check";
import Loader2 from "lucide-solid/icons/loader-2";
import type { Component, JSX } from "solid-js";
import { createEffect, createSignal, on, Show } from "solid-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { queryKeys } from "@/lib/query-client";
import { GetSettings, SaveSettings } from "@wails/go/app/App";
import { store } from "@wails/go/models";

interface FieldRowProps {
    id: string;
    label: string;
    value: string;
    placeholder?: string;
    description?: string;
    onInput?: JSX.EventHandler<HTMLInputElement, InputEvent>;
}

const FieldRow: Component<FieldRowProps> = (props) => (
    <div class="grid grid-cols-[11rem_1fr] items-start gap-4">
        <Label
            for={props.id}
            class="mb-0 pt-2 text-right text-[13px] text-slate-400"
        >
            {props.label}
        </Label>
        <div class="space-y-1">
            <Input
                id={props.id}
                value={props.value}
                placeholder={props.placeholder}
                onInput={props.onInput}
                readOnly={!props.onInput}
            />
            {props.description && (
                <p class="text-xs text-slate-600">{props.description}</p>
            )}
        </div>
    </div>
);

export const SettingsGitPage: Component = () => {
    const queryClient = useQueryClient();

    const settingsQuery = useQuery(() => ({
        queryKey: queryKeys.settings,
        queryFn: GetSettings,
    }));

    const [sshAuthSock, setSSHAuthSock] = createSignal("");
    const [defaultWorktree, setDefaultWorktree] = createSignal("ask");
    const [dirty, setDirty] = createSignal(false);

    createEffect(
        on(
            () => settingsQuery.data,
            (data) => {
                if (data) {
                    setSSHAuthSock(data.ssh_auth_sock ?? "");
                    setDefaultWorktree(data.default_worktree || "ask");
                    setDirty(false);
                }
            },
        ),
    );

    function handleInput(setter: (v: string) => void) {
        return (e: InputEvent & { currentTarget: HTMLInputElement }) => {
            setter(e.currentTarget.value);
            setDirty(true);
        };
    }

    const saveMutation = useMutation(() => ({
        mutationFn: async () => {
            await SaveSettings(
                new store.Settings({
                    ssh_auth_sock: sshAuthSock() || "",
                    default_worktree: defaultWorktree(),
                }),
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.settings });
            setDirty(false);
        },
    }));

    return (
        <div class="space-y-8">
            <div class="flex items-center justify-between">
                <p class="text-base font-medium text-slate-200">Git</p>
                <Button
                    size="sm"
                    disabled={!dirty() || saveMutation.isPending}
                    onClick={() => saveMutation.mutate()}
                >
                    <Show
                        when={!saveMutation.isPending}
                        fallback={
                            <Loader2 class="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        }
                    >
                        <Check class="mr-1.5 h-3.5 w-3.5" />
                    </Show>
                    Save
                </Button>
            </div>

            <Separator />

            <section class="space-y-5">
                <div>
                    <h2 class="text-sm font-medium text-slate-200">
                        Worktrees
                    </h2>
                    <p class="mt-0.5 text-xs text-slate-600">
                        Control whether new threads create a Git worktree for
                        isolated changes.
                    </p>
                </div>
                <div class="space-y-4">
                    <div class="grid grid-cols-[11rem_1fr] items-start gap-4">
                        <Label
                            for="settings-default-worktree"
                            class="mb-0 pt-2 text-right text-[13px] text-slate-400"
                        >
                            New thread default
                        </Label>
                        <div class="space-y-1">
                            <select
                                id="settings-default-worktree"
                                class="flex h-9 w-full rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 text-sm text-slate-200 outline-none transition-colors focus:border-emerald-600/60"
                                value={defaultWorktree()}
                                onChange={(e) => {
                                    setDefaultWorktree(e.currentTarget.value);
                                    setDirty(true);
                                }}
                            >
                                <option value="ask">Ask every time</option>
                                <option value="on">Always use worktree</option>
                                <option value="off">Never use worktree</option>
                            </select>
                            <p class="text-xs text-slate-600">
                                "Ask every time" shows a prompt when creating
                                each new thread.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Separator />

            <section class="space-y-5">
                <div>
                    <h2 class="text-sm font-medium text-slate-200">
                        SSH Authentication
                    </h2>
                    <p class="mt-0.5 text-xs text-slate-600">
                        Configure how Moondust authenticates with Git remotes
                        over SSH.
                    </p>
                </div>
                <div class="space-y-4">
                    <FieldRow
                        id="settings-ssh-auth-sock"
                        label="SSH_AUTH_SOCK"
                        value={sshAuthSock()}
                        placeholder="Use shell default"
                        description="Path to SSH agent socket, e.g. ~/.1password/agent.sock for 1Password."
                        onInput={handleInput(setSSHAuthSock)}
                    />
                </div>
            </section>
        </div>
    );
};
