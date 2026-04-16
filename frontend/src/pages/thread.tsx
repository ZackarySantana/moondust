import { createQuery, useQueryClient } from "@tanstack/solid-query";
import { useNavigate, useParams } from "@solidjs/router";
import type { Component } from "solid-js";
import {
    createEffect,
    createMemo,
    createSignal,
    on,
    onCleanup,
    Show,
} from "solid-js";
import { DeleteThread, ListLaneMessages, RenameThread } from "@wails/go/app/App";
import type { DiffNav } from "@/components/diff-viewer";
import { ResizeHandle } from "@/components/resize-handle";
import { QuickQuestionPanel } from "@/components/thread/quick-question-panel";
import { ReviewSidebar } from "@/components/thread/review-sidebar";
import { ThreadChatPane } from "@/components/thread/thread-chat-pane";
import { ThreadDiffPane } from "@/components/thread/thread-diff-pane";
import { ThreadHeader } from "@/components/thread/thread-header";
import { ThreadTerminalDock } from "@/components/thread/thread-terminal-dock";
import type { DiffTarget } from "@/components/thread/types";
import { useThreadChatMutations } from "@/hooks/use-thread-chat-mutations";
import { useThreadFileDiff } from "@/hooks/use-thread-file-diff";
import { useThreadGitMutations } from "@/hooks/use-thread-git-mutations";
import { useThreadPageQueries } from "@/hooks/use-thread-page-queries";
import type { ChatProviderId } from "@/lib/chat-provider";
import {
    invalidateThreadList,
    invalidateThreadScoped,
    queryKeys,
} from "@/lib/query-client";
import { useThreadChatStream } from "@/lib/thread/use-thread-chat-stream";
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
import { useShortcuts } from "@/lib/shortcut-context";
import type { store } from "@wails/go/models";

export const ThreadPage: Component = () => {
    const params = useParams<{ projectId: string; threadId: string }>();
    const projectId = () => params.projectId;
    const threadId = () => params.threadId;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { onAction, formatKey } = useShortcuts();
    const [draft, setDraft] = createSignal("");
    const [sendError, setSendError] = createSignal("");
    const [quickQuestionOpen, setQuickQuestionOpen] = createSignal(false);
    let chatTextareaRef!: HTMLTextAreaElement;

    const quickLaneMsgsQuery = createQuery(() => ({
        queryKey: queryKeys.threads.laneMessages(params.threadId, "quick"),
        queryFn: () => ListLaneMessages(params.threadId, "quick"),
        enabled: quickQuestionOpen(),
        staleTime: 0,
    }));
    const quickLaneMessages = () => quickLaneMsgsQuery.data ?? [];

    const {
        streaming,
        streamingText,
        streamingReasoningText,
        streamingThinkingDurationSec,
        streamingChunks,
        streamingPhase,
    } = useThreadChatStream(
        threadId,
        (msg) => setSendError(msg),
    );

    const {
        projectQuery,
        settingsQuery,
        thread,
        messages,
        gitStatusQuery,
        chatProvider,
        modelChoices,
        chatModel,
        streamingAttribution,
        workingDir,
    } = useThreadPageQueries(projectId, threadId, {
        gitReviewOpen: () => sidebarOpen(),
    });

    const threadGitMut = useThreadGitMutations(threadId);

    const {
        sendMutation,
        setChatProviderMutation,
        setChatModelMutation,
        forkThreadMutation,
    } = useThreadChatMutations({
        threadId,
        setSendError,
        setDraft,
    });

    const canSend = createMemo(
        () =>
            !sendMutation.isPending &&
            !streaming() &&
            draft().trim().length > 0,
    );

    const forkAssistant = createMemo(() => {
        const tid = params.threadId;
        const pid = params.projectId;
        if (!tid || !pid) return undefined;
        return {
            threadId: tid,
            projectId: pid,
            sourceUsesWorktree: !!(thread()?.worktree_dir ?? "").trim(),
            forkMessage: (messageId: string) =>
                forkThreadMutation.mutateAsync(messageId),
            forkPending: () => forkThreadMutation.isPending,
            forkError: () => forkThreadMutation.error,
        };
    });

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

    const diffQuery = useThreadFileDiff(threadId, diffTarget);

    const [editingTitle, setEditingTitle] = createSignal(false);

    createEffect(
        on(
            () => params.threadId,
            (id, prev) => {
                if (prev !== undefined && id !== prev) {
                    setDraft("");
                    setSendError("");
                    setEditingTitle(false);
                    setDiffNav(null);
                }
            },
        ),
    );
    const [titleDraft, setTitleDraft] = createSignal("");
    let titleInputRef!: HTMLInputElement;

    function startEditingTitle() {
        setTitleDraft(thread()?.title ?? "");
        setEditingTitle(true);
        requestAnimationFrame(() => {
            titleInputRef?.focus();
            titleInputRef?.select();
        });
    }

    async function commitTitle() {
        const trimmed = titleDraft().trim();
        setEditingTitle(false);
        if (trimmed && trimmed !== (thread()?.title ?? "")) {
            await RenameThread(params.threadId, trimmed);
            await invalidateThreadScoped(queryClient, params.threadId);
            await invalidateThreadList(queryClient);
        }
    }

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

    const terminalReadyKey = () => {
        const t = thread();
        return params.threadId && projectQuery.data?.directory && t
            ? `${params.threadId}|${t.worktree_dir || projectQuery.data.directory}`
            : "";
    };

    return (
        <div class="flex h-full min-h-0 w-full overflow-hidden">
            <section class="flex min-h-0 flex-1 flex-col overflow-hidden">
                <ThreadHeader
                    editingTitle={editingTitle}
                    titleDraft={titleDraft}
                    setTitleDraft={setTitleDraft}
                    threadTitle={() => thread()?.title}
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
                    quickQuestionOpen={quickQuestionOpen}
                    onToggleQuickQuestion={() => setQuickQuestionOpen((v) => !v)}
                    formatKey={formatKey}
                    hasWorktree={() => !!(thread()?.worktree_dir ?? "").trim()}
                    threadSettingsHref={`/project/${params.projectId}/thread/${params.threadId}/settings/general`}
                    onDeleteThread={async (removeWorktree) => {
                        const tid = params.threadId;
                        await DeleteThread(tid, removeWorktree);
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
                            streamingChunks={streamingChunks}
                            streamingPhase={streamingPhase}
                            streamingAttribution={streamingAttribution}
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
                            forkAssistant={forkAssistant()}
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

            <Show when={quickQuestionOpen()}>
                <ResizeHandle direction="horizontal" onResize={() => {}} />
                <div style={{ width: "320px" }}>
                    <QuickQuestionPanel
                        threadId={params.threadId}
                        open={quickQuestionOpen()}
                        onClose={() => setQuickQuestionOpen(false)}
                        laneMessages={quickLaneMessages}
                    />
                </div>
            </Show>

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
                    usesDedicatedWorktree={!!(thread()?.worktree_dir ?? "").trim()}
                    git={gitStatusQuery.data ?? null}
                    gitMut={threadGitMut}
                    onRefresh={() => void refreshGitSidebar()}
                    onCopySummary={() => void copyReviewSummary()}
                    onCopyPatch={() => void copyPatchPreview()}
                    onFileClick={(path, status) =>
                        setDiffTarget({ path, status })
                    }
                    onInsertReviewIntoComposer={(text) => {
                        setDraft(text);
                        requestAnimationFrame(() => {
                            const el = chatTextareaRef;
                            if (!el) return;
                            el.focus();
                            const len = text.length;
                            el.selectionStart = len;
                            el.selectionEnd = len;
                        });
                    }}
                />
            </Show>
        </div>
    );
};
