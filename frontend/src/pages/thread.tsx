import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { useNavigate, useParams } from "@solidjs/router";
import type { Component } from "solid-js";
import { createMemo, createSignal, onCleanup, Show } from "solid-js";
import {
    DeleteThread,
    GetFileDiff,
    GetProject,
    GetSettings,
    GetThread,
    GetThreadGitReview,
    ListOpenRouterChatModels,
    ListThreadMessages,
    RenameThread,
    SendThreadMessage,
    SetThreadChatModel,
    SetThreadChatProvider,
} from "@wails/go/app/App";
import { ReviewSidebar } from "@/components/thread/review-sidebar";
import { ThreadChatPane } from "@/components/thread/thread-chat-pane";
import { ThreadDiffPane } from "@/components/thread/thread-diff-pane";
import { ThreadHeader } from "@/components/thread/thread-header";
import { ThreadTerminalDock } from "@/components/thread/thread-terminal-dock";
import type { DiffTarget } from "@/components/thread/types";
import { ResizeHandle } from "@/components/resize-handle";
import {
    assistantAttributionLabel,
    chatModelFromThread,
    chatProviderFromThread,
    OPENROUTER_CHAT_MODELS_FALLBACK,
    type ChatProviderId,
} from "@/lib/chat-provider";
import { queryKeys } from "@/lib/query-client";
import { useShortcuts } from "@/lib/shortcut-context";
import {
    setSidebarOpen,
    setSidebarWidth,
    setTerminalHeight,
    setTerminalOpen,
    sidebarOpen,
    sidebarWidth,
    terminalHeight,
    terminalOpen,
} from "@/lib/thread-workspace-layout";
import { useThreadChatStream } from "@/lib/thread/use-thread-chat-stream";
import type { store } from "@wails/go/models";
import type { DiffNav } from "@/components/diff-viewer";

export const ThreadPage: Component = () => {
    const params = useParams<{ projectId: string; threadId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { onAction, formatKey } = useShortcuts();
    const [draft, setDraft] = createSignal("");
    const [sendError, setSendError] = createSignal("");
    let chatTextareaRef!: HTMLTextAreaElement;

    const {
        streaming,
        streamingText,
        streamingReasoningText,
        streamingThinkingDurationSec,
    } = useThreadChatStream(
        () => params.threadId,
        queryClient,
        (msg) => setSendError(msg),
    );

    const projectQuery = useQuery(() => ({
        queryKey: queryKeys.projects.detail(params.projectId),
        queryFn: () => GetProject(params.projectId),
        enabled: !!params.projectId,
    }));

    const settingsQuery = useQuery(() => ({
        queryKey: queryKeys.settings,
        queryFn: GetSettings,
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
        // Chat changes often; default staleTime (30s) could hide new assistant rows after navigation.
        staleTime: 0,
    }));

    const gitStatusQuery = useQuery(() => ({
        queryKey: queryKeys.threads.gitStatus(params.threadId),
        queryFn: () => GetThreadGitReview(params.threadId),
        enabled: !!params.threadId,
        refetchInterval: 5_000,
    }));

    const openRouterModelsQuery = useQuery(() => ({
        queryKey: queryKeys.openRouterModels,
        queryFn: ListOpenRouterChatModels,
        staleTime: 60 * 60 * 1000,
    }));

    const modelChoices = createMemo(() => {
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

    const sendMutation = useMutation(() => ({
        mutationFn: (content: string) =>
            SendThreadMessage(params.threadId, content),
        onMutate: () => {
            setSendError("");
        },
        onSuccess: async () => {
            setDraft("");
            setSendError("");
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
        onError: (err: unknown) => {
            const msg =
                err instanceof Error
                    ? err.message
                    : typeof err === "string"
                      ? err
                      : "Failed to send message";
            setSendError(msg);
        },
    }));

    const threadDetailKey = () => queryKeys.threads.detail(params.threadId);

    const setChatProviderMutation = useMutation(() => ({
        mutationFn: (provider: ChatProviderId) =>
            SetThreadChatProvider(params.threadId, provider),
        onMutate: async (provider) => {
            await queryClient.cancelQueries({ queryKey: threadDetailKey() });
            const prev =
                queryClient.getQueryData<store.Thread>(threadDetailKey());
            if (prev) {
                queryClient.setQueryData(threadDetailKey(), {
                    ...prev,
                    chat_provider: provider,
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
            await queryClient.invalidateQueries({
                queryKey: queryKeys.threads.all,
            });
        },
    }));

    const setChatModelMutation = useMutation(() => ({
        mutationFn: (model: string) =>
            SetThreadChatModel(params.threadId, model),
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
            await queryClient.invalidateQueries({
                queryKey: queryKeys.threads.all,
            });
        },
    }));

    const messages = createMemo(() => messagesQuery.data ?? []);
    const chatProvider = createMemo(() =>
        chatProviderFromThread(threadQuery.data?.chat_provider),
    );
    const chatModel = createMemo(() =>
        chatModelFromThread(threadQuery.data?.chat_model),
    );
    const streamingAttribution = createMemo(() =>
        assistantAttributionLabel(
            threadQuery.data?.chat_provider,
            threadQuery.data?.chat_model,
            modelChoices(),
        ),
    );
    const canSend = createMemo(
        () =>
            !sendMutation.isPending &&
            !streaming() &&
            draft().trim().length > 0,
    );
    const workingDir = createMemo(
        () =>
            threadQuery.data?.worktree_dir ||
            projectQuery.data?.directory ||
            "",
    );

    const [diffTargetByThread, setDiffTargetByThread] = createSignal<
        Record<string, DiffTarget>
    >({});
    const diffTarget = createMemo(
        () => diffTargetByThread()[params.threadId] ?? null,
    );
    const setDiffTarget = (target: DiffTarget | null) => {
        setDiffTargetByThread((prev) => {
            const next = { ...prev };
            if (target) {
                next[params.threadId] = target;
            } else {
                delete next[params.threadId];
            }
            return next;
        });
    };
    const [sideBySide, setSideBySide] = createSignal(true);
    const [diffNav, setDiffNav] = createSignal<DiffNav | null>(null);

    const [editingTitle, setEditingTitle] = createSignal(false);
    const [titleDraft, setTitleDraft] = createSignal("");
    let titleInputRef!: HTMLInputElement;

    function startEditingTitle() {
        setTitleDraft(threadQuery.data?.title ?? "");
        setEditingTitle(true);
        requestAnimationFrame(() => {
            titleInputRef?.focus();
            titleInputRef?.select();
        });
    }

    async function commitTitle() {
        const trimmed = titleDraft().trim();
        setEditingTitle(false);
        if (trimmed && trimmed !== (threadQuery.data?.title ?? "")) {
            await RenameThread(params.threadId, trimmed);
            await queryClient.invalidateQueries({
                queryKey: queryKeys.threads.all,
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.threads.detail(params.threadId),
            });
        }
    }

    const diffQuery = useQuery(() => ({
        queryKey: [
            "fileDiff",
            params.threadId,
            diffTarget()?.path ?? "",
            diffTarget()?.status ?? "",
        ] as const,
        queryFn: () =>
            GetFileDiff(
                params.threadId,
                diffTarget()!.path,
                diffTarget()!.status,
            ),
        enabled: !!diffTarget() && !!params.threadId,
    }));

    function submitMessage() {
        const text = draft().trim();
        if (!text) return;
        void sendMutation.mutateAsync(text);
    }

    function setProvider(id: ChatProviderId) {
        void setChatProviderMutation.mutateAsync(id);
    }

    function setModel(modelId: string) {
        void setChatModelMutation.mutateAsync(modelId);
    }

    const showOpenRouterKeyHint = () =>
        chatProvider() === "openrouter" &&
        !settingsQuery.data?.has_openrouter_api_key;

    async function refreshGitSidebar() {
        await queryClient.invalidateQueries({
            queryKey: queryKeys.threads.gitStatus(params.threadId),
        });
    }

    async function copyPatchPreview() {
        const text = gitStatusQuery.data?.patch_preview?.trim();
        if (!text) return;
        await navigator.clipboard.writeText(text);
    }

    async function copyReviewSummary() {
        const git = gitStatusQuery.data;
        if (!git) return;
        const lines = [
            `Branch: ${git.branch || "unknown"}`,
            `Ahead: ${git.ahead} Behind: ${git.behind}`,
            `Staged: ${git.staged?.length ?? 0}`,
            `Unstaged: ${git.unstaged?.length ?? 0}`,
            `Untracked: ${git.untracked?.length ?? 0}`,
        ];
        await navigator.clipboard.writeText(lines.join("\n"));
    }

    const shortcutCleanups: (() => void)[] = [];
    shortcutCleanups.push(
        onAction("focus_chat", () => chatTextareaRef?.focus()),
        onAction("toggle_terminal", () => setTerminalOpen((v) => !v)),
        onAction("toggle_sidebar", () => setSidebarOpen((v) => !v)),
        onAction("close_diff", () => {
            if (diffTarget()) setDiffTarget(null);
        }),
        onAction("next_diff", () => diffNav()?.goNext()),
        onAction("prev_diff", () => diffNav()?.goPrev()),
        onAction("toggle_diff_mode", () => {
            if (diffTarget()) setSideBySide((v) => !v);
        }),
    );
    onCleanup(() => shortcutCleanups.forEach((c) => c()));

    const terminalReadyKey = () =>
        params.threadId && projectQuery.data?.directory && threadQuery.data
            ? `${params.threadId}|${threadQuery.data.worktree_dir || projectQuery.data.directory}`
            : "";

    return (
        <div class="flex h-full min-h-0 w-full overflow-hidden">
            <section class="flex min-h-0 flex-1 flex-col overflow-hidden">
                <ThreadHeader
                    editingTitle={editingTitle}
                    titleDraft={titleDraft}
                    setTitleDraft={setTitleDraft}
                    threadTitle={() => threadQuery.data?.title}
                    projectName={() => projectQuery.data?.name}
                    workingDir={workingDir}
                    titleInputRef={(el) => {
                        titleInputRef = el;
                    }}
                    onStartEditTitle={startEditingTitle}
                    onCommitTitle={commitTitle}
                    onCancelEditTitle={() => setEditingTitle(false)}
                    terminalOpen={terminalOpen}
                    onToggleTerminal={() => setTerminalOpen((v) => !v)}
                    sidebarOpen={sidebarOpen}
                    onToggleSidebar={() => setSidebarOpen((v) => !v)}
                    formatKey={formatKey}
                    hasWorktree={() =>
                        !!(threadQuery.data?.worktree_dir ?? "").trim()
                    }
                    onDeleteThread={async (removeWorktree) => {
                        const tid = params.threadId;
                        await DeleteThread(tid, removeWorktree);
                        // Drop this thread's queries without refetching (invalidateQueries on ["threads"]
                        // would refetch messages/git for the current thread and block navigation for seconds).
                        queryClient.removeQueries({
                            queryKey: queryKeys.threads.detail(tid),
                        });
                        queryClient.setQueryData<store.Thread[]>(
                            queryKeys.threads.all,
                            (old) => old?.filter((t) => t.id !== tid) ?? [],
                        );
                        navigate("/");
                    }}
                />

                <Show
                    when={diffTarget()}
                    fallback={
                        <ThreadChatPane
                            messages={messages}
                            diffTarget={diffTarget}
                            draft={draft}
                            setDraft={setDraft}
                            sendError={sendError}
                            streaming={streaming}
                            streamingText={streamingText}
                            streamingReasoningText={streamingReasoningText}
                            streamingThinkingDurationSec={
                                streamingThinkingDurationSec
                            }
                            streamingAttribution={streamingAttribution}
                            threadQueryData={() => threadQuery.data}
                            modelChoices={modelChoices}
                            canSend={canSend}
                            onSubmit={submitMessage}
                            sendMutationPending={sendMutation.isPending}
                            chatProvider={chatProvider}
                            chatModel={chatModel}
                            setProvider={setProvider}
                            setModel={setModel}
                            showOpenRouterKeyHint={showOpenRouterKeyHint}
                            providerDisabled={() =>
                                setChatProviderMutation.isPending
                            }
                            modelDisabled={() => setChatModelMutation.isPending}
                            chatTextareaRef={(el) => {
                                chatTextareaRef = el;
                            }}
                        />
                    }
                >
                    {(target) => (
                        <ThreadDiffPane
                            target={target}
                            diffLoading={() => diffQuery.isLoading}
                            diffData={() => diffQuery.data}
                            diffIsError={() => diffQuery.isError}
                            sideBySide={sideBySide}
                            setSideBySide={setSideBySide}
                            setDiffNav={setDiffNav}
                            onClose={() => setDiffTarget(null)}
                            onPrevDiff={() => diffNav()?.goPrev()}
                            onNextDiff={() => diffNav()?.goNext()}
                            formatKey={formatKey}
                        />
                    )}
                </Show>

                <Show when={terminalOpen()}>
                    <ThreadTerminalDock
                        terminalHeight={terminalHeight}
                        onResizeTerminal={(delta) =>
                            setTerminalHeight((h) =>
                                Math.max(80, Math.min(600, h + delta)),
                            )
                        }
                        readyKey={terminalReadyKey}
                    />
                </Show>
            </section>

            <Show when={sidebarOpen()}>
                <ResizeHandle
                    direction="horizontal"
                    onResize={(delta) =>
                        setSidebarWidth((w) =>
                            Math.max(200, Math.min(600, w + delta)),
                        )
                    }
                />
                <ReviewSidebar
                    width={sidebarWidth()}
                    threadId={params.threadId}
                    git={gitStatusQuery.data ?? null}
                    onRefresh={() => void refreshGitSidebar()}
                    onCopySummary={() => void copyReviewSummary()}
                    onCopyPatch={() => void copyPatchPreview()}
                    onFileClick={(path, status) =>
                        setDiffTarget({ path, status })
                    }
                />
            </Show>
        </div>
    );
};
