import { useQuery } from "@tanstack/solid-query";
import { useParams } from "@solidjs/router";
import type { RouteSectionProps } from "@solidjs/router";
import type { Component } from "solid-js";
import { createContext, createMemo, Show, useContext } from "solid-js";
import { GetProject, GetThread, ListThreadMessages } from "@wails/go/app/App";
import { queryKeys } from "@/lib/query-client";
import { SettingsShell } from "@/pages/settings/layout";
import type { store } from "@wails/go/models";
import { THREAD_SETTINGS_SECTIONS } from "./sections";

interface ThreadSettingsContextValue {
    thread: () => store.Thread | undefined;
    project: () => store.Project | undefined;
    messages: () => store.ChatMessage[];
    isLoading: () => boolean;
}

const ThreadSettingsContext = createContext<ThreadSettingsContextValue>();

export function useThreadSettings() {
    const ctx = useContext(ThreadSettingsContext);
    if (!ctx) {
        throw new Error(
            "useThreadSettings must be used within ThreadSettingsLayout",
        );
    }
    return ctx;
}

export const ThreadSettingsLayout: Component<RouteSectionProps> = (props) => {
    const params = useParams<{ projectId: string; threadId: string }>();

    const threadQuery = useQuery(() => ({
        queryKey: queryKeys.threads.detail(params.threadId),
        queryFn: () => GetThread(params.threadId),
        enabled: !!params.threadId,
    }));

    const projectQuery = useQuery(() => ({
        queryKey: queryKeys.projects.detail(params.projectId),
        queryFn: () => GetProject(params.projectId),
        enabled: !!params.projectId,
    }));

    const messagesQuery = useQuery(() => ({
        queryKey: queryKeys.threads.messages(params.threadId),
        queryFn: () => ListThreadMessages(params.threadId),
        enabled: !!params.threadId,
        staleTime: 0,
    }));

    const messages = createMemo(() => messagesQuery.data ?? []);

    const baseHref = () =>
        `/project/${params.projectId}/thread/${params.threadId}/settings`;

    const contextValue: ThreadSettingsContextValue = {
        thread: () => threadQuery.data,
        project: () => projectQuery.data,
        messages,
        isLoading: () =>
            threadQuery.isLoading ||
            projectQuery.isLoading ||
            messagesQuery.isLoading,
    };

    return (
        <ThreadSettingsContext.Provider value={contextValue}>
            <SettingsShell
                title={threadQuery.data?.title?.trim() || "Thread"}
                subtitle="Immutable details and usage for this conversation."
                backHref={`/project/${params.projectId}/thread/${params.threadId}`}
                backLabel="Back to thread"
                items={THREAD_SETTINGS_SECTIONS}
                baseHref={baseHref()}
                navLabel="Thread settings sections"
            >
                <Show when={threadQuery.isError}>
                    <p class="mb-4 rounded-lg border border-red-900/30 bg-red-950/15 px-3 py-2 text-xs text-red-400">
                        Failed to load thread.
                    </p>
                </Show>
                <Show when={projectQuery.isError}>
                    <p class="mb-4 rounded-lg border border-red-900/30 bg-red-950/15 px-3 py-2 text-xs text-red-400">
                        Failed to load project.
                    </p>
                </Show>
                {props.children}
            </SettingsShell>
        </ThreadSettingsContext.Provider>
    );
};
