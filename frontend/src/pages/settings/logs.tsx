import type { store } from "@wails/go/models";
import { EventsOn } from "@wails/runtime/runtime";
import {
    ClearLogs,
    DownloadLogs,
    ListLogs,
    SetLogStreaming,
} from "@wails/go/app/App";
import Search from "lucide-solid/icons/search";
import X from "lucide-solid/icons/x";
import { Button } from "@/components/ui/button";
import type { Component } from "solid-js";
import { createMemo, createSignal, onCleanup, onMount, Show } from "solid-js";

export const SettingsLogsPage: Component = () => {
    const [lines, setLines] = createSignal<string[]>([]);
    const [busy, setBusy] = createSignal(false);
    const [filter, setFilter] = createSignal("");

    const filtered = createMemo(() => {
        const q = filter().toLowerCase();
        if (!q) return lines();
        return lines().filter((l) => l.toLowerCase().includes(q));
    });

    async function loadAll() {
        try {
            const snap = await ListLogs();
            setLines(formatSnapshot(snap));
        } catch {
            /* ignore */
        }
    }

    onMount(() => {
        void loadAll();

        SetLogStreaming(true);

        const off = EventsOn("log:batch", (...args: unknown[]) => {
            const payload = args[0] as { lines?: store.LogLine[] };
            const batch = payload?.lines;
            if (!batch?.length) return;
            setLines((prev) => [...prev, ...batch.map(formatLine)]);
        });

        onCleanup(() => {
            off();
            SetLogStreaming(false);
        });
    });

    async function onClear() {
        setBusy(true);
        try {
            await ClearLogs();
            await loadAll();
        } catch {
            /* ignore */
        } finally {
            setBusy(false);
        }
    }

    async function onDownload() {
        setBusy(true);
        try {
            await DownloadLogs();
        } catch {
            /* ignore */
        } finally {
            setBusy(false);
        }
    }

    return (
        <div class="flex min-h-0 flex-1 flex-col gap-3">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 class="text-sm font-medium text-slate-200">Logs</h2>
                    <p class="mt-0.5 text-xs text-slate-600">
                        Persistent application log output refreshed every
                        second.
                    </p>
                </div>
                <div class="flex shrink-0 flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={busy()}
                        onClick={() => void onDownload()}
                    >
                        Download logs…
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        disabled={busy()}
                        onClick={() => void onClear()}
                    >
                        Clear logs
                    </Button>
                </div>
            </div>

            <div class="relative">
                <Search
                    class="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-600"
                    stroke-width={2}
                    aria-hidden
                />
                <input
                    type="text"
                    value={filter()}
                    onInput={(e) => setFilter(e.currentTarget.value)}
                    placeholder="Filter logs…"
                    class="h-8 w-full rounded-lg border border-slate-800/40 bg-slate-950/40 pr-8 pl-8.5 text-xs text-slate-300 transition-colors placeholder:text-slate-600 focus-visible:border-emerald-700/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600/30"
                />
                <Show when={filter()}>
                    <button
                        type="button"
                        class="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-slate-600 transition-colors hover:text-slate-300"
                        aria-label="Clear filter"
                        onClick={() => setFilter("")}
                    >
                        <X
                            class="size-3.5"
                            stroke-width={2}
                            aria-hidden
                        />
                    </button>
                </Show>
            </div>

            <Show when={filter() && lines().length > 0}>
                <p class="text-[11px] tabular-nums text-slate-600">
                    {filtered().length} of {lines().length} lines
                </p>
            </Show>

            <pre class="max-h-[min(32rem,calc(100vh-14rem))] min-h-48 overflow-auto rounded-lg border border-slate-800/40 bg-slate-950/40 p-3 font-mono text-[11px] leading-relaxed text-slate-400 whitespace-pre-wrap wrap-break-word">
                {filtered().join("\n") ||
                    (filter() ? "No matching lines." : "No log lines yet.")}
            </pre>
        </div>
    );
};

function formatTime(t: unknown): string {
    if (t == null || t === "") {
        return "";
    }
    if (typeof t === "string") {
        return t.replace("T", " ").slice(0, 23);
    }
    try {
        return new Date(t as string | number)
            .toISOString()
            .replace("T", " ")
            .slice(0, 23);
    } catch {
        return "";
    }
}

function formatSnapshot(snap: store.LogLine[] | null | undefined): string[] {
    if (!snap?.length) return [];
    return snap.map(formatLine);
}

function formatLine(line: store.LogLine): string {
    const t = formatTime(line.time);
    const base = `${t} ${line.level} ${line.message}`;
    if (line.extra) {
        return `${base} ${line.extra}`;
    }
    return base;
}
