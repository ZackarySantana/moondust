import Loader2 from "lucide-solid/icons/loader-2";
import Minus from "lucide-solid/icons/minus";
import Plus from "lucide-solid/icons/plus";
import type { Component } from "solid-js";
import { createMemo, createSignal, For, Show } from "solid-js";
import { CommitRow } from "@/components/review/commit-row";
import {
    BranchCommitGitDialog,
    CommitStagedGitDialog,
    DiscardUnstagedGitDialog,
} from "@/components/review/git-review-dialogs";
import { CollapsibleSection } from "@/components/review/collapsible-section";
import { FileChangeRow } from "@/components/review/file-change-row";
import type { ThreadGitMutations } from "@/hooks/use-thread-git-mutations";
import { cleanBranchName, deriveGitHubURL } from "@/lib/git-display";
import type { store } from "@wails/go/models";

export interface ReviewSidebarProps {
    width: number;
    threadId: string;
    git: store.GitReview | null;
    /** Git mutations from `useThreadGitMutations` in the thread page container. */
    gitMut: ThreadGitMutations;
    onRefresh: () => void;
    onCopySummary: () => void;
    onCopyPatch: () => void;
    onFileClick?: (path: string, status: string) => void;
}

export const ReviewSidebar: Component<ReviewSidebarProps> = (props) => {
    const [commitTab, setCommitTab] = createSignal<"local" | "main">("local");
    const [discardOpen, setDiscardOpen] = createSignal(false);
    const [commitOpen, setCommitOpen] = createSignal(false);
    const [branchCommitOpen, setBranchCommitOpen] = createSignal(false);
    const [commitMsg, setCommitMsg] = createSignal("");
    const [branchNameInput, setBranchNameInput] = createSignal("");
    const [branchCommitMsg, setBranchCommitMsg] = createSignal("");
    const [gitActionError, setGitActionError] = createSignal("");

    const gm = () => props.gitMut;

    const stageMutation = () => gm().stageMutation;
    const discardMutation = () => gm().discardMutation;
    const unstageMutation = () => gm().unstageMutation;
    const commitMutation = () => gm().commitMutation;
    const branchCommitMutation = () => gm().branchCommitMutation;
    const gitBusy = () => gm().gitBusy();

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

    async function runDiscard() {
        setGitActionError("");
        try {
            await discardMutation().mutateAsync();
            setDiscardOpen(false);
        } catch (e) {
            setGitActionError(e instanceof Error ? e.message : String(e));
        }
    }

    async function runCommit() {
        const m = commitMsg().trim();
        if (!m) return;
        setGitActionError("");
        try {
            await commitMutation().mutateAsync(m);
            setCommitOpen(false);
            setCommitMsg("");
        } catch (e) {
            setGitActionError(e instanceof Error ? e.message : String(e));
        }
    }

    async function runBranchCommit() {
        const b = branchNameInput().trim();
        const m = branchCommitMsg().trim();
        if (!b || !m) return;
        setGitActionError("");
        try {
            await branchCommitMutation().mutateAsync({
                branch: b,
                message: m,
            });
            setBranchCommitOpen(false);
            setBranchNameInput("");
            setBranchCommitMsg("");
        } catch (e) {
            setGitActionError(e instanceof Error ? e.message : String(e));
        }
    }

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
                                unstageMutation().isPending ||
                                gitBusy()
                            }
                            onClick={() => unstageMutation().mutate()}
                        >
                            <Show
                                when={unstageMutation().isPending}
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
                                    stageMutation().isPending ||
                                    gitBusy()
                                }
                                onClick={() => stageMutation().mutate()}
                            >
                                <Show
                                    when={stageMutation().isPending}
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
                                    discardMutation().isPending ||
                                    gitBusy()
                                }
                                onClick={() => {
                                    setGitActionError("");
                                    setDiscardOpen(true);
                                }}
                            >
                                <Show
                                    when={discardMutation().isPending}
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

            <DiscardUnstagedGitDialog
                open={discardOpen()}
                pending={discardMutation().isPending}
                error={
                    gitActionError() && discardOpen() ? gitActionError() : ""
                }
                onClose={() => setDiscardOpen(false)}
                onConfirm={() => void runDiscard()}
            />

            <CommitStagedGitDialog
                open={commitOpen()}
                message={commitMsg()}
                pending={commitMutation().isPending}
                error={gitActionError() && commitOpen() ? gitActionError() : ""}
                onMessage={setCommitMsg}
                onClose={() => setCommitOpen(false)}
                onConfirm={() => void runCommit()}
            />

            <BranchCommitGitDialog
                open={branchCommitOpen()}
                branchName={branchNameInput()}
                commitMessage={branchCommitMsg()}
                pending={branchCommitMutation().isPending}
                error={
                    gitActionError() && branchCommitOpen()
                        ? gitActionError()
                        : ""
                }
                onBranchName={setBranchNameInput}
                onCommitMessage={setBranchCommitMsg}
                onClose={() => setBranchCommitOpen(false)}
                onConfirm={() => void runBranchCommit()}
            />
        </aside>
    );
};
