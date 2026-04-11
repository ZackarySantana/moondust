import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { useParams } from "@solidjs/router";
import type { Component, JSX, ParentComponent } from "solid-js";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import {
    GetProject,
    GetThread,
    GetThreadGitReview,
    ListThreadMessages,
    SendThreadMessage,
} from "@wails/go/app/App";
import { TerminalPane } from "@/components/terminal-pane";
import { queryKeys } from "@/lib/query-client";
import type { store } from "@wails/go/models";

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
        queryFn: () => GetThreadGitReview(params.threadId),
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
                    <div class="mx-auto flex w-full max-w-3xl items-end gap-2">
                        <textarea
                            ref={(el) => {
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
                            class="max-h-40 min-h-[36px] w-full resize-none rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 py-2 text-sm leading-snug text-slate-200 outline-none transition-colors focus:border-emerald-600/60"
                            placeholder="Message thread..."
                            value={draft()}
                            onInput={(e) => setDraft(e.currentTarget.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    submitMessage();
                                }
                            }}
                        />
                        <button
                            type="button"
                            class="shrink-0 cursor-pointer rounded-md border border-emerald-700/60 bg-emerald-800/50 px-3 py-2 text-xs font-medium text-emerald-100 transition-colors hover:bg-emerald-700/60 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!canSend()}
                            onClick={submitMessage}
                        >
                            {sendMutation.isPending ? "Sending…" : "Send"}
                        </button>
                    </div>
                </div>

                <div class="flex h-52 min-h-0 shrink-0 border-t border-slate-800/40 p-3">
                    <Show
                        when={
                            params.threadId && projectQuery.data?.directory
                                ? `${params.threadId}|${threadQuery.data?.worktree_dir || projectQuery.data.directory}`
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

            <ReviewSidebar
                git={gitStatusQuery.data ?? null}
                onRefresh={() => void refreshGitSidebar()}
                onCopySummary={() => void copyReviewSummary()}
                onCopyPatch={() => void copyPatchPreview()}
            />
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
            <button
                type="button"
                class="flex w-full cursor-pointer items-center gap-1.5 px-2.5 py-1.5 text-left transition-colors hover:bg-slate-800/30"
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
                <span class="flex-1 text-[11px] font-medium text-slate-300">
                    {props.title}
                </span>
                <Show when={props.trailing}>{props.trailing}</Show>
                <span
                    class={`rounded px-1.5 py-0.5 text-[10px] leading-none ${toneBadgeMap[props.tone]}`}
                >
                    {props.count}
                </span>
            </button>
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
}> = (props) => {
    return (
        <button
            type="button"
            class="flex w-full cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-left transition-colors hover:bg-slate-800/40"
            onClick={() => alert(`Diff for: ${props.path}`)}
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
    git: store.GitReview | null;
    onRefresh: () => void;
    onCopySummary: () => void;
    onCopyPatch: () => void;
}> = (props) => {
    const [commitTab, setCommitTab] = createSignal<"local" | "main">("local");

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

    return (
        <aside class="flex min-h-0 w-80 shrink-0 flex-col border-l border-slate-800/40 bg-app-panel">
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

                {/* Staged */}
                <CollapsibleSection
                    title="Staged"
                    count={staged().length}
                    tone="emerald"
                    defaultOpen
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
        </aside>
    );
};
