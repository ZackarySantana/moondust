import AlertTriangle from "lucide-solid/icons/alert-triangle";
import Check from "lucide-solid/icons/check";
import ChevronRight from "lucide-solid/icons/chevron-right";
import GitBranch from "lucide-solid/icons/git-branch";
import GitMerge from "lucide-solid/icons/git-merge";
import Loader2 from "lucide-solid/icons/loader-2";
import RefreshCw from "lucide-solid/icons/refresh-cw";
import X from "lucide-solid/icons/x";
import type { Component } from "solid-js";
import { createSignal, For, onCleanup, Show } from "solid-js";
import { EventsOn } from "@wails/runtime/runtime";
import {
    GitConflictState,
    GitFetch,
    GitListBranches,
    GitMerge as GitMergeRPC,
    GitRebaseAbort,
    GitRebaseOnto,
    ResolveGitConflictsWithUtilityAgent,
    StreamResolveGitConflictsWithUtilityAgent,
} from "@wails/go/app/App";

type WizardGoal = "rebase" | "merge" | null;
type StepStatus = "pending" | "running" | "done" | "error" | "conflict";
type StreamPhase = "idle" | "streaming" | "done" | "error";

interface WizardStep {
    id: string;
    label: string;
    status: StepStatus;
    output?: string;
}

export const GitWizardPanel: Component<{
    threadId: string;
    onRefresh: () => void;
}> = (props) => {
    const [goal, setGoal] = createSignal<WizardGoal>(null);
    const [targetBranch, setTargetBranch] = createSignal("main");
    const [branches, setBranches] = createSignal<string[]>([]);
    const [loadingBranches, setLoadingBranches] = createSignal(false);
    const [steps, setSteps] = createSignal<WizardStep[]>([]);
    const [, setCurrentStep] = createSignal(-1);
    const [running, setRunning] = createSignal(false);
    const [conflictFiles, setConflictFiles] = createSignal<string[]>([]);
    const [inConflict, setInConflict] = createSignal(false);
    const [wizardDone, setWizardDone] = createSignal(false);
    const [streamLog, setStreamLog] = createSignal("");
    const [streamPhase, setStreamPhase] = createSignal<StreamPhase>("idle");

    let streamUnsubs: (() => void)[] = [];

    onCleanup(() => {
        streamUnsubs.forEach((u) => u());
        streamUnsubs = [];
    });

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

    function clearStream() {
        setStreamLog("");
        setStreamPhase("idle");
    }

    function selectGoal(g: WizardGoal) {
        setGoal(g);
        setWizardDone(false);
        setInConflict(false);
        setConflictFiles([]);
        clearStream();
        if (g) void loadBranches();

        if (g === "rebase") {
            setSteps([
                { id: "fetch", label: "Fetch latest from remote", status: "pending" },
                { id: "rebase", label: "Rebase onto target branch", status: "pending" },
            ]);
        } else if (g === "merge") {
            setSteps([
                { id: "fetch", label: "Fetch latest from remote", status: "pending" },
                { id: "merge", label: "Merge target branch", status: "pending" },
            ]);
        }
        setCurrentStep(-1);
    }

    function updateStep(idx: number, update: Partial<WizardStep>) {
        setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, ...update } : s)));
    }

    function startStreamResolve(lastStepIdx: number): Promise<void> {
        streamUnsubs.forEach((u) => u());
        streamUnsubs = [];
        setStreamLog("");
        setStreamPhase("streaming");

        return new Promise((resolve) => {
            const tid = props.threadId;
            const cleanup = () => {
                streamUnsubs.forEach((u) => u());
                streamUnsubs = [];
                resolve();
            };

            streamUnsubs.push(
                EventsOn("gitwizard:stream_start", (...args: unknown[]) => {
                    const p = args[0] as { thread_id?: string };
                    if (p?.thread_id !== tid) return;
                    setStreamLog("");
                }),
            );
            streamUnsubs.push(
                EventsOn("gitwizard:stream", (...args: unknown[]) => {
                    const p = args[0] as { thread_id?: string; delta?: string };
                    if (p?.thread_id !== tid || !p.delta) return;
                    setStreamLog((s) => s + p.delta);
                }),
            );
            streamUnsubs.push(
                EventsOn("gitwizard:stream_done", (...args: unknown[]) => {
                    const p = args[0] as { thread_id?: string; output?: string };
                    if (p?.thread_id !== tid) return;
                    setStreamPhase("done");
                    setStreamLog((s) => {
                        const full =
                            s + (p.output ? "\n\n---\n" + p.output : "");
                        updateStep(lastStepIdx, { status: "done", output: full });
                        return full;
                    });
                    setInConflict(false);
                    setConflictFiles([]);
                    setWizardDone(true);
                    setRunning(false);
                    cleanup();
                    props.onRefresh();
                }),
            );
            streamUnsubs.push(
                EventsOn("gitwizard:stream_error", (...args: unknown[]) => {
                    const p = args[0] as { thread_id?: string; error?: string };
                    if (p?.thread_id !== tid) return;
                    setStreamPhase("error");
                    setStreamLog((s) => s + "\n\n" + (p.error ?? ""));
                    setInConflict(true);
                    void GitConflictState(tid).then((st) => {
                        if (st && (st.in_merge || st.in_rebase)) {
                            setConflictFiles(st.conflict_files || []);
                        }
                    });
                    updateStep(lastStepIdx, {
                        status: "conflict",
                        output: p.error ?? "",
                    });
                    setRunning(false);
                    cleanup();
                    props.onRefresh();
                }),
            );

            void StreamResolveGitConflictsWithUtilityAgent(tid);
        });
    }

    async function runAllSteps() {
        setRunning(true);
        clearStream();
        for (let i = 0; i < steps().length; i++) {
            setCurrentStep(i);
            updateStep(i, { status: "running" });
            try {
                let output = "";
                const stepId = steps()[i].id;
                const branch = targetBranch().trim() || "main";

                if (stepId === "fetch") {
                    await GitFetch(props.threadId);
                    output = "Fetch complete";
                } else if (stepId === "rebase") {
                    output = await GitRebaseOnto(props.threadId, "origin/" + branch);
                } else if (stepId === "merge") {
                    output = await GitMergeRPC(props.threadId, "origin/" + branch);
                }

                updateStep(i, { status: "done", output });
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                updateStep(i, { status: "error", output: msg });

                const state = await GitConflictState(props.threadId).catch(
                    () => null,
                );
                if (state && (state.in_merge || state.in_rebase)) {
                    setConflictFiles(state.conflict_files || []);
                    updateStep(i, { status: "conflict", output: msg });
                    await startStreamResolve(i);
                    return;
                }
                setRunning(false);
                return;
            }
        }
        setRunning(false);
        setWizardDone(true);
        props.onRefresh();
    }

    async function handleAbort() {
        setRunning(true);
        try {
            await GitRebaseAbort(props.threadId);
            setInConflict(false);
            setConflictFiles([]);
            clearStream();
            selectGoal(null);
        } catch {
            // ignore
        } finally {
            setRunning(false);
            props.onRefresh();
        }
    }

    async function handleRetry() {
        setRunning(true);
        try {
            const output = await ResolveGitConflictsWithUtilityAgent(
                props.threadId,
            );
            const lastIdx = steps().length - 1;
            updateStep(lastIdx, { status: "done", output });
            setInConflict(false);
            setConflictFiles([]);
            setWizardDone(true);
            clearStream();
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            const state = await GitConflictState(props.threadId).catch(() => null);
            if (state && (state.in_merge || state.in_rebase)) {
                setInConflict(true);
                setConflictFiles(state.conflict_files || []);
            } else {
                setInConflict(false);
            }
            const lastIdx = steps().length - 1;
            updateStep(lastIdx, { status: "conflict", output: msg });
        } finally {
            setRunning(false);
            props.onRefresh();
        }
    }

    function reset() {
        selectGoal(null);
        setSteps([]);
        setCurrentStep(-1);
    }

    const stepIcon = (status: StepStatus) => {
        switch (status) {
            case "running":
                return (
                    <Loader2
                        class="size-3.5 animate-spin text-emerald-500/70"
                        stroke-width={2}
                    />
                );
            case "done":
                return (
                    <Check
                        class="size-3.5 text-emerald-400"
                        stroke-width={2.5}
                    />
                );
            case "error":
                return <X class="size-3.5 text-red-400" stroke-width={2.5} />;
            case "conflict":
                return (
                    <AlertTriangle
                        class="size-3.5 text-amber-400"
                        stroke-width={2}
                    />
                );
            default:
                return (
                    <ChevronRight class="size-3.5 text-slate-600" stroke-width={2} />
                );
        }
    };

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
                            class="text-[10px] text-slate-500 hover:text-slate-300"
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
                            onChange={(e) => setTargetBranch(e.currentTarget.value)}
                        >
                            <For each={branches()}>
                                {(b) => <option value={b}>{b}</option>}
                            </For>
                            <Show when={!branches().includes("main")}>
                                <option value="main">main</option>
                            </Show>
                        </select>
                    </Show>

                    <div class="space-y-1">
                        <For each={steps()}>
                            {(step) => (
                                <div class="flex items-start gap-2 rounded-md px-2 py-1.5">
                                    <div class="mt-0.5">{stepIcon(step.status)}</div>
                                    <div class="min-w-0 flex-1">
                                        <span class="text-xs text-slate-300">
                                            {step.label}
                                        </span>
                                        <Show when={step.output}>
                                            <pre class="mt-1 max-h-32 overflow-y-auto whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-slate-500">
                                                {step.output}
                                            </pre>
                                        </Show>
                                    </div>
                                </div>
                            )}
                        </For>
                    </div>

                    <Show
                        when={
                            streamPhase() !== "idle" ||
                            streamLog().length > 0
                        }
                    >
                        <div class="rounded-lg border border-violet-800/35 bg-violet-950/15 px-2.5 py-2">
                            <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-violet-300/80">
                                {streamPhase() === "streaming"
                                    ? "Utility model (streaming)"
                                    : streamPhase() === "error"
                                      ? "Utility model (error)"
                                      : "Utility model"}
                            </p>
                            <pre class="max-h-40 overflow-y-auto whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-slate-400">
                                {streamLog() ||
                                    (streamPhase() === "streaming"
                                        ? "…"
                                        : "")}
                            </pre>
                        </div>
                    </Show>

                    <Show when={inConflict() && streamPhase() === "error"}>
                        <div class="rounded-lg border border-amber-800/40 bg-amber-950/20 px-3 py-2 space-y-1.5">
                            <p class="flex items-center gap-1.5 text-xs font-medium text-amber-300">
                                <AlertTriangle class="size-3.5" stroke-width={2} />
                                Could not finish automatically
                            </p>
                            <Show when={conflictFiles().length > 0}>
                                <ul class="space-y-0.5">
                                    <For each={conflictFiles()}>
                                        {(f) => (
                                            <li class="font-mono text-[10px] text-amber-200/70">
                                                {f}
                                            </li>
                                        )}
                                    </For>
                                </ul>
                            </Show>
                            <div class="flex gap-2">
                                <button
                                    type="button"
                                    disabled={running()}
                                    onClick={() => void handleRetry()}
                                    class="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-emerald-600/45 bg-emerald-800/40 px-2 py-1.5 text-[10px] font-medium text-emerald-100 transition-colors hover:bg-emerald-700/45 disabled:opacity-40"
                                >
                                    <Show
                                        when={!running()}
                                        fallback={
                                            <Loader2
                                                class="size-3 animate-spin"
                                                stroke-width={2}
                                            />
                                        }
                                    >
                                        <RefreshCw class="size-3" stroke-width={2} />
                                    </Show>
                                    Retry (non-streaming)
                                </button>
                                <button
                                    type="button"
                                    disabled={running()}
                                    onClick={() => void handleAbort()}
                                    class="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-red-800/40 bg-red-950/30 px-2 py-1.5 text-[10px] font-medium text-red-300 transition-colors hover:bg-red-900/30 disabled:opacity-40"
                                >
                                    Abort
                                </button>
                            </div>
                        </div>
                    </Show>

                    <Show
                        when={
                            !wizardDone() &&
                            !(inConflict() && streamPhase() === "error") &&
                            streamPhase() !== "streaming"
                        }
                    >
                        <button
                            type="button"
                            disabled={
                                running() ||
                                !targetBranch().trim() ||
                                streamPhase() === "streaming"
                            }
                            onClick={() => void runAllSteps()}
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
                                <ChevronRight class="size-3.5" stroke-width={2} />
                            </Show>
                            {running() ? "Running…" : "Run"}
                        </button>
                    </Show>

                    <Show when={wizardDone()}>
                        <div class="flex items-center gap-2 rounded-lg border border-emerald-800/30 bg-emerald-950/15 px-3 py-2 text-xs text-emerald-300">
                            <Check
                                class="size-4 shrink-0 text-emerald-400"
                                stroke-width={2.5}
                            />
                            {goal() === "rebase" ? "Rebase" : "Merge"}{" "}
                            complete
                        </div>
                        <button
                            type="button"
                            onClick={reset}
                            class="text-[10px] text-slate-500 hover:text-slate-300"
                        >
                            Done
                        </button>
                    </Show>
                </div>
            </Show>
        </div>
    );
};
