import type { logstream } from "@wails/go/models";
import { EventsOn } from "@wails/runtime/runtime";
import { LogSnapshot, SetLogStreaming } from "@wails/go/app/App";
import type { Component } from "solid-js";
import { createSignal, onCleanup, onMount } from "solid-js";

export const SettingsLogsPage: Component = () => {
    const [lines, setLines] = createSignal<string[]>([]);

    onMount(() => {
        void (async () => {
            try {
                const snap = await LogSnapshot();
                setLines(formatSnapshot(snap));
            } catch {
                /* ignore */
            }
        })();

        SetLogStreaming(true);

        const off = EventsOn("log:batch", (...args: unknown[]) => {
            const payload = args[0] as { lines?: logstream.LogLine[] };
            const batch = payload?.lines;
            if (!batch?.length) return;
            setLines((prev) => [...prev, ...batch.map(formatLine)]);
        });

        onCleanup(() => {
            off();
            SetLogStreaming(false);
        });
    });

    return (
        <div class="flex min-h-0 flex-1 flex-col gap-3">
            <div>
                <h2 class="text-sm font-medium text-slate-200">Logs</h2>
                <p class="mt-0.5 text-xs text-slate-600">
                    Application log output (refreshed every second while this
                    page is open).
                </p>
            </div>
            <pre class="max-h-[min(32rem,calc(100vh-14rem))] min-h-48 overflow-auto rounded-lg border border-slate-800/40 bg-slate-950/40 p-3 font-mono text-[11px] leading-relaxed text-slate-400 whitespace-pre-wrap break-words">
                {lines().join("\n") || "No log lines yet."}
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

function formatSnapshot(
    snap: logstream.LogLine[] | null | undefined,
): string[] {
    if (!snap?.length) return [];
    return snap.map(formatLine);
}

function formatLine(line: logstream.LogLine): string {
    const t = formatTime(line.time);
    const base = `${t} ${line.level} ${line.message}`;
    if (line.extra) {
        return `${base} ${line.extra}`;
    }
    return base;
}
