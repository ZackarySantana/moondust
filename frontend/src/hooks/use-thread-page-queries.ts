import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import { createMemo } from "solid-js";
import {
    GetProject,
    GetSettings,
    GetThread,
    GetThreadGitReview,
    ListCursorChatModels,
    ListOpenRouterChatModels,
    ListThreadMessages,
} from "@wails/go/app/App";
import {
    assistantAttributionLabel,
    chatModelFromThread,
    parseChatProviderId,
    CURSOR_CHAT_MODELS_FALLBACK,
    OPENROUTER_CHAT_MODELS_FALLBACK,
    type ChatProviderId,
    type ModelChoice,
} from "@/lib/chat-provider";
import { queryKeys } from "@/lib/query-client";

export interface UseThreadPageQueriesOptions {
    /** When false, git status polling pauses (e.g. review sidebar closed). */
    gitReviewOpen?: () => boolean;
}

/**
 * Thread route: project/thread/settings queries, messages, git status, and model list
 * for the active chat provider.
 */
export function useThreadPageQueries(
    projectId: string,
    threadId: string,
    options?: UseThreadPageQueriesOptions,
) {
    const projectQuery = useQuery(() => ({
        queryKey: queryKeys.projects.detail(projectId),
        queryFn: () => GetProject(projectId),
        enabled: !!projectId,
    }));

    const settingsQuery = useQuery(() => ({
        queryKey: queryKeys.settings,
        queryFn: GetSettings,
    }));

    const threadQuery = useQuery(() => ({
        queryKey: queryKeys.threads.detail(threadId),
        queryFn: () => GetThread(threadId),
        enabled: !!threadId,
    }));

    const thread = createMemo(() => threadQuery.data);

    const messagesQuery = useQuery(() => ({
        queryKey: queryKeys.threads.messages(threadId),
        queryFn: () => ListThreadMessages(threadId),
        enabled: !!threadId,
        staleTime: 0,
        placeholderData: keepPreviousData,
    }));

    const gitStatusQuery = useQuery(() => ({
        queryKey: queryKeys.threads.gitStatus(threadId),
        queryFn: () => GetThreadGitReview(threadId),
        enabled: !!threadId,
        refetchInterval: () =>
            options?.gitReviewOpen?.() !== false ? 5_000 : false,
    }));

    const chatProvider = createMemo((): ChatProviderId | undefined => {
        const t = thread();
        if (!t) return undefined;
        return parseChatProviderId(t.chat_provider);
    });

    const openRouterModelsQuery = useQuery(() => ({
        queryKey: queryKeys.openRouterModels,
        queryFn: ListOpenRouterChatModels,
        staleTime: 60 * 60 * 1000,
        enabled: chatProvider() === "openrouter",
    }));

    const cursorModelsQuery = useQuery(() => ({
        queryKey: queryKeys.cursorChatModels,
        queryFn: ListCursorChatModels,
        staleTime: 60 * 60 * 1000,
        enabled: chatProvider() === "cursor",
    }));

    const modelChoices = createMemo(() => {
        const cp = chatProvider();
        if (cp === undefined) return [] as ModelChoice[];
        if (cp === "cursor") {
            const rows = cursorModelsQuery.data;
            if (rows && rows.length > 0) {
                return rows.map((m) => ({
                    id: m.id,
                    label: (m.name && m.name.trim()) || m.id,
                    provider: m.provider ?? "cursor",
                    description: m.description,
                    description_full: m.description_full,
                    pricing_tier: m.pricing_tier,
                    pricing_summary: m.pricing_summary,
                    pricing_prompt: m.pricing_prompt,
                    pricing_completion: m.pricing_completion,
                    vision: m.vision,
                    reasoning: m.reasoning,
                    long_context: m.long_context,
                    context_length: m.context_length,
                }));
            }
            return [...CURSOR_CHAT_MODELS_FALLBACK];
        }
        const rows = openRouterModelsQuery.data;
        if (rows && rows.length > 0) {
            return rows.map((m) => ({
                id: m.id,
                label: (m.name && m.name.trim()) || m.id,
                provider: m.provider,
                description: m.description,
                description_full: m.description_full,
                pricing_tier: m.pricing_tier,
                pricing_summary: m.pricing_summary,
                pricing_prompt: m.pricing_prompt,
                pricing_completion: m.pricing_completion,
                vision: m.vision,
                reasoning: m.reasoning,
                long_context: m.long_context,
                context_length: m.context_length,
            }));
        }
        return [...OPENROUTER_CHAT_MODELS_FALLBACK];
    });

    const messages = createMemo(() => messagesQuery.data ?? []);

    const chatModel = createMemo(() =>
        chatModelFromThread(thread()?.chat_model),
    );

    const streamingAttribution = createMemo(() =>
        assistantAttributionLabel(
            thread()?.chat_provider,
            thread()?.chat_model,
            modelChoices(),
        ),
    );

    const workingDir = createMemo(
        () => thread()?.worktree_dir || projectQuery.data?.directory || "",
    );

    return {
        projectQuery,
        settingsQuery,
        threadQuery,
        thread,
        messagesQuery,
        gitStatusQuery,
        messages,
        chatProvider,
        modelChoices,
        chatModel,
        streamingAttribution,
        workingDir,
    };
}
