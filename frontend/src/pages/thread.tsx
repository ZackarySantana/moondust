import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { useParams } from "@solidjs/router";
import type { Component } from "solid-js";
import { createMemo, createSignal, For, Show } from "solid-js";
import {
    GetProject,
    GetThread,
    GetThreadGitStatus,
    ListThreadMessages,
    SendThreadMessage,
} from "@wails/go/app/App";
import { TerminalPane } from "@/components/terminal-pane";
import { queryKeys } from "@/lib/query-client";

export const ThreadPage: Component = () => {
    const params = useParams<{ projectId: string; threadId: string }>();
    const queryClient = useQueryClient();
    const [draft, setDraft] = createSignal("");

    const projectQuery = useQuery(() => ({
        queryKey: queryKeys.projects.detail(params.projectId),
        queryFn: () => GetProject(params.projectId),
        enabled: !!params.projectId,
    }));

    const threadQuery = useQuery(() => ({
        queryKey: queryKeys.threads.detail(params.threadId),
        queryFn: () => GetThread(params.threadId),
        enabled: !!params.threadId,
    }));

    const messagesQuery = useQuery(() => ({
        queryKey: queryKeys.threads.messages(params.threadId),
        queryFn: () => ListThreadMessages(params.threadId),
        enabled: !!params.threadId,
    }));

    const gitStatusQuery = useQuery(() => ({
        queryKey: queryKeys.threads.gitStatus(params.threadId),
        queryFn: () => GetThreadGitStatus(params.threadId),
        enabled: !!params.threadId,
        refetchInterval: 5_000,
    }));

    const sendMutation = useMutation(() => ({
        mutationFn: (content: string) =>
            SendThreadMessage(params.threadId, content),
        onSuccess: async () => {
            setDraft("");
            await queryClient.invalidateQueries({
                queryKey: queryKeys.threads.messages(params.threadId),
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.threads.all,
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.threads.detail(params.threadId),
            });
        },
    }));

    const messages = createMemo(() => messagesQuery.data ?? []);
    const canSend = createMemo(
        () => !sendMutation.isPending && draft().trim().length > 0,
    );

    function submitMessage() {
        const text = draft().trim();
        if (!text) return;
        void sendMutation.mutateAsync(text);
    }

    return (
        <div class="flex h-full min-h-0 w-full overflow-hidden">
            <section class="flex min-h-0 flex-1 flex-col overflow-hidden border-r border-slate-800/40">
                <header class="border-b border-slate-800/40 px-5 py-3">
                    <p class="text-[11px] uppercase tracking-wider text-slate-600">
                        {projectQuery.data?.name ?? "Project"}
                    </p>
                    <h1 class="text-sm font-medium text-slate-200">
                        {threadQuery.data?.title ?? "Thread"}
                    </h1>
                </header>

                <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    <div class="mx-auto flex w-full max-w-3xl flex-col gap-3">
                        <For each={messages()}>
                            {(msg) => (
                                <div
                                    class={
                                        msg.role === "user"
                                            ? "ml-auto max-w-[85%] rounded-lg border border-emerald-700/40 bg-emerald-950/20 px-3 py-2 text-sm text-slate-100"
                                            : "mr-auto max-w-[85%] rounded-lg border border-slate-800/50 bg-slate-900/40 px-3 py-2 text-sm text-slate-200"
                                    }
                                >
                                    <p class="mb-1 text-[10px] uppercase tracking-wider text-slate-500">
                                        {msg.role}
                                    </p>
                                    <p class="whitespace-pre-wrap wrap-break-word">
                                        {msg.content}
                                    </p>
                                </div>
                            )}
                        </For>
                    </div>
                </div>

                <div class="shrink-0 border-t border-slate-800/40 p-4">
                    <div class="mx-auto flex w-full max-w-3xl flex-col gap-2">
                        <textarea
                            class="h-20 w-full resize-none rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 outline-none transition-colors focus:border-emerald-600/60"
                            placeholder="Message thread..."
                            value={draft()}
                            onInput={(e) => setDraft(e.currentTarget.value)}
                        />
                        <div class="flex justify-end">
                            <button
                                type="button"
                                class="cursor-pointer rounded-md border border-emerald-700/60 bg-emerald-800/50 px-3 py-1.5 text-xs font-medium text-emerald-100 transition-colors hover:bg-emerald-700/60 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={!canSend()}
                                onClick={submitMessage}
                            >
                                {sendMutation.isPending ? "Sending..." : "Send"}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex h-52 min-h-0 shrink-0 border-t border-slate-800/40 p-3">
                    <Show
                        when={
                            params.threadId && projectQuery.data?.directory
                                ? `${params.threadId}|${projectQuery.data.directory}`
                                : ""
                        }
                        keyed
                        fallback={
                            <div class="flex h-full w-full items-center justify-center rounded-md border border-slate-800/60 bg-app-panel text-xs text-slate-500">
                                Loading terminal...
                            </div>
                        }
                    >
                        {(ready) => {
                            const [threadID, cwd] = ready.split("|", 2);
                            return (
                                <TerminalPane
                                    sessionKey={`thread:${threadID}`}
                                    workingDirectory={cwd}
                                />
                            );
                        }}
                    </Show>
                </div>
            </section>

            <aside class="flex min-h-0 w-72 shrink-0 flex-col bg-app-panel">
                <header class="border-b border-slate-800/40 px-4 py-3">
                    <h2 class="text-xs font-medium text-slate-300">
                        Git Status
                    </h2>
                </header>
                <div class="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 text-xs">
                    <div>
                        <p class="text-slate-500">Branch</p>
                        <p class="mt-0.5 text-slate-300">
                            {gitStatusQuery.data?.branch || "Unknown"}
                        </p>
                    </div>
                    <div>
                        <p class="mb-1 text-slate-500">Changes</p>
                        <For each={gitStatusQuery.data?.entries ?? []}>
                            {(line) => (
                                <p class="font-mono text-[11px] text-slate-400">
                                    {line}
                                </p>
                            )}
                        </For>
                        {(gitStatusQuery.data?.entries?.length ?? 0) === 0 ? (
                            <p class="text-slate-500">Working tree clean.</p>
                        ) : null}
                    </div>
                </div>
            </aside>
        </div>
    );
};
