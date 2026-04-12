import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { useParams } from "@solidjs/router";
import ArrowLeft from "lucide-solid/icons/arrow-left";
import ArrowUp from "lucide-solid/icons/arrow-up";
import Bot from "lucide-solid/icons/bot";
import ChevronDownNav from "lucide-solid/icons/chevron-down";
import ChevronUpNav from "lucide-solid/icons/chevron-up";
import Columns2 from "lucide-solid/icons/columns-2";
import FolderOpen from "lucide-solid/icons/folder-open";
import Loader2 from "lucide-solid/icons/loader-2";
import Minus from "lucide-solid/icons/minus";
import Plus from "lucide-solid/icons/plus";
import PanelBottom from "lucide-solid/icons/panel-bottom";
import PanelBottomDashed from "lucide-solid/icons/panel-bottom-dashed";
import PanelRight from "lucide-solid/icons/panel-right";
import PanelRightDashed from "lucide-solid/icons/panel-right-dashed";
import Rows2 from "lucide-solid/icons/rows-2";
import Sparkles from "lucide-solid/icons/sparkles";
import type { Component, JSX, ParentComponent } from "solid-js";
import {
    createEffect,
    createMemo,
    createSignal,
    For,
    on,
    onCleanup,
    onMount,
    Show,
} from "solid-js";
import {
    GetFileDiff,
    GetProject,
    GetSettings,
    GetThread,
    GetThreadGitReview,
    GitCheckoutNewBranchAndCommit,
    GitCommit,
    GitDiscardUnstaged,
    GitStageUnstaged,
    GitUnstageAll,
    ListOpenRouterChatModels,
    ListThreadMessages,
    RenameThread,
    SendThreadMessage,
    SetThreadChatModel,
    SetThreadChatProvider,
} from "@wails/go/app/App";
import { AssistantMessageMetadataButton } from "@/components/assistant-message-metadata";
import { ChatProviderBar } from "@/components/chat-provider-bar";
import { DiffViewer, type DiffNav } from "@/components/diff-viewer";
import { Kbd } from "@/components/kbd";
import { ResizeHandle } from "@/components/resize-handle";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTitle,
} from "@/components/ui/dialog";
import { TerminalPane } from "@/components/terminal-pane";
import {
    assistantAttributionLabel,
    chatModelFromThread,
    chatProviderFromThread,
    OPENROUTER_CHAT_MODELS_FALLBACK,
    type ChatProviderId,
} from "@/lib/chat-provider";
import { queryKeys } from "@/lib/query-client";
import { useShortcuts } from "@/lib/shortcut-context";
import type { store } from "@wails/go/models";
import { EventsOn } from "@wails/runtime/runtime";

interface DiffTarget {
    path: string;
    status: string;
}

export const ThreadPage: Component = () => {
    const params = useParams<{ projectId: string; threadId: string }>();
    const queryClient = useQueryClient();
    const { onAction, formatKey } = useShortcuts();
    const [draft, setDraft] = createSignal("");
    const [sendError, setSendError] = createSignal("");
    const [streaming, setStreaming] = createSignal(false);
    const [streamingText, setStreamingText] = createSignal("");
    let chatTextareaRef!: HTMLTextAreaElement;
    const [userAtBottom, setUserAtBottom] = createSignal(true);
    const [terminalHeight, setTerminalHeight] = createSignal(208);
    const [sidebarWidth, setSidebarWidth] = createSignal(320);
    const [terminalOpen, setTerminalOpen] = createSignal(true);
    const [sidebarOpen, setSidebarOpen] = createSignal(true);
    let messagesContainerRef!: HTMLDivElement;

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

    createEffect(
        on(
            () => [draft(), messages().length, streamingText()] as const,
            () => {
                if (userAtBottom() && messagesContainerRef) {
                    requestAnimationFrame(() => {
                        messagesContainerRef.scrollTop =
                            messagesContainerRef.scrollHeight;
                    });
                }
            },
        ),
    );

    // Closing the file diff swaps `Show` branches and remounts the messages scroller
    // (scrollTop resets to 0). Re-pin to the bottom when leaving the diff view.
    createEffect(
        on(
            () => diffTarget(),
            (target, prev) => {
                if (target !== null) return;
                if (prev === undefined || prev === null) return;
                queueMicrotask(() => {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            const el = messagesContainerRef;
                            if (el) {
                                el.scrollTop = el.scrollHeight;
                                setUserAtBottom(true);
                            }
                        });
                    });
                });
            },
        ),
    );

    createEffect(
        on(
            () => params.threadId,
            (id, prev) => {
                if (prev !== undefined && prev !== id) {
                    setStreaming(false);
                    setStreamingText("");
                }
            },
        ),
    );

    onMount(() => {
        const unsubs: (() => void)[] = [];
        const tid = () => params.threadId;

        unsubs.push(
            EventsOn("chat:stream_start", (...args: unknown[]) => {
                const p = args[0] as { thread_id?: string };
                if (p?.thread_id !== tid()) return;
                setStreamingText("");
                setStreaming(true);
            }),
        );
        unsubs.push(
            EventsOn("chat:stream", (...args: unknown[]) => {
                const p = args[0] as { thread_id?: string; delta?: string };
                if (p?.thread_id !== tid()) return;
                const d = p.delta ?? "";
                if (!d) return;
                setStreamingText((prev) => prev + d);
            }),
        );
        unsubs.push(
            EventsOn("chat:stream_done", (...args: unknown[]) => {
                const p = args[0] as { thread_id?: string };
                const doneId = p?.thread_id;
                if (!doneId) return;
                void (async () => {
                    await queryClient.invalidateQueries({
                        queryKey: queryKeys.threads.messages(doneId),
                    });
                    if (tid() === doneId) {
                        setStreaming(false);
                        setStreamingText("");
                    }
                })();
            }),
        );
        unsubs.push(
            EventsOn("chat:stream_error", (...args: unknown[]) => {
                const p = args[0] as { thread_id?: string; error?: string };
                if (p?.thread_id !== tid()) return;
                setStreaming(false);
                setStreamingText("");
                setSendError(p?.error?.trim() || "Assistant reply failed");
            }),
        );

        onCleanup(() => unsubs.forEach((u) => u()));
    });

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

    return (
        <div class="flex h-full min-h-0 w-full overflow-hidden">
            <section class="flex min-h-0 flex-1 flex-col overflow-hidden">
                {/* ── Header ── */}
                <header class="flex items-center gap-3 border-b border-slate-800/40 px-4 py-2.5">
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                            <Show
                                when={editingTitle()}
                                fallback={
                                    <h1
                                        class="cursor-pointer truncate text-sm font-medium text-slate-100 hover:text-white"
                                        onClick={startEditingTitle}
                                        title="Click to rename"
                                    >
                                        {threadQuery.data?.title ||
                                            "Untitled thread"}
                                    </h1>
                                }
                            >
                                <input
                                    ref={titleInputRef}
                                    type="text"
                                    value={titleDraft()}
                                    onInput={(e) =>
                                        setTitleDraft(e.currentTarget.value)
                                    }
                                    onBlur={() => void commitTitle()}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            void commitTitle();
                                        } else if (e.key === "Escape") {
                                            e.preventDefault();
                                            setEditingTitle(false);
                                        }
                                    }}
                                    class="min-w-0 truncate rounded bg-transparent px-0.5 text-sm font-medium text-slate-100 outline-none ring-1 ring-emerald-500/40"
                                />
                            </Show>
                            <span class="shrink-0 text-[10px] text-slate-600">
                                in
                            </span>
                            <span class="truncate text-[11px] font-medium text-slate-400">
                                {projectQuery.data?.name ?? "Project"}
                            </span>
                        </div>
                        <Show when={workingDir()}>
                            <div class="mt-0.5 flex items-center gap-1.5">
                                <FolderOpen
                                    class="size-3 shrink-0 text-slate-600"
                                    stroke-width={1.5}
                                    aria-hidden
                                />
                                <span class="min-w-0 truncate font-mono text-[10px] text-slate-600">
                                    {workingDir()}
                                </span>
                            </div>
                        </Show>
                    </div>
                    <div class="flex shrink-0 items-center gap-1">
                        <button
                            type="button"
                            class="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-slate-500 transition-colors hover:bg-slate-800/40 hover:text-slate-300"
                            onClick={() => setTerminalOpen((v) => !v)}
                        >
                            <Show
                                when={terminalOpen()}
                                fallback={
                                    <PanelBottomDashed
                                        class="size-3.5"
                                        stroke-width={1.5}
                                        aria-hidden
                                    />
                                }
                            >
                                <PanelBottom
                                    class="size-3.5"
                                    stroke-width={1.5}
                                    aria-hidden
                                />
                            </Show>
                            Terminal
                            <Kbd combo={formatKey("toggle_terminal")} />
                        </button>
                        <button
                            type="button"
                            class="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-slate-500 transition-colors hover:bg-slate-800/40 hover:text-slate-300"
                            onClick={() => setSidebarOpen((v) => !v)}
                        >
                            <Show
                                when={sidebarOpen()}
                                fallback={
                                    <PanelRightDashed
                                        class="size-3.5"
                                        stroke-width={1.5}
                                        aria-hidden
                                    />
                                }
                            >
                                <PanelRight
                                    class="size-3.5"
                                    stroke-width={1.5}
                                    aria-hidden
                                />
                            </Show>
                            Git
                            <Kbd combo={formatKey("toggle_sidebar")} />
                        </button>
                    </div>
                </header>

                <Show
                    when={diffTarget()}
                    fallback={
                        <>
                            {/* ── Messages ── */}
                            <div
                                ref={(el) => {
                                    messagesContainerRef = el;
                                    const onScroll = () => {
                                        const atBottom =
                                            el.scrollHeight -
                                                el.scrollTop -
                                                el.clientHeight <
                                            32;
                                        setUserAtBottom(atBottom);
                                    };
                                    el.addEventListener("scroll", onScroll, {
                                        passive: true,
                                    });
                                    return () =>
                                        el.removeEventListener(
                                            "scroll",
                                            onScroll,
                                        );
                                }}
                                class="min-h-0 flex-1 overflow-y-auto"
                            >
                                <div class="mx-auto flex w-full max-w-3xl flex-col gap-1 px-4 py-4">
                                    <Show
                                        when={
                                            messages().length > 0 || streaming()
                                        }
                                        fallback={
                                            <div class="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                                <div class="rounded-xl border border-slate-800/40 bg-slate-900/30 p-3">
                                                    <Sparkles
                                                        class="size-6 text-emerald-500/60"
                                                        stroke-width={1.5}
                                                    />
                                                </div>
                                                <div>
                                                    <p class="text-sm font-medium text-slate-300">
                                                        Start a conversation
                                                    </p>
                                                    <p class="mt-1 text-xs text-slate-600">
                                                        Send a message to begin
                                                        working with the agent.
                                                    </p>
                                                </div>
                                            </div>
                                        }
                                    >
                                        <For each={messages()}>
                                            {(msg) => {
                                                const assistantLine = () => {
                                                    if (
                                                        msg.role !== "assistant"
                                                    )
                                                        return null;
                                                    return (
                                                        assistantAttributionLabel(
                                                            msg.chat_provider,
                                                            msg.chat_model,
                                                            modelChoices(),
                                                        ) ??
                                                        assistantAttributionLabel(
                                                            threadQuery.data
                                                                ?.chat_provider,
                                                            threadQuery.data
                                                                ?.chat_model,
                                                            modelChoices(),
                                                        )
                                                    );
                                                };
                                                return (
                                                    <div
                                                        class={
                                                            msg.role === "user"
                                                                ? "flex justify-end py-1"
                                                                : "flex justify-start py-1"
                                                        }
                                                    >
                                                        <Show
                                                            when={
                                                                msg.role ===
                                                                "user"
                                                            }
                                                            fallback={
                                                                <div class="flex min-w-0 max-w-[85%] flex-col gap-1">
                                                                    <Show
                                                                        when={assistantLine()}
                                                                    >
                                                                        {(
                                                                            line,
                                                                        ) => (
                                                                            <div class="flex min-w-0 items-center gap-1 pl-[34px]">
                                                                                <p class="min-w-0 flex-1 text-[10px] leading-tight text-slate-500">
                                                                                    {line()}
                                                                                </p>
                                                                                <AssistantMessageMetadataButton
                                                                                    msg={
                                                                                        msg
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </Show>
                                                                    <div class="flex gap-2.5 py-1">
                                                                        <div class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-slate-800/60">
                                                                            <Bot
                                                                                class="size-3.5 text-emerald-500/70"
                                                                                stroke-width={
                                                                                    1.5
                                                                                }
                                                                            />
                                                                        </div>
                                                                        <div class="min-w-0 text-[13px] leading-relaxed text-slate-300">
                                                                            <p class="whitespace-pre-wrap wrap-break-word">
                                                                                {
                                                                                    msg.content
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            }
                                                        >
                                                            <div class="max-w-[80%] rounded-2xl rounded-br-md bg-emerald-800/30 px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-100">
                                                                <p class="whitespace-pre-wrap wrap-break-word">
                                                                    {
                                                                        msg.content
                                                                    }
                                                                </p>
                                                            </div>
                                                        </Show>
                                                    </div>
                                                );
                                            }}
                                        </For>
                                        <Show when={streaming()}>
                                            <div class="flex justify-start py-1">
                                                <div class="flex min-w-0 max-w-[85%] flex-col gap-1">
                                                    <Show
                                                        when={streamingAttribution()}
                                                    >
                                                        {(line) => (
                                                            <p class="pl-[34px] text-[10px] leading-tight text-slate-500">
                                                                {line()}
                                                            </p>
                                                        )}
                                                    </Show>
                                                    <div class="flex gap-2.5 py-1">
                                                        <div class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-slate-800/60">
                                                            <Bot
                                                                class="size-3.5 text-emerald-500/70"
                                                                stroke-width={
                                                                    1.5
                                                                }
                                                            />
                                                        </div>
                                                        <div class="min-w-0 text-[13px] leading-relaxed text-slate-300">
                                                            <Show
                                                                when={
                                                                    streamingText()
                                                                        .length >
                                                                    0
                                                                }
                                                                fallback={
                                                                    <div class="flex items-center gap-2 text-slate-500">
                                                                        <Loader2
                                                                            class="size-3.5 animate-spin"
                                                                            stroke-width={
                                                                                2
                                                                            }
                                                                            aria-hidden
                                                                        />
                                                                        <span class="text-xs">
                                                                            Thinking…
                                                                        </span>
                                                                    </div>
                                                                }
                                                            >
                                                                <p class="whitespace-pre-wrap wrap-break-word">
                                                                    {streamingText()}
                                                                </p>
                                                            </Show>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Show>
                                    </Show>
                                </div>
                            </div>

                            {/* ── Input bar ── */}
                            <div class="shrink-0 border-t border-slate-800/40 px-4 py-3">
                                <div class="mx-auto w-full max-w-3xl space-y-2">
                                    <Show when={sendError()}>
                                        {(msg) => (
                                            <p class="text-xs text-red-400/90">
                                                {msg()}
                                            </p>
                                        )}
                                    </Show>
                                    <div class="rounded-xl border border-slate-800/50 bg-slate-900/40 transition-colors focus-within:border-emerald-700/40">
                                        <textarea
                                            ref={(el) => {
                                                chatTextareaRef = el;
                                                const resize = () => {
                                                    el.style.height = "auto";
                                                    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                                                };
                                                createEffect(() => {
                                                    draft();
                                                    resize();
                                                });
                                            }}
                                            rows={1}
                                            class="max-h-40 min-h-[36px] w-full resize-none bg-transparent px-3.5 pt-3 pb-2 text-[13px] leading-relaxed text-slate-200 outline-none placeholder:text-slate-600"
                                            placeholder="Send a message…"
                                            value={draft()}
                                            onInput={(e) =>
                                                setDraft(e.currentTarget.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key === "Enter" &&
                                                    !e.shiftKey
                                                ) {
                                                    e.preventDefault();
                                                    submitMessage();
                                                }
                                            }}
                                        />
                                        <div class="flex flex-wrap items-center justify-between gap-2 px-2.5 pb-2">
                                            <ChatProviderBar
                                                provider={chatProvider()}
                                                onProviderChange={setProvider}
                                                model={chatModel()}
                                                onModelChange={setModel}
                                                modelChoices={modelChoices()}
                                                showOpenRouterKeyHint={showOpenRouterKeyHint()}
                                                providerDisabled={
                                                    setChatProviderMutation.isPending
                                                }
                                                modelDisabled={
                                                    setChatModelMutation.isPending
                                                }
                                            />
                                            <div class="flex shrink-0 items-center gap-2">
                                                <kbd class="hidden items-center rounded border border-slate-700/50 bg-slate-800/40 px-1.5 py-0.5 font-mono text-[9px] leading-none text-slate-600 sm:inline-flex">
                                                    Enter
                                                </kbd>
                                                <button
                                                    type="button"
                                                    class="flex size-7 cursor-pointer items-center justify-center rounded-lg bg-emerald-700/80 text-white transition-all duration-100 hover:bg-emerald-600/90 disabled:cursor-not-allowed disabled:opacity-30"
                                                    disabled={!canSend()}
                                                    onClick={submitMessage}
                                                    aria-label="Send message"
                                                >
                                                    <Show
                                                        when={
                                                            !sendMutation.isPending &&
                                                            !streaming()
                                                        }
                                                        fallback={
                                                            <Loader2
                                                                class="size-3.5 animate-spin"
                                                                stroke-width={2}
                                                                aria-hidden
                                                            />
                                                        }
                                                    >
                                                        <ArrowUp
                                                            class="size-4"
                                                            stroke-width={2.5}
                                                            aria-hidden
                                                        />
                                                    </Show>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    }
                >
                    {(target) => (
                        <>
                            {/* ── Diff header ── */}
                            <div class="flex items-center gap-2 border-b border-slate-800/40 px-4 py-2">
                                <button
                                    type="button"
                                    class="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-slate-200"
                                    onClick={() => setDiffTarget(null)}
                                    title={`Back to chat (${formatKey("close_diff")})`}
                                >
                                    <ArrowLeft
                                        class="size-3"
                                        stroke-width={2}
                                        aria-hidden
                                    />
                                    Chat
                                    <Kbd combo={formatKey("close_diff")} />
                                </button>
                                <span class="text-slate-700">·</span>
                                <span
                                    class={`font-mono text-[10px] font-bold ${statusColor(target().status)}`}
                                >
                                    {target().status === "untracked"
                                        ? "?"
                                        : target().status}
                                </span>
                                <span class="min-w-0 truncate font-mono text-xs text-slate-300">
                                    {target().path}
                                </span>
                                <div class="ml-auto flex items-center gap-1">
                                    <button
                                        type="button"
                                        class="cursor-pointer rounded p-1 text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-200"
                                        onClick={() => diffNav()?.goPrev()}
                                        title={`Previous change (${formatKey("prev_diff")})`}
                                    >
                                        <ChevronUpNav
                                            class="size-3.5"
                                            stroke-width={2}
                                            aria-hidden
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        class="cursor-pointer rounded p-1 text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-200"
                                        onClick={() => diffNav()?.goNext()}
                                        title={`Next change (${formatKey("next_diff")})`}
                                    >
                                        <ChevronDownNav
                                            class="size-3.5"
                                            stroke-width={2}
                                            aria-hidden
                                        />
                                    </button>
                                    <span class="mx-0.5 h-4 w-px bg-slate-800/60" />
                                    <button
                                        type="button"
                                        class={`cursor-pointer rounded p-1 transition-colors ${sideBySide() ? "bg-slate-800/50 text-slate-200" : "text-slate-500 hover:text-slate-300"}`}
                                        onClick={() => setSideBySide(true)}
                                        title="Side by side"
                                    >
                                        <Columns2
                                            class="size-3.5"
                                            stroke-width={1.5}
                                            aria-hidden
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        class={`cursor-pointer rounded p-1 transition-colors ${!sideBySide() ? "bg-slate-800/50 text-slate-200" : "text-slate-500 hover:text-slate-300"}`}
                                        onClick={() => setSideBySide(false)}
                                        title="Inline"
                                    >
                                        <Rows2
                                            class="size-3.5"
                                            stroke-width={1.5}
                                            aria-hidden
                                        />
                                    </button>
                                </div>
                            </div>
                            {/* ── Diff content ── */}
                            <div class="min-h-0 flex-1 p-2">
                                <Show
                                    when={
                                        !diffQuery.isLoading && diffQuery.data
                                    }
                                    fallback={
                                        <div class="flex h-full items-center justify-center">
                                            <Loader2
                                                class="size-6 animate-spin text-slate-500"
                                                stroke-width={1.5}
                                            />
                                        </div>
                                    }
                                >
                                    <Show
                                        when={diffQuery.isError}
                                        fallback={
                                            <DiffViewer
                                                original={
                                                    diffQuery.data?.original ??
                                                    ""
                                                }
                                                modified={
                                                    diffQuery.data?.modified ??
                                                    ""
                                                }
                                                language={
                                                    diffQuery.data?.language ??
                                                    "plaintext"
                                                }
                                                path={target().path}
                                                sideBySide={sideBySide()}
                                                onReady={setDiffNav}
                                            />
                                        }
                                    >
                                        <div class="flex h-full items-center justify-center">
                                            <p class="text-xs text-red-400">
                                                Failed to load diff.
                                            </p>
                                        </div>
                                    </Show>
                                </Show>
                            </div>
                        </>
                    )}
                </Show>

                {/* ── Terminal ── */}
                <Show when={terminalOpen()}>
                    <ResizeHandle
                        direction="vertical"
                        onResize={(delta) =>
                            setTerminalHeight((h) =>
                                Math.max(80, Math.min(600, h + delta)),
                            )
                        }
                    />
                    <div
                        class="flex min-h-0 shrink-0 p-3"
                        style={{ height: `${terminalHeight()}px` }}
                    >
                        <Show
                            when={
                                params.threadId &&
                                projectQuery.data?.directory &&
                                threadQuery.data
                                    ? `${params.threadId}|${threadQuery.data.worktree_dir || projectQuery.data.directory}`
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

// ---------------------------------------------------------------------------
// GitHub URL derivation
// ---------------------------------------------------------------------------

function deriveGitHubURL(remoteURL: string | undefined): string | null {
    if (!remoteURL) return null;
    const sshMatch = remoteURL.match(/^git@github\.com:(.+?)(?:\.git)?$/);
    if (sshMatch) return `https://github.com/${sshMatch[1]}`;
    try {
        const url = new URL(remoteURL);
        if (url.hostname === "github.com") {
            return `https://github.com${url.pathname.replace(/\.git$/, "")}`;
        }
    } catch {
        /* not a URL */
    }
    return null;
}

function cleanBranchName(raw: string): string {
    const dotIdx = raw.indexOf("...");
    return dotIdx >= 0 ? raw.slice(0, dotIdx) : raw;
}

// ---------------------------------------------------------------------------
// Collapsible section wrapper
// ---------------------------------------------------------------------------

type SectionTone = "emerald" | "amber" | "sky" | "violet" | "slate";

const toneAccentMap: Record<SectionTone, string> = {
    emerald: "border-l-emerald-500",
    amber: "border-l-amber-500",
    sky: "border-l-sky-500",
    violet: "border-l-violet-500",
    slate: "border-l-slate-600",
};

const toneBadgeMap: Record<SectionTone, string> = {
    emerald: "bg-emerald-900/30 text-emerald-300",
    amber: "bg-amber-900/30 text-amber-300",
    sky: "bg-sky-900/30 text-sky-300",
    violet: "bg-violet-900/30 text-violet-300",
    slate: "bg-slate-800/60 text-slate-400",
};

const CollapsibleSection: ParentComponent<{
    title: string;
    count: number;
    tone: SectionTone;
    defaultOpen?: boolean;
    trailing?: JSX.Element;
}> = (props) => {
    const [open, setOpen] = createSignal(props.defaultOpen ?? props.count > 0);
    return (
        <div class={`border-l-2 ${toneAccentMap[props.tone]} rounded-r`}>
            <div class="flex w-full items-center gap-1 px-2.5 py-1.5">
                <button
                    type="button"
                    class="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 text-left transition-colors hover:bg-slate-800/30"
                    onClick={() => setOpen((o) => !o)}
                >
                    <svg
                        class={`h-3 w-3 shrink-0 text-slate-500 transition-transform ${open() ? "rotate-90" : ""}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                            clip-rule="evenodd"
                        />
                    </svg>
                    <span class="min-w-0 flex-1 text-[11px] font-medium text-slate-300">
                        {props.title}
                    </span>
                </button>
                <Show when={props.trailing}>
                    <div class="flex shrink-0 items-center gap-0.5">
                        {props.trailing}
                    </div>
                </Show>
                <span
                    class={`shrink-0 rounded px-1.5 py-0.5 text-[10px] leading-none ${toneBadgeMap[props.tone]}`}
                >
                    {props.count}
                </span>
            </div>
            <Show when={open()}>
                <div class="px-2.5 pb-2 pt-1">{props.children}</div>
            </Show>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Status badge colors per git status letter
// ---------------------------------------------------------------------------

const statusColorMap: Record<string, string> = {
    A: "text-emerald-400",
    M: "text-amber-400",
    D: "text-red-400",
    R: "text-sky-400",
    C: "text-sky-400",
    untracked: "text-sky-400",
};

function statusColor(status: string): string {
    return statusColorMap[status] ?? "text-slate-400";
}

// ---------------------------------------------------------------------------
// File change row (compact, clickable)
// ---------------------------------------------------------------------------

const FileChangeRow: Component<{
    path: string;
    status: string;
    onClick?: (path: string, status: string) => void;
}> = (props) => {
    return (
        <button
            type="button"
            class="flex w-full cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-left transition-colors hover:bg-slate-800/40"
            onClick={() => props.onClick?.(props.path, props.status)}
        >
            <span
                class={`w-4 shrink-0 text-center font-mono text-[10px] font-bold ${statusColor(props.status)}`}
            >
                {props.status === "untracked" ? "?" : props.status}
            </span>
            <span class="min-w-0 flex-1 truncate text-[11px] text-slate-300">
                {props.path}
            </span>
        </button>
    );
};

// ---------------------------------------------------------------------------
// Commit row (interactive)
// ---------------------------------------------------------------------------

const CommitRow: Component<{
    commit: store.GitCommitSummary;
    githubURL: string | null;
}> = (props) => {
    async function copyHash() {
        await navigator.clipboard.writeText(props.commit.hash);
    }

    async function copyExactDate() {
        if (props.commit.exact_date) {
            await navigator.clipboard.writeText(props.commit.exact_date);
        }
    }

    function openOnGitHub() {
        if (props.githubURL) {
            window.open(
                `${props.githubURL}/commit/${props.commit.hash}`,
                "_blank",
            );
        }
    }

    return (
        <div class="group flex flex-col gap-0.5 rounded px-1.5 py-1 transition-colors hover:bg-slate-800/30">
            <div class="flex items-center gap-1.5">
                <button
                    type="button"
                    class="cursor-pointer font-mono text-[10px] text-violet-400 transition-colors hover:text-violet-300"
                    onClick={() => void copyHash()}
                    title="Copy hash"
                >
                    {props.commit.hash}
                </button>
                <span class="text-slate-700">·</span>
                <button
                    type="button"
                    class="cursor-pointer text-[10px] text-slate-500 transition-colors hover:text-slate-300"
                    onClick={() => void copyExactDate()}
                    title={props.commit.exact_date || props.commit.when}
                >
                    {props.commit.when}
                </button>
            </div>
            <Show
                when={props.githubURL}
                fallback={
                    <p class="text-[11px] text-slate-200">
                        {props.commit.subject}
                    </p>
                }
            >
                <button
                    type="button"
                    class="cursor-pointer text-left text-[11px] text-slate-200 transition-colors hover:text-sky-300"
                    onClick={openOnGitHub}
                    title="Open on GitHub"
                >
                    {props.commit.subject}
                </button>
            </Show>
            <p class="text-[10px] text-slate-600">{props.commit.author}</p>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Review sidebar
// ---------------------------------------------------------------------------

const ReviewSidebar: Component<{
    width: number;
    threadId: string;
    git: store.GitReview | null;
    onRefresh: () => void;
    onCopySummary: () => void;
    onCopyPatch: () => void;
    onFileClick?: (path: string, status: string) => void;
}> = (props) => {
    const queryClient = useQueryClient();
    const [commitTab, setCommitTab] = createSignal<"local" | "main">("local");
    const [discardOpen, setDiscardOpen] = createSignal(false);
    const [commitOpen, setCommitOpen] = createSignal(false);
    const [branchCommitOpen, setBranchCommitOpen] = createSignal(false);
    const [commitMsg, setCommitMsg] = createSignal("");
    const [branchNameInput, setBranchNameInput] = createSignal("");
    const [branchCommitMsg, setBranchCommitMsg] = createSignal("");
    const [gitActionError, setGitActionError] = createSignal("");

    const invalidateGit = () =>
        queryClient.invalidateQueries({
            queryKey: queryKeys.threads.gitStatus(props.threadId),
        });

    const stageMutation = useMutation(() => ({
        mutationFn: () => GitStageUnstaged(props.threadId),
        onSuccess: async () => {
            setGitActionError("");
            await invalidateGit();
        },
        onError: (e) =>
            setGitActionError(e instanceof Error ? e.message : String(e)),
    }));

    const discardMutation = useMutation(() => ({
        mutationFn: () => GitDiscardUnstaged(props.threadId),
        onSuccess: async () => {
            setDiscardOpen(false);
            setGitActionError("");
            await invalidateGit();
        },
        onError: (e) =>
            setGitActionError(e instanceof Error ? e.message : String(e)),
    }));

    const unstageMutation = useMutation(() => ({
        mutationFn: () => GitUnstageAll(props.threadId),
        onSuccess: async () => {
            setGitActionError("");
            await invalidateGit();
        },
        onError: (e) =>
            setGitActionError(e instanceof Error ? e.message : String(e)),
    }));

    const commitMutation = useMutation(() => ({
        mutationFn: (message: string) => GitCommit(props.threadId, message),
        onSuccess: async () => {
            setCommitOpen(false);
            setCommitMsg("");
            setGitActionError("");
            await invalidateGit();
        },
        onError: (e) =>
            setGitActionError(e instanceof Error ? e.message : String(e)),
    }));

    const branchCommitMutation = useMutation(() => ({
        mutationFn: (vars: { branch: string; message: string }) =>
            GitCheckoutNewBranchAndCommit(
                props.threadId,
                vars.branch,
                vars.message,
            ),
        onSuccess: async () => {
            setBranchCommitOpen(false);
            setBranchNameInput("");
            setBranchCommitMsg("");
            setGitActionError("");
            await invalidateGit();
        },
        onError: (e) =>
            setGitActionError(e instanceof Error ? e.message : String(e)),
    }));

    const gitBusy = () =>
        stageMutation.isPending ||
        discardMutation.isPending ||
        unstageMutation.isPending ||
        commitMutation.isPending ||
        branchCommitMutation.isPending;

    const branch = () => cleanBranchName(props.git?.branch ?? "");
    const ahead = () => props.git?.ahead ?? 0;
    const behind = () => props.git?.behind ?? 0;
    const staged = () => props.git?.staged ?? [];
    const unstaged = () => props.git?.unstaged ?? [];
    const untracked = () => props.git?.untracked ?? [];
    const localCommits = () => props.git?.local_commits ?? [];
    const mainCommits = () => props.git?.main_commits ?? [];
    const githubURL = createMemo(() => deriveGitHubURL(props.git?.remote_url));
    const activeCommits = () =>
        commitTab() === "local" ? localCommits() : mainCommits();

    const gitIconBtn =
        "flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-35";

    return (
        <aside
            class="flex min-h-0 shrink-0 flex-col bg-app-panel"
            style={{ width: `${props.width}px` }}
        >
            <header class="flex items-center justify-between border-b border-slate-800/40 px-3 py-2.5">
                <h2 class="text-xs font-semibold text-slate-200">Review</h2>
                <div class="flex items-center gap-1">
                    <button
                        type="button"
                        class="cursor-pointer rounded p-1 text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300"
                        onClick={props.onRefresh}
                        title="Refresh"
                    >
                        <svg
                            class="h-3.5 w-3.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H4.598a.75.75 0 00-.75.75v3.634a.75.75 0 001.5 0v-2.033l.312.312a7 7 0 0011.712-3.138.75.75 0 00-1.449-.391zm-10.624-3.85a5.5 5.5 0 019.201-2.465l.312.31H11.77a.75.75 0 000 1.5h3.634a.75.75 0 00.75-.75V2.535a.75.75 0 00-1.5 0v2.033l-.312-.312A7 7 0 002.63 7.394a.75.75 0 001.45.39z"
                                clip-rule="evenodd"
                            />
                        </svg>
                    </button>
                    <button
                        type="button"
                        class="cursor-pointer rounded p-1 text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300"
                        onClick={props.onCopySummary}
                        title="Copy summary"
                    >
                        <svg
                            class="h-3.5 w-3.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                            <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                        </svg>
                    </button>
                </div>
            </header>

            <div class="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3 text-xs">
                {/* Branch */}
                <div class="rounded-md bg-slate-900/50 px-3 py-2">
                    <p class="break-all font-mono text-[11px] text-slate-200">
                        {branch() || "unknown"}
                    </p>
                    <div class="mt-1.5 flex gap-1.5">
                        <Show
                            when={ahead() > 0 || behind() > 0}
                            fallback={
                                <span class="rounded-full bg-emerald-900/30 px-2 py-0.5 text-[10px] text-emerald-300">
                                    on {branch() || "main"}
                                </span>
                            }
                        >
                            <Show when={ahead() > 0}>
                                <span class="rounded-full bg-emerald-900/30 px-2 py-0.5 text-[10px] text-emerald-300">
                                    +{ahead()} ahead
                                </span>
                            </Show>
                            <Show when={behind() > 0}>
                                <span class="rounded-full bg-amber-900/30 px-2 py-0.5 text-[10px] text-amber-300">
                                    -{behind()} behind
                                </span>
                            </Show>
                        </Show>
                    </div>
                </div>

                <div class="flex flex-wrap gap-1.5">
                    <button
                        type="button"
                        class="rounded border border-slate-700/60 bg-slate-800/40 px-2 py-1 text-[10px] text-slate-300 transition-colors hover:bg-slate-800/70 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={
                            staged().length === 0 ||
                            gitBusy() ||
                            !props.threadId
                        }
                        onClick={() => {
                            setGitActionError("");
                            setCommitMsg("");
                            setCommitOpen(true);
                        }}
                    >
                        Commit…
                    </button>
                    <button
                        type="button"
                        class="rounded border border-slate-700/60 bg-slate-800/40 px-2 py-1 text-[10px] text-slate-300 transition-colors hover:bg-slate-800/70 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={
                            staged().length === 0 ||
                            gitBusy() ||
                            !props.threadId
                        }
                        onClick={() => {
                            setGitActionError("");
                            setBranchNameInput("");
                            setBranchCommitMsg("");
                            setBranchCommitOpen(true);
                        }}
                    >
                        Branch & commit…
                    </button>
                </div>
                <Show
                    when={
                        gitActionError() &&
                        !discardOpen() &&
                        !commitOpen() &&
                        !branchCommitOpen()
                    }
                >
                    <p class="text-[10px] leading-snug text-red-400">
                        {gitActionError()}
                    </p>
                </Show>

                {/* Staged */}
                <CollapsibleSection
                    title="Staged"
                    count={staged().length}
                    tone="emerald"
                    defaultOpen
                    trailing={
                        <button
                            type="button"
                            class={gitIconBtn}
                            title="Unstage all (keep changes in files)"
                            disabled={
                                staged().length === 0 ||
                                unstageMutation.isPending ||
                                gitBusy()
                            }
                            onClick={() => unstageMutation.mutate()}
                        >
                            <Show
                                when={unstageMutation.isPending}
                                fallback={
                                    <Minus
                                        class="h-3.5 w-3.5"
                                        stroke-width={2}
                                        aria-hidden
                                    />
                                }
                            >
                                <Loader2
                                    class="h-3.5 w-3.5 animate-spin"
                                    stroke-width={2}
                                    aria-hidden
                                />
                            </Show>
                        </button>
                    }
                >
                    <Show
                        when={staged().length > 0}
                        fallback={
                            <p class="py-1 text-[11px] text-slate-600">
                                Nothing staged
                            </p>
                        }
                    >
                        <div class="space-y-0.5">
                            <For each={staged()}>
                                {(f) => (
                                    <FileChangeRow
                                        path={f.path}
                                        status={f.status}
                                        onClick={props.onFileClick}
                                    />
                                )}
                            </For>
                        </div>
                    </Show>
                </CollapsibleSection>

                {/* Unstaged */}
                <CollapsibleSection
                    title="Unstaged"
                    count={unstaged().length}
                    tone="amber"
                    defaultOpen
                    trailing={
                        <div class="flex items-center gap-0.5">
                            <button
                                type="button"
                                class={gitIconBtn}
                                title="Stage all unstaged changes"
                                disabled={
                                    unstaged().length === 0 ||
                                    stageMutation.isPending ||
                                    gitBusy()
                                }
                                onClick={() => stageMutation.mutate()}
                            >
                                <Show
                                    when={stageMutation.isPending}
                                    fallback={
                                        <Plus
                                            class="h-3.5 w-3.5"
                                            stroke-width={2}
                                            aria-hidden
                                        />
                                    }
                                >
                                    <Loader2
                                        class="h-3.5 w-3.5 animate-spin"
                                        stroke-width={2}
                                        aria-hidden
                                    />
                                </Show>
                            </button>
                            <button
                                type="button"
                                class={gitIconBtn}
                                title="Discard unstaged changes in the working tree"
                                disabled={
                                    unstaged().length === 0 ||
                                    discardMutation.isPending ||
                                    gitBusy()
                                }
                                onClick={() => {
                                    setGitActionError("");
                                    setDiscardOpen(true);
                                }}
                            >
                                <Show
                                    when={discardMutation.isPending}
                                    fallback={
                                        <Minus
                                            class="h-3.5 w-3.5"
                                            stroke-width={2}
                                            aria-hidden
                                        />
                                    }
                                >
                                    <Loader2
                                        class="h-3.5 w-3.5 animate-spin"
                                        stroke-width={2}
                                        aria-hidden
                                    />
                                </Show>
                            </button>
                        </div>
                    }
                >
                    <Show
                        when={unstaged().length > 0}
                        fallback={
                            <p class="py-1 text-[11px] text-slate-600">
                                No changes
                            </p>
                        }
                    >
                        <div class="space-y-0.5">
                            <For each={unstaged()}>
                                {(f) => (
                                    <FileChangeRow
                                        path={f.path}
                                        status={f.status}
                                        onClick={props.onFileClick}
                                    />
                                )}
                            </For>
                        </div>
                    </Show>
                </CollapsibleSection>

                {/* Untracked */}
                <CollapsibleSection
                    title="Untracked"
                    count={untracked().length}
                    tone="sky"
                    defaultOpen
                >
                    <Show
                        when={untracked().length > 0}
                        fallback={
                            <p class="py-1 text-[11px] text-slate-600">
                                No untracked files
                            </p>
                        }
                    >
                        <div class="space-y-0.5">
                            <For each={untracked()}>
                                {(f) => (
                                    <FileChangeRow
                                        path={f.path}
                                        status={f.status}
                                        onClick={props.onFileClick}
                                    />
                                )}
                            </For>
                        </div>
                    </Show>
                </CollapsibleSection>

                {/* Commits */}
                <CollapsibleSection
                    title="Commits"
                    count={activeCommits().length}
                    tone="violet"
                    defaultOpen
                    trailing={
                        <div class="flex overflow-hidden rounded border border-slate-700/60 text-[10px] leading-none">
                            <button
                                type="button"
                                class={`cursor-pointer px-2 py-1 transition-colors ${commitTab() === "local" ? "bg-violet-900/40 text-violet-200" : "text-slate-500 hover:text-slate-300"}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCommitTab("local");
                                }}
                            >
                                Branch
                            </button>
                            <button
                                type="button"
                                class={`cursor-pointer border-l border-slate-700/60 px-2 py-1 transition-colors ${commitTab() === "main" ? "bg-violet-900/40 text-violet-200" : "text-slate-500 hover:text-slate-300"}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCommitTab("main");
                                }}
                            >
                                Main
                            </button>
                        </div>
                    }
                >
                    <Show
                        when={activeCommits().length > 0}
                        fallback={
                            <p class="py-1 text-[11px] text-slate-600">
                                {commitTab() === "local"
                                    ? "No commits ahead of main"
                                    : "No commits"}
                            </p>
                        }
                    >
                        <div class="space-y-0.5">
                            <For each={activeCommits()}>
                                {(c) => (
                                    <CommitRow
                                        commit={c}
                                        githubURL={githubURL()}
                                    />
                                )}
                            </For>
                        </div>
                    </Show>
                </CollapsibleSection>

                {/* Diff / Patch */}
                <CollapsibleSection
                    title="Diff"
                    count={0}
                    tone="slate"
                    defaultOpen={false}
                    trailing={
                        <button
                            type="button"
                            class="cursor-pointer rounded px-1.5 py-0.5 text-[10px] text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300"
                            onClick={(e) => {
                                e.stopPropagation();
                                props.onCopyPatch();
                            }}
                            title="Copy patch"
                        >
                            Copy
                        </button>
                    }
                >
                    <Show when={props.git?.diff_stat}>
                        <pre class="mb-2 rounded bg-slate-950/50 p-2 font-mono text-[10px] leading-relaxed text-slate-400 whitespace-pre-wrap wrap-break-word">
                            {props.git!.diff_stat}
                        </pre>
                    </Show>
                    <pre class="max-h-64 overflow-auto rounded bg-slate-950/50 p-2 font-mono text-[10px] leading-relaxed text-slate-400 whitespace-pre-wrap wrap-break-word">
                        {props.git?.patch_preview || "No diff available."}
                    </pre>
                </CollapsibleSection>
            </div>

            <Dialog open={discardOpen()}>
                <DialogOverlay
                    aria-label="Close dialog"
                    onClick={() => {
                        if (!discardMutation.isPending) {
                            setDiscardOpen(false);
                        }
                    }}
                />
                <DialogContent
                    role="dialog"
                    aria-modal="true"
                >
                    <DialogTitle>Discard unstaged changes?</DialogTitle>
                    <p class="mb-4 text-sm text-slate-400">
                        Working tree edits for unstaged files will be reverted
                        to match the index or HEAD. Staged changes are not
                        affected.
                    </p>
                    <Show when={gitActionError() && discardOpen()}>
                        <p class="mb-4 rounded-lg border border-red-900/30 bg-red-950/15 px-3 py-2 text-xs text-red-400">
                            {gitActionError()}
                        </p>
                    </Show>
                    <div class="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={discardMutation.isPending}
                            onClick={() => setDiscardOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            class="inline-flex min-w-28 items-center justify-center gap-2"
                            disabled={discardMutation.isPending}
                            onClick={() => discardMutation.mutate()}
                        >
                            <Show
                                when={discardMutation.isPending}
                                fallback="Discard"
                            >
                                <Loader2
                                    class="size-4 shrink-0 animate-spin"
                                    stroke-width={2}
                                    aria-hidden
                                />
                            </Show>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={commitOpen()}>
                <DialogOverlay
                    aria-label="Close dialog"
                    onClick={() => {
                        if (!commitMutation.isPending) {
                            setCommitOpen(false);
                        }
                    }}
                />
                <DialogContent
                    role="dialog"
                    aria-modal="true"
                >
                    <DialogTitle>Commit staged changes</DialogTitle>
                    <textarea
                        class="mb-4 min-h-24 w-full resize-y rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-slate-600 focus:outline-none"
                        placeholder="Commit message"
                        rows={4}
                        value={commitMsg()}
                        disabled={commitMutation.isPending}
                        onInput={(e) => setCommitMsg(e.currentTarget.value)}
                    />
                    <Show when={gitActionError() && commitOpen()}>
                        <p class="mb-4 rounded-lg border border-red-900/30 bg-red-950/15 px-3 py-2 text-xs text-red-400">
                            {gitActionError()}
                        </p>
                    </Show>
                    <div class="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={commitMutation.isPending}
                            onClick={() => setCommitOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            class="inline-flex min-w-28 items-center justify-center gap-2"
                            disabled={commitMutation.isPending}
                            onClick={() => {
                                const m = commitMsg().trim();
                                if (!m) return;
                                commitMutation.mutate(m);
                            }}
                        >
                            <Show
                                when={commitMutation.isPending}
                                fallback="Commit"
                            >
                                <Loader2
                                    class="size-4 shrink-0 animate-spin"
                                    stroke-width={2}
                                    aria-hidden
                                />
                            </Show>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={branchCommitOpen()}>
                <DialogOverlay
                    aria-label="Close dialog"
                    onClick={() => {
                        if (!branchCommitMutation.isPending) {
                            setBranchCommitOpen(false);
                        }
                    }}
                />
                <DialogContent
                    role="dialog"
                    aria-modal="true"
                >
                    <DialogTitle>New branch and commit</DialogTitle>
                    <div class="mb-3 space-y-1.5">
                        <label
                            for="review-branch-name"
                            class="text-xs text-slate-500"
                        >
                            Branch name
                        </label>
                        <input
                            id="review-branch-name"
                            type="text"
                            class="w-full rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 py-2 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:border-slate-600 focus:outline-none"
                            placeholder="feature/my-change"
                            value={branchNameInput()}
                            disabled={branchCommitMutation.isPending}
                            onInput={(e) =>
                                setBranchNameInput(e.currentTarget.value)
                            }
                        />
                    </div>
                    <textarea
                        class="mb-4 min-h-24 w-full resize-y rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-slate-600 focus:outline-none"
                        placeholder="Commit message"
                        rows={4}
                        value={branchCommitMsg()}
                        disabled={branchCommitMutation.isPending}
                        onInput={(e) =>
                            setBranchCommitMsg(e.currentTarget.value)
                        }
                    />
                    <Show when={gitActionError() && branchCommitOpen()}>
                        <p class="mb-4 rounded-lg border border-red-900/30 bg-red-950/15 px-3 py-2 text-xs text-red-400">
                            {gitActionError()}
                        </p>
                    </Show>
                    <div class="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={branchCommitMutation.isPending}
                            onClick={() => setBranchCommitOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            class="inline-flex min-w-36 items-center justify-center gap-2"
                            disabled={branchCommitMutation.isPending}
                            onClick={() => {
                                const b = branchNameInput().trim();
                                const m = branchCommitMsg().trim();
                                if (!b || !m) return;
                                branchCommitMutation.mutate({
                                    branch: b,
                                    message: m,
                                });
                            }}
                        >
                            <Show
                                when={branchCommitMutation.isPending}
                                fallback="Create branch & commit"
                            >
                                <Loader2
                                    class="size-4 shrink-0 animate-spin"
                                    stroke-width={2}
                                    aria-hidden
                                />
                            </Show>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </aside>
    );
};
