import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useNavigate } from "@solidjs/router";
import {
    ForkThreadAtMessage,
    SendThreadMessage,
    SetThreadChatModel,
    SetThreadChatProvider,
} from "@wails/go/app/App";
import type { ChatProviderId } from "@/lib/chat-provider";
import {
    invalidateThreadList,
    invalidateThreadScoped,
    queryKeys,
} from "@/lib/query-client";
import type { store } from "@wails/go/models";

export interface ThreadChatMutationsOptions {
    threadId: string;
    setSendError: (msg: string) => void;
    setDraft: (s: string) => void;
}

/**
 * Send message + provider/model updates + fork-thread-at-message for the thread route.
 */
export function useThreadChatMutations(opts: ThreadChatMutationsOptions) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const threadDetailKey = () => queryKeys.threads.detail(opts.threadId);

    const sendMutation = useMutation(() => ({
        mutationFn: (content: string) =>
            SendThreadMessage(opts.threadId, content),
        onMutate: () => {
            opts.setSendError("");
        },
        onSuccess: async () => {
            opts.setDraft("");
            opts.setSendError("");
            await invalidateThreadScoped(queryClient, opts.threadId);
            await invalidateThreadList(queryClient);
        },
        onError: (err: unknown) => {
            const msg =
                err instanceof Error
                    ? err.message
                    : typeof err === "string"
                      ? err
                      : "Failed to send message";
            opts.setSendError(msg);
        },
    }));

    const setChatProviderMutation = useMutation(() => ({
        mutationFn: async (provider: ChatProviderId) => {
            await SetThreadChatProvider(opts.threadId, provider);
            if (provider === "cursor") {
                await SetThreadChatModel(opts.threadId, "composer-2-fast");
            } else {
                await SetThreadChatModel(opts.threadId, "openai/gpt-4o-mini");
            }
        },
        onMutate: async (provider) => {
            await queryClient.cancelQueries({ queryKey: threadDetailKey() });
            const prev =
                queryClient.getQueryData<store.Thread>(threadDetailKey());
            if (prev) {
                const nextModel =
                    provider === "cursor"
                        ? "composer-2-fast"
                        : "openai/gpt-4o-mini";
                queryClient.setQueryData(threadDetailKey(), {
                    ...prev,
                    chat_provider: provider,
                    chat_model: nextModel,
                } as store.Thread);
            }
            return { prev } as { prev: store.Thread | undefined };
        },
        onError: (_err, _provider, ctx) => {
            if (ctx?.prev !== undefined) {
                queryClient.setQueryData(threadDetailKey(), ctx.prev);
            }
        },
        onSuccess: async () => {
            await invalidateThreadScoped(queryClient, opts.threadId);
        },
    }));

    const setChatModelMutation = useMutation(() => ({
        mutationFn: (model: string) => SetThreadChatModel(opts.threadId, model),
        onMutate: async (model) => {
            await queryClient.cancelQueries({ queryKey: threadDetailKey() });
            const prev =
                queryClient.getQueryData<store.Thread>(threadDetailKey());
            if (prev) {
                queryClient.setQueryData(threadDetailKey(), {
                    ...prev,
                    chat_model: model,
                } as store.Thread);
            }
            return { prev } as { prev: store.Thread | undefined };
        },
        onError: (_err, _model, ctx) => {
            if (ctx?.prev !== undefined) {
                queryClient.setQueryData(threadDetailKey(), ctx.prev);
            }
        },
        onSuccess: async () => {
            await invalidateThreadScoped(queryClient, opts.threadId);
        },
    }));

    const forkThreadMutation = useMutation(() => ({
        mutationFn: (messageId: string) =>
            ForkThreadAtMessage(opts.threadId, messageId),
        onSuccess: async (newThread) => {
            await invalidateThreadList(queryClient);
            navigate(`/project/${newThread.project_id}/thread/${newThread.id}`);
        },
    }));

    return {
        sendMutation,
        setChatProviderMutation,
        setChatModelMutation,
        forkThreadMutation,
    };
}
