import type { Component } from "solid-js";
import { createSignal, For, onCleanup, Show } from "solid-js";

export interface CommitSummary {
    hash: string;
    subject: string;
    author: string;
    when: string;
    exact_date?: string;
}

export interface CommitGraphProps {
    localCommits: readonly CommitSummary[];
    mainCommits: readonly CommitSummary[];
    baseBranch: string;
    branchName: string;
    githubURL: string | null;
    /** Optional override; defaults to `navigator.clipboard.writeText`. */
    onCopyHash?: (hash: string) => void | Promise<void>;
    /** Override how external URLs (e.g. GitHub) are opened. */
    onOpenExternal?: (url: string) => void;
}

const ROW_HEIGHT = 28;
const NODE_X = 12;
const NODE_R = 4;
const DIAMOND_SIZE = 5;
const FORK_ROW_HEIGHT = 20;

export const CommitGraph: Component<CommitGraphProps> = (props) => {
    const [hovered, setHovered] = createSignal<CommitSummary | null>(null);
    const [tooltipPos, setTooltipPos] = createSignal({ x: 0, y: 0 });

    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    function scheduleHide() {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => setHovered(null), 400);
    }

    function cancelHide() {
        clearTimeout(hideTimer);
    }

    onCleanup(() => clearTimeout(hideTimer));

    const totalLocalRows = () => props.localCommits.length;
    const totalMainRows = () => props.mainCommits.length;
    const hasFork = () => totalLocalRows() > 0 || totalMainRows() > 0;
    const svgHeight = () => {
        let h = totalLocalRows() * ROW_HEIGHT;
        if (hasFork()) h += FORK_ROW_HEIGHT;
        h += totalMainRows() * ROW_HEIGHT;
        return Math.max(h, 8);
    };

    function localNodeY(i: number) {
        return i * ROW_HEIGHT + ROW_HEIGHT / 2;
    }

    function forkY() {
        return totalLocalRows() * ROW_HEIGHT + FORK_ROW_HEIGHT / 2;
    }

    function mainNodeY(i: number) {
        return (
            totalLocalRows() * ROW_HEIGHT +
            FORK_ROW_HEIGHT +
            i * ROW_HEIGHT +
            ROW_HEIGHT / 2
        );
    }

    const baseBranchLabel = () => {
        const b = props.baseBranch;
        if (b.startsWith("origin/")) return b.slice(7);
        return b;
    };

    function handleMouseEnter(
        commit: CommitSummary,
        e: MouseEvent & { currentTarget: HTMLDivElement },
    ) {
        cancelHide();
        const rect = e.currentTarget.getBoundingClientRect();
        const parent = e.currentTarget.closest(".commit-graph-root");
        const parentRect = parent?.getBoundingClientRect();
        setTooltipPos({
            x: rect.left - (parentRect?.left ?? 0),
            y: rect.bottom - (parentRect?.top ?? 0) + 4,
        });
        setHovered(commit);
    }

    async function copyHash(hash: string) {
        if (props.onCopyHash) {
            await props.onCopyHash(hash);
            return;
        }
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            await navigator.clipboard.writeText(hash);
        }
    }

    function openOnGitHub(hash: string) {
        if (!props.githubURL) return;
        const url = `${props.githubURL}/commit/${hash}`;
        if (props.onOpenExternal) {
            props.onOpenExternal(url);
        } else if (typeof window !== "undefined") {
            window.open(url, "_blank", "noopener,noreferrer");
        }
    }

    const noCommits = () =>
        props.localCommits.length === 0 && props.mainCommits.length === 0;

    return (
        <div
            class="commit-graph-root relative select-none"
            onMouseLeave={scheduleHide}
        >
            <Show when={noCommits()}>
                <p class="py-1 text-[11px] text-slate-600">No commits</p>
            </Show>

            <Show when={!noCommits()}>
                <div class="relative">
                    <svg
                        class="absolute left-0 top-0"
                        width={NODE_X * 2}
                        height={svgHeight()}
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <Show when={totalLocalRows() > 0}>
                            <line
                                x1={NODE_X}
                                y1={localNodeY(0)}
                                x2={NODE_X}
                                y2={
                                    hasFork()
                                        ? forkY()
                                        : localNodeY(totalLocalRows() - 1)
                                }
                                class="stroke-violet-600 opacity-50 [stroke-width:1.5]"
                            />
                            <For each={[...props.localCommits]}>
                                {(_, i) => (
                                    <circle
                                        cx={NODE_X}
                                        cy={localNodeY(i())}
                                        r={NODE_R}
                                        class="fill-violet-600"
                                    />
                                )}
                            </For>
                        </Show>

                        <Show when={hasFork()}>
                            <polygon
                                points={`${NODE_X},${forkY() - DIAMOND_SIZE} ${NODE_X + DIAMOND_SIZE},${forkY()} ${NODE_X},${forkY() + DIAMOND_SIZE} ${NODE_X - DIAMOND_SIZE},${forkY()}`}
                                class="fill-slate-600 stroke-slate-500 [stroke-width:0.5]"
                            />
                        </Show>

                        <Show when={totalMainRows() > 0}>
                            <line
                                x1={NODE_X}
                                y1={hasFork() ? forkY() : mainNodeY(0)}
                                x2={NODE_X}
                                y2={mainNodeY(totalMainRows() - 1)}
                                class="stroke-slate-600 opacity-40 [stroke-width:1.5]"
                            />
                            <For each={[...props.mainCommits]}>
                                {(_, i) => (
                                    <circle
                                        cx={NODE_X}
                                        cy={mainNodeY(i())}
                                        r={NODE_R}
                                        class="fill-slate-600"
                                    />
                                )}
                            </For>
                        </Show>
                    </svg>

                    <div style={{ "padding-left": `${NODE_X * 2 + 6}px` }}>
                        <For each={[...props.localCommits]}>
                            {(commit) => (
                                <div
                                    class="flex items-center gap-1.5 truncate"
                                    style={{ height: `${ROW_HEIGHT}px` }}
                                    onMouseEnter={(e) =>
                                        handleMouseEnter(commit, e)
                                    }
                                    onMouseLeave={scheduleHide}
                                >
                                    <span class="shrink-0 font-mono text-[10px] text-violet-400">
                                        {commit.hash}
                                    </span>
                                    <span class="min-w-0 flex-1 truncate text-[11px] text-slate-200">
                                        {commit.subject}
                                    </span>
                                    <span class="shrink-0 text-[10px] text-slate-600">
                                        {commit.when}
                                    </span>
                                </div>
                            )}
                        </For>

                        <Show when={hasFork()}>
                            <div
                                class="flex items-center gap-1"
                                style={{ height: `${FORK_ROW_HEIGHT}px` }}
                            >
                                <span class="h-px flex-1 bg-slate-700/50" />
                                <span class="text-[9px] text-slate-500">
                                    {baseBranchLabel()}
                                </span>
                                <span class="h-px flex-1 bg-slate-700/50" />
                            </div>
                        </Show>

                        <For each={[...props.mainCommits]}>
                            {(commit) => (
                                <div
                                    class="flex items-center gap-1.5 truncate"
                                    style={{ height: `${ROW_HEIGHT}px` }}
                                    onMouseEnter={(e) =>
                                        handleMouseEnter(commit, e)
                                    }
                                    onMouseLeave={scheduleHide}
                                >
                                    <span class="shrink-0 font-mono text-[10px] text-slate-500">
                                        {commit.hash}
                                    </span>
                                    <span class="min-w-0 flex-1 truncate text-[11px] text-slate-400">
                                        {commit.subject}
                                    </span>
                                    <span class="shrink-0 text-[10px] text-slate-600">
                                        {commit.when}
                                    </span>
                                </div>
                            )}
                        </For>
                    </div>
                </div>
            </Show>

            <Show when={hovered()}>
                {(commit) => (
                    <div
                        class="absolute z-50 w-56 rounded-lg border border-slate-700/60 bg-slate-900 px-3 py-2 shadow-lg shadow-black/40"
                        style={{
                            left: `${tooltipPos().x}px`,
                            top: `${tooltipPos().y}px`,
                        }}
                        onMouseEnter={cancelHide}
                        onMouseLeave={scheduleHide}
                    >
                        <div class="space-y-1 text-[11px]">
                            <div class="flex items-center justify-between gap-2">
                                <button
                                    type="button"
                                    class="cursor-pointer font-mono text-violet-400 hover:text-violet-300"
                                    onClick={() =>
                                        void copyHash(commit().hash)
                                    }
                                    title="Click to copy"
                                >
                                    {commit().hash}
                                </button>
                                <Show when={props.githubURL}>
                                    <button
                                        type="button"
                                        class="cursor-pointer text-[10px] text-sky-400 hover:text-sky-300"
                                        onClick={() =>
                                            openOnGitHub(commit().hash)
                                        }
                                    >
                                        GitHub
                                    </button>
                                </Show>
                            </div>
                            <p class="text-slate-200">{commit().subject}</p>
                            <p class="text-slate-500">{commit().author}</p>
                            <p class="text-slate-600">
                                {commit().exact_date || commit().when}
                            </p>
                        </div>
                    </div>
                )}
            </Show>
        </div>
    );
};
