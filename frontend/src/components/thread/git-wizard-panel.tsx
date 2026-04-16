import Check from "lucide-solid/icons/check";
import GitBranch from "lucide-solid/icons/git-branch";
import GitMerge from "lucide-solid/icons/git-merge";
import Loader2 from "lucide-solid/icons/loader-2";
import X from "lucide-solid/icons/x";
import type { Component } from "solid-js";
import { createSignal, For, onCleanup, Show } from "solid-js";
import {
    GitFetch,
    GitListBranches,
    GitMerge as GitMergeRPC,
    GitRebaseOnto,
    GitConflictState,
    ResolveGitConflictsWithUtilityAgent,
} from "@wails/go/app/App";
import { EventsOn, EventsOff } from "@wails/runtime/runtime";

type WizardGoal = "rebase" | "merge" | null;

export const GitWizardPanel: Component<{
    threadId: string;
    onRefresh: () => void;
}> = (props) => {
    const [goal, setGoal] = createSignal<WizardGoal>(null);
    const [targetBranch, setTargetBranch] = createSignal("main");
    const [branches, setBranches] = createSignal<string[]>([]);
    const [loadingBranches, setLoadingBranches] = createSignal(false);
    const [running, setRunning] = createSignal(false);
    const [status, setStatus] = createSignal("");
    const [error, setError] = createSignal("");
    const [done, setDone] = createSignal(false);

    const statusEventKey = "gitwizard:status";
    EventsOn(statusEventKey, (data: { thread_id: string; status: string }) => {
        if (data.thread_id === props.threadId) {
            setStatus(data.status);
        }
    });
    onCleanup(() => EventsOff(statusEventKey));

    async function loadBranches() {
        setLoadingBranches(true);
        try {
            const b = await GitListBranches(props.threadId);
            setBranches(b || []);
        } catch {
            setBranches([]);
        } finally {
            setLoadingBranches(false);
        }
    }

    function selectGoal(g: WizardGoal) {
        setGoal(g);
        setDone(false);
        setError("");
        setStatus("");
        if (g) void loadBranches();
    }

    function reset() {
        selectGoal(null);
    }

    async function run() {
        const g = goal();
        if (!g) return;
        const branch = targetBranch().trim() || "main";
        setRunning(true);
        setError("");
        setDone(false);

        try {
            setStatus("Fetching remote…");
            await GitFetch(props.threadId);

            if (g === "rebase") {
                setStatus("Rebasing onto origin/" + branch + "…");
            } else {
                setStatus("Merging origin/" + branch + "…");
            }

            try {
                if (g === "rebase") {
                    await GitRebaseOnto(props.threadId, "origin/" + branch);
                } else {
                    await GitMergeRPC(props.threadId, "origin/" + branch);
                }
            } catch {
                const state = await GitConflictState(props.threadId).catch(
                    () => null,
                );
                if (state && (state.in_merge || state.in_rebase)) {
                    const n = state.conflict_files?.length ?? 0;
                    setStatus(
                        `Resolving ${n} conflict${n !== 1 ? "s" : ""} with utility model…`,
                    );
                    await ResolveGitConflictsWithUtilityAgent(props.threadId);
                } else {
                    throw new Error(
                        g === "rebase"
                            ? "Rebase failed"
                            : "Merge failed",
                    );
                }
            }

            setStatus("");
            setDone(true);
        } catch (e) {
            setStatus("");
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setRunning(false);
            props.onRefresh();
        }
    }

    return (
        <div class="space-y-2">
            <Show
                when={goal()}
                fallback={
                    <div class="space-y-1.5">
                        <p class="text-[10px] text-slate-500">
                            What do you want to do?
                        </p>
                        <button
                            type="button"
                            onClick={() => selectGoal("rebase")}
                            class="flex w-full items-center gap-2 rounded-lg border border-slate-800/40 bg-slate-900/30 px-3 py-2 text-left text-xs text-slate-300 transition-colors hover:border-slate-700/50 hover:bg-slate-800/40"
                        >
                            <GitBranch
                                class="size-4 shrink-0 text-emerald-500/70"
                                stroke-width={1.75}
                            />
                            <div>
                                <span class="font-medium">Rebase on branch</span>
                                <span class="block text-[10px] text-slate-500">
                                    Replay your commits on top of the target
                                </span>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => selectGoal("merge")}
                            class="flex w-full items-center gap-2 rounded-lg border border-slate-800/40 bg-slate-900/30 px-3 py-2 text-left text-xs text-slate-300 transition-colors hover:border-slate-700/50 hover:bg-slate-800/40"
                        >
                            <GitMerge
                                class="size-4 shrink-0 text-blue-400/70"
                                stroke-width={1.75}
                            />
                            <div>
                                <span class="font-medium">Merge branch</span>
                                <span class="block text-[10px] text-slate-500">
                                    Merge the target branch into yours
                                </span>
                            </div>
                        </button>
                    </div>
                }
            >
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-medium text-slate-300">
                            {goal() === "rebase" ? "Rebase" : "Merge"} onto
                        </span>
                        <button
                            type="button"
                            onClick={reset}
                            disabled={running()}
                            class="text-[10px] text-slate-500 hover:text-slate-300 disabled:opacity-40"
                        >
                            Cancel
                        </button>
                    </div>

                    <Show
                        when={!loadingBranches()}
                        fallback={
                            <div class="flex items-center gap-1.5 text-[10px] text-slate-500">
                                <Loader2
                                    class="size-3 animate-spin"
                                    stroke-width={2}
                                />
                                Loading branches…
                            </div>
                        }
                    >
                        <select
                            class="w-full rounded-md border border-slate-800/60 bg-slate-950/50 px-2 py-1.5 font-mono text-xs text-slate-200 outline-none focus:border-slate-600"
                            value={targetBranch()}
                            disabled={running()}
                            onChange={(e) =>
                                setTargetBranch(e.currentTarget.value)
                            }
                        >
                            <For each={branches()}>
                                {(b) => <option value={b}>{b}</option>}
                            </For>
                            <Show when={!branches().includes("main")}>
                                <option value="main">main</option>
                            </Show>
                        </select>
                    </Show>

                    {/* Status line */}
                    <Show when={running() && status()}>
                        <div class="flex items-center gap-2 py-1 text-[11px] text-slate-400">
                            <Loader2
                                class="size-3 shrink-0 animate-spin text-emerald-500/60"
                                stroke-width={2}
                            />
                            {status()}
                        </div>
                    </Show>

                    {/* Error */}
                    <Show when={error()}>
                        <div class="rounded-lg border border-red-900/30 bg-red-950/15 px-2.5 py-2 text-[10px] leading-snug text-red-400">
                            <div class="mb-1 flex items-center gap-1.5">
                                <X
                                    class="size-3 shrink-0"
                                    stroke-width={2.5}
                                />
                                <span class="font-medium">Failed</span>
                            </div>
                            {error()}
                        </div>
                    </Show>

                    {/* Done */}
                    <Show when={done()}>
                        <div class="flex items-center gap-2 rounded-lg border border-emerald-800/30 bg-emerald-950/15 px-3 py-2 text-xs text-emerald-300">
                            <Check
                                class="size-4 shrink-0 text-emerald-400"
                                stroke-width={2.5}
                            />
                            {goal() === "rebase" ? "Rebase" : "Merge"}{" "}
                            complete
                        </div>
                    </Show>

                    {/* Run / Done button */}
                    <Show when={!done()}>
                        <button
                            type="button"
                            disabled={running() || !targetBranch().trim()}
                            onClick={() => void run()}
                            class="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-600/45 bg-emerald-800/40 px-3 py-2 text-xs font-medium text-emerald-100 transition-colors hover:bg-emerald-700/45 disabled:opacity-40"
                        >
                            <Show
                                when={!running()}
                                fallback={
                                    <Loader2
                                        class="size-3.5 animate-spin"
                                        stroke-width={2}
                                    />
                                }
                            >
                                <GitBranch
                                    class="size-3.5"
                                    stroke-width={2}
                                />
                            </Show>
                            {running()
                                ? "Working…"
                                : goal() === "rebase"
                                  ? "Rebase"
                                  : "Merge"}
                        </button>
                    </Show>
                    <Show when={done()}>
                        <button
                            type="button"
                            onClick={reset}
                            class="w-full text-center text-[10px] text-slate-500 hover:text-slate-300"
                        >
                            Done
                        </button>
                    </Show>
                </div>
            </Show>
        </div>
    );
};
