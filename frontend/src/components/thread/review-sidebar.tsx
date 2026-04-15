import ArrowDown from "lucide-solid/icons/arrow-down";
import ArrowUp from "lucide-solid/icons/arrow-up";
import Archive from "lucide-solid/icons/archive";
import ArchiveRestore from "lucide-solid/icons/archive-restore";
import Check from "lucide-solid/icons/check";
import ExternalLink from "lucide-solid/icons/external-link";
import GitBranch from "lucide-solid/icons/git-branch";
import GitPullRequest from "lucide-solid/icons/git-pull-request";
import Loader2 from "lucide-solid/icons/loader-2";
import Minus from "lucide-solid/icons/minus";
import Pencil from "lucide-solid/icons/pencil";
import Plus from "lucide-solid/icons/plus";
import RefreshCw from "lucide-solid/icons/refresh-cw";
import X from "lucide-solid/icons/x";
import type { Component } from "solid-js";
import { createMemo, createSignal, For, Show } from "solid-js";
import { CommitRow } from "@/components/review/commit-row";
import {
    BranchCommitGitDialog,
    CommitStagedGitDialog,
    DiscardFileGitDialog,
    DiscardUnstagedGitDialog,
} from "@/components/review/git-review-dialogs";
import { CollapsibleSection } from "@/components/review/collapsible-section";
import { FileChangeRow } from "@/components/review/file-change-row";
import type { ThreadGitMutations } from "@/hooks/use-thread-git-mutations";
import { cleanBranchName, deriveGitHubURL } from "@/lib/git-display";
import { openExternalURL } from "@/lib/open-external-url";
import type { store } from "@wails/go/models";

export interface ReviewSidebarProps {
    width: number;
    threadId: string;
    /** Thread uses an isolated git worktree — branch & commit is redundant; Commit only. */
    usesDedicatedWorktree?: boolean;
    git: store.GitReview | null;
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

    // Per-file discard confirmation
    const [discardFilePath, setDiscardFilePath] = createSignal<string | null>(
        null,
    );
    const discardFileOpen = () => discardFilePath() !== null;

    // Inline branch rename
    const [editingBranch, setEditingBranch] = createSignal(false);
    const [branchDraft, setBranchDraft] = createSignal("");
    let branchInputRef!: HTMLInputElement;

    const gm = () => props.gitMut;

    const stageMutation = () => gm().stageMutation;
    const discardMutation = () => gm().discardMutation;
    const unstageMutation = () => gm().unstageMutation;
    const commitMutation = () => gm().commitMutation;
    const branchCommitMutation = () => gm().branchCommitMutation;
    const pushMutation = () => gm().pushMutation;
    const pullMutation = () => gm().pullMutation;
    const stageFileMutation = () => gm().stageFileMutation;
    const unstageFileMutation = () => gm().unstageFileMutation;
    const discardFileMutation = () => gm().discardFileMutation;
    const stageUntrackedMutation = () => gm().stageUntrackedMutation;
    const stashMutation = () => gm().stashMutation;
    const stashPopMutation = () => gm().stashPopMutation;
    const renameBranchMutation = () => gm().renameBranchMutation;
    const gitBusy = () => gm().gitBusy();

    const branch = () => cleanBranchName(props.git?.branch ?? "");
    const ahead = () => props.git?.ahead ?? 0;
    const behind = () => props.git?.behind ?? 0;
    const staged = () => props.git?.staged ?? [];
    const unstaged = () => props.git?.unstaged ?? [];
    const untracked = () => props.git?.untracked ?? [];
    const localCommits = () => props.git?.local_commits ?? [];
    const mainCommits = () => props.git?.main_commits ?? [];
    const stashCount = () => props.git?.stash_count ?? 0;
    const hasRemote = () => props.git?.has_remote ?? false;
    const githubURL = createMemo(() => deriveGitHubURL(props.git?.remote_url));
    const DEFAULT_BRANCHES = new Set(["main", "master", "develop"]);
    /** Show "Branch & commit" only when still on a default branch in the project checkout (not worktree, not already branched). */
    const showBranchAndCommit = () => {
        if (props.usesDedicatedWorktree) return false;
        if (!DEFAULT_BRANCHES.has(branch())) return false;
        return true;
    };
    const prURL = createMemo(() => {
        const base = githubURL();
        const b = branch();
        if (!base || !b || DEFAULT_BRANCHES.has(b)) return null;
        return `${base}/compare/${encodeURIComponent(b)}?expand=1`;
    });
    const activeCommits = () =>
        commitTab() === "local" ? localCommits() : mainCommits();

    const iconBtn =
        "flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-35";

    const btnCommitPrimary =
        "inline-flex min-h-8 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-emerald-600/45 bg-emerald-800/40 px-3 py-2 text-[11px] font-medium text-emerald-100 shadow-sm shadow-black/25 transition-all hover:bg-emerald-700/45 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";
    const btnBranchSplit =
        "inline-flex min-h-8 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-600/50 bg-slate-800/50 px-2 py-2 text-[10px] font-medium text-slate-300 transition-colors hover:bg-slate-800/80 disabled:cursor-not-allowed disabled:opacity-40";
    const btnRemote =
        "inline-flex flex-1 min-w-[4.25rem] cursor-pointer items-center justify-center gap-1 rounded-md border border-slate-700/50 bg-slate-900/50 px-2 py-1.5 text-[10px] text-slate-300 transition-colors hover:bg-slate-800/70 disabled:cursor-not-allowed disabled:opacity-40";
    const btnStashMuted =
        "inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-800/50 bg-slate-950/40 px-2 py-1 text-[10px] text-slate-500 transition-colors hover:border-slate-700/60 hover:bg-slate-900/50 hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-40";

    const sectionLabel =
        "text-[10px] font-semibold uppercase tracking-wider text-slate-500";

    // ── Branch rename ──
    function startEditingBranch() {
        setBranchDraft(branch() || "");
        setEditingBranch(true);
        requestAnimationFrame(() => {
            branchInputRef?.focus();
            branchInputRef?.select();
        });
    }

    async function commitBranchRename() {
        const trimmed = branchDraft().trim();
        setEditingBranch(false);
        if (trimmed && trimmed !== branch()) {
            setGitActionError("");
            try {
                await renameBranchMutation().mutateAsync(trimmed);
            } catch (e) {
                setGitActionError(e instanceof Error ? e.message : String(e));
            }
        }
    }

    // ── Discard all ──
    async function runDiscard() {
        setGitActionError("");
        try {
            await discardMutation().mutateAsync();
            setDiscardOpen(false);
        } catch (e) {
            setGitActionError(e instanceof Error ? e.message : String(e));
        }
    }

    // ── Discard single file ──
    async function runDiscardFile() {
        const filePath = discardFilePath();
        if (!filePath) return;
        setGitActionError("");
        try {
            await discardFileMutation().mutateAsync(filePath);
            setDiscardFilePath(null);
        } catch (e) {
            setGitActionError(e instanceof Error ? e.message : String(e));
        }
    }

    // ── Commit ──
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

    // ── Branch + Commit ──
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

    // ── Push / Pull ──
    async function runPush() {
        setGitActionError("");
        try {
            await pushMutation().mutateAsync();
        } catch (e) {
            setGitActionError(e instanceof Error ? e.message : String(e));
        }
    }

    async function runPull() {
        setGitActionError("");
        try {
            await pullMutation().mutateAsync();
        } catch (e) {
            setGitActionError(e instanceof Error ? e.message : String(e));
        }
    }

    // ── Stash ──
    async function runStash() {
        setGitActionError("");
        try {
            await stashMutation().mutateAsync();
        } catch (e) {
            setGitActionError(e instanceof Error ? e.message : String(e));
        }
    }

    async function runStashPop() {
        setGitActionError("");
        try {
            await stashPopMutation().mutateAsync();
        } catch (e) {
            setGitActionError(e instanceof Error ? e.message : String(e));
        }
    }

    return (
        <aside
            class="flex min-h-0 shrink-0 flex-col bg-app-panel"
            style={{ width: `${props.width}px` }}
        >
            {/* ── Header ── */}
            <header class="flex items-center justify-between border-b border-slate-800/40 px-3 py-2">
                <h2 class="text-xs font-semibold text-slate-200">Review</h2>
                <div class="flex items-center gap-0.5">
                    <button
                        type="button"
                        class={iconBtn}
                        onClick={props.onRefresh}
                        title="Refresh"
                    >
                        <RefreshCw
                            class="h-3 w-3"
                            stroke-width={2}
                            aria-hidden
                        />
                    </button>
                </div>
            </header>

            <div class="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2.5 text-xs">
                {/* ── Branch card ── */}
                <div class="rounded-lg border border-slate-800/35 bg-slate-900/40 px-3 py-2.5 shadow-sm shadow-black/15">
                    <div class="flex items-center gap-1.5">
                        <GitBranch
                            class="h-3 w-3 shrink-0 text-slate-500"
                            stroke-width={2}
                            aria-hidden
                        />
                        <Show
                            when={editingBranch()}
                            fallback={
                                <div class="group flex min-w-0 flex-1 items-center gap-1">
                                    <p class="min-w-0 flex-1 truncate font-mono text-[11px] text-slate-200">
                                        {branch() || "unknown"}
                                    </p>
                                    <button
                                        type="button"
                                        class="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-slate-600 opacity-0 transition-all hover:bg-slate-800/60 hover:text-slate-300 group-hover:opacity-100"
                                        title="Rename branch"
                                        onClick={startEditingBranch}
                                    >
                                        <Pencil
                                            class="h-2.5 w-2.5"
                                            stroke-width={2}
                                            aria-hidden
                                        />
                                    </button>
                                </div>
                            }
                        >
                            <div class="flex min-w-0 flex-1 items-center gap-1">
                                <input
                                    ref={branchInputRef!}
                                    type="text"
                                    class="min-w-0 flex-1 rounded border border-slate-700/50 bg-slate-950/50 px-1.5 py-0.5 font-mono text-[11px] text-slate-200 focus:border-emerald-700/50 focus:outline-none"
                                    value={branchDraft()}
                                    onInput={(e) =>
                                        setBranchDraft(e.currentTarget.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                            void commitBranchRename();
                                        if (e.key === "Escape")
                                            setEditingBranch(false);
                                    }}
                                />
                                <button
                                    type="button"
                                    class="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-emerald-400 transition-colors hover:bg-emerald-900/30"
                                    onClick={() => void commitBranchRename()}
                                    title="Confirm rename"
                                >
                                    <Check
                                        class="h-3 w-3"
                                        stroke-width={2.5}
                                        aria-hidden
                                    />
                                </button>
                                <button
                                    type="button"
                                    class="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-300"
                                    onClick={() => setEditingBranch(false)}
                                    title="Cancel"
                                >
                                    <X
                                        class="h-3 w-3"
                                        stroke-width={2}
                                        aria-hidden
                                    />
                                </button>
                            </div>
                        </Show>
                    </div>
                    <div class="mt-1.5 flex flex-wrap gap-1.5">
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
                        <Show when={stashCount() > 0}>
                            <span class="rounded-full bg-sky-900/30 px-2 py-0.5 text-[10px] text-sky-300">
                                {stashCount()} stash{stashCount() > 1 ? "es" : ""}
                            </span>
                        </Show>
                    </div>
                </div>

                {/* ── Ship: commit → push (visual hierarchy) ── */}
                <div class="space-y-2.5">
                    <div class="rounded-lg border border-slate-800/55 bg-app-surface/90 p-2.5 shadow-sm shadow-black/20 ring-1 ring-white/[0.03]">
                        <p class={`mb-2 ${sectionLabel}`}>Commit</p>
                        <div class="flex gap-1.5">
                            <button
                                type="button"
                                class={btnCommitPrimary}
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
                                <Check
                                    class="h-3.5 w-3.5 shrink-0"
                                    stroke-width={2}
                                    aria-hidden
                                />
                                Commit
                            </button>
                            <Show when={showBranchAndCommit()}>
                                <button
                                    type="button"
                                    class={btnBranchSplit}
                                    title="Create a new branch and commit (e.g. from main)"
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
                                    <GitBranch
                                        class="h-3 w-3"
                                        stroke-width={2}
                                        aria-hidden
                                    />
                                    <span class="max-w-[7rem] truncate">
                                        Branch…
                                    </span>
                                </button>
                            </Show>
                        </div>

                        <Show
                            when={hasRemote() || prURL()}
                        >
                            <div class="mt-3 border-t border-slate-800/45 pt-2.5">
                                <p class={`mb-2 ${sectionLabel}`}>
                                    Remote
                                </p>
                                <div class="flex flex-wrap gap-1.5">
                                    <Show when={hasRemote()}>
                                        <button
                                            type="button"
                                            class={btnRemote}
                                            disabled={
                                                gitBusy() || !props.threadId
                                            }
                                            onClick={() => void runPush()}
                                        >
                                            <Show
                                                when={
                                                    pushMutation().isPending
                                                }
                                                fallback={
                                                    <ArrowUp
                                                        class="h-3 w-3"
                                                        stroke-width={2}
                                                        aria-hidden
                                                    />
                                                }
                                            >
                                                <Loader2
                                                    class="h-3 w-3 animate-spin"
                                                    stroke-width={2}
                                                    aria-hidden
                                                />
                                            </Show>
                                            Push
                                        </button>
                                        <button
                                            type="button"
                                            class={btnRemote}
                                            disabled={
                                                gitBusy() || !props.threadId
                                            }
                                            onClick={() => void runPull()}
                                        >
                                            <Show
                                                when={
                                                    pullMutation().isPending
                                                }
                                                fallback={
                                                    <ArrowDown
                                                        class="h-3 w-3"
                                                        stroke-width={2}
                                                        aria-hidden
                                                    />
                                                }
                                            >
                                                <Loader2
                                                    class="h-3 w-3 animate-spin"
                                                    stroke-width={2}
                                                    aria-hidden
                                                />
                                            </Show>
                                            Pull
                                        </button>
                                    </Show>
                                    <Show when={prURL()}>
                                        {(url) => (
                                            <button
                                                type="button"
                                                class="inline-flex flex-1 min-w-[4.25rem] cursor-pointer items-center justify-center gap-1 rounded-md border border-emerald-700/40 bg-emerald-950/40 px-2 py-1.5 text-[10px] font-medium text-emerald-200 transition-colors hover:bg-emerald-900/35"
                                                onClick={() =>
                                                    openExternalURL(url())
                                                }
                                                title="Open or create pull request on GitHub"
                                            >
                                                <GitPullRequest
                                                    class="h-3 w-3"
                                                    stroke-width={2}
                                                    aria-hidden
                                                />
                                                PR
                                                <ExternalLink
                                                    class="h-2.5 w-2.5 text-emerald-400/70"
                                                    stroke-width={2}
                                                    aria-hidden
                                                />
                                            </button>
                                        )}
                                    </Show>
                                </div>
                            </div>
                        </Show>
                    </div>

                    <div class="flex flex-wrap items-center justify-end gap-1.5 rounded-md border border-slate-800/40 bg-slate-950/25 px-2 py-1.5">
                        <button
                            type="button"
                            class={btnStashMuted}
                            disabled={
                                (staged().length === 0 &&
                                    unstaged().length === 0) ||
                                gitBusy() ||
                                !props.threadId
                            }
                            onClick={() => void runStash()}
                        >
                            <Show
                                when={stashMutation().isPending}
                                fallback={
                                    <Archive
                                        class="h-3 w-3"
                                        stroke-width={2}
                                        aria-hidden
                                    />
                                }
                            >
                                <Loader2
                                    class="h-3 w-3 animate-spin"
                                    stroke-width={2}
                                    aria-hidden
                                />
                            </Show>
                            Stash
                        </button>
                        <Show when={stashCount() > 0}>
                            <button
                                type="button"
                                class={btnStashMuted}
                                disabled={gitBusy() || !props.threadId}
                                onClick={() => void runStashPop()}
                            >
                                <Show
                                    when={stashPopMutation().isPending}
                                    fallback={
                                        <ArchiveRestore
                                            class="h-3 w-3"
                                            stroke-width={2}
                                            aria-hidden
                                        />
                                    }
                                >
                                    <Loader2
                                        class="h-3 w-3 animate-spin"
                                        stroke-width={2}
                                        aria-hidden
                                    />
                                </Show>
                                Pop
                            </button>
                        </Show>
                    </div>
                </div>

                {/* ── Error display ── */}
                <Show
                    when={
                        gitActionError() &&
                        !discardOpen() &&
                        !commitOpen() &&
                        !branchCommitOpen() &&
                        !discardFileOpen()
                    }
                >
                    <p class="rounded border border-red-900/30 bg-red-950/15 px-2.5 py-1.5 text-[10px] leading-snug text-red-400">
                        {gitActionError()}
                    </p>
                </Show>

                <p class={`mb-1 px-0.5 ${sectionLabel}`}>
                    Files
                </p>
                {/* ── Staged ── */}
                <CollapsibleSection
                    title="Staged"
                    count={staged().length}
                    tone="emerald"
                    defaultOpen
                    trailing={
                        <button
                            type="button"
                            class={iconBtn}
                            title="Unstage all"
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
                        <div class="space-y-px">
                            <For each={staged()}>
                                {(f) => (
                                    <FileChangeRow
                                        path={f.path}
                                        status={f.status}
                                        context="staged"
                                        disabled={gitBusy()}
                                        pendingPath={
                                            unstageFileMutation().isPending
                                                ? (unstageFileMutation()
                                                      .variables as
                                                      | string
                                                      | undefined) ?? null
                                                : null
                                        }
                                        onClick={props.onFileClick}
                                        onUnstage={(p) =>
                                            unstageFileMutation().mutate(p)
                                        }
                                    />
                                )}
                            </For>
                        </div>
                    </Show>
                </CollapsibleSection>

                {/* ── Unstaged ── */}
                <CollapsibleSection
                    title="Unstaged"
                    count={unstaged().length}
                    tone="amber"
                    defaultOpen
                    trailing={
                        <div class="flex items-center gap-0.5">
                            <button
                                type="button"
                                class={iconBtn}
                                title="Stage all"
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
                                class={iconBtn}
                                title="Discard all unstaged"
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
                        <div class="space-y-px">
                            <For each={unstaged()}>
                                {(f) => (
                                    <FileChangeRow
                                        path={f.path}
                                        status={f.status}
                                        context="unstaged"
                                        disabled={gitBusy()}
                                        pendingPath={
                                            stageFileMutation().isPending
                                                ? (stageFileMutation()
                                                      .variables as
                                                      | string
                                                      | undefined) ?? null
                                                : discardFileMutation()
                                                        .isPending
                                                  ? (discardFileMutation()
                                                        .variables as
                                                        | string
                                                        | undefined) ?? null
                                                  : null
                                        }
                                        onClick={props.onFileClick}
                                        onStage={(p) =>
                                            stageFileMutation().mutate(p)
                                        }
                                        onDiscard={(p) => {
                                            setGitActionError("");
                                            setDiscardFilePath(p);
                                        }}
                                    />
                                )}
                            </For>
                        </div>
                    </Show>
                </CollapsibleSection>

                {/* ── Untracked ── */}
                <CollapsibleSection
                    title="Untracked"
                    count={untracked().length}
                    tone="sky"
                    defaultOpen
                    trailing={
                        <Show when={untracked().length > 0}>
                            <button
                                type="button"
                                class={iconBtn}
                                title="Stage all untracked"
                                disabled={
                                    stageUntrackedMutation().isPending ||
                                    gitBusy()
                                }
                                onClick={() =>
                                    stageUntrackedMutation().mutate()
                                }
                            >
                                <Show
                                    when={stageUntrackedMutation().isPending}
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
                        </Show>
                    }
                >
                    <Show
                        when={untracked().length > 0}
                        fallback={
                            <p class="py-1 text-[11px] text-slate-600">
                                No untracked files
                            </p>
                        }
                    >
                        <div class="space-y-px">
                            <For each={untracked()}>
                                {(f) => (
                                    <FileChangeRow
                                        path={f.path}
                                        status={f.status}
                                        context="untracked"
                                        disabled={gitBusy()}
                                        pendingPath={
                                            stageFileMutation().isPending
                                                ? (stageFileMutation()
                                                      .variables as
                                                      | string
                                                      | undefined) ?? null
                                                : null
                                        }
                                        onClick={props.onFileClick}
                                        onStage={(p) =>
                                            stageFileMutation().mutate(p)
                                        }
                                    />
                                )}
                            </For>
                        </div>
                    </Show>
                </CollapsibleSection>

                {/* ── Commits ── */}
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

                {/* ── Diff ── */}
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

            {/* ── Dialogs ── */}

            <DiscardUnstagedGitDialog
                open={discardOpen()}
                pending={discardMutation().isPending}
                error={
                    gitActionError() && discardOpen() ? gitActionError() : ""
                }
                onClose={() => setDiscardOpen(false)}
                onConfirm={() => void runDiscard()}
            />

            <DiscardFileGitDialog
                open={discardFileOpen()}
                filePath={discardFilePath() ?? ""}
                pending={discardFileMutation().isPending}
                error={
                    gitActionError() && discardFileOpen()
                        ? gitActionError()
                        : ""
                }
                onClose={() => setDiscardFilePath(null)}
                onConfirm={() => void runDiscardFile()}
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
