import { TerminalWebSocketURL } from "@wails/go/app/App";

type SessionStatus = "connecting" | "ready" | "error" | "disconnected";

type DataListener = (chunk: Uint8Array) => void;
type StatusListener = (status: SessionStatus) => void;

interface SessionRuntime {
    key: string;
    cwd?: string;
    ws: WebSocket | null;
    status: SessionStatus;
    history: Uint8Array;
    dataListeners: Set<DataListener>;
    statusListeners: Set<StatusListener>;
}

const runtimes = new Map<string, SessionRuntime>();
const maxHistoryBytes = 1 << 20;

function appendHistory(prev: Uint8Array, chunk: Uint8Array): Uint8Array {
    const merged = new Uint8Array(prev.length + chunk.length);
    merged.set(prev, 0);
    merged.set(chunk, prev.length);
    if (merged.length <= maxHistoryBytes) return merged;
    return merged.slice(merged.length - maxHistoryBytes);
}

function emitStatus(runtime: SessionRuntime, status: SessionStatus): void {
    runtime.status = status;
    runtime.statusListeners.forEach((fn) => fn(status));
}

async function connect(runtime: SessionRuntime): Promise<void> {
    if (runtime.ws) return;
    emitStatus(runtime, "connecting");
    try {
        const baseURL = await TerminalWebSocketURL();
        const url = new URL(baseURL);
        url.searchParams.set("session", runtime.key);
        if (runtime.cwd) {
            url.searchParams.set("cwd", runtime.cwd);
        }
        const ws = new WebSocket(url.toString());
        ws.binaryType = "arraybuffer";
        runtime.ws = ws;

        ws.onopen = () => emitStatus(runtime, "ready");
        ws.onerror = () => emitStatus(runtime, "error");
        ws.onclose = () => {
            runtime.ws = null;
            emitStatus(runtime, "disconnected");
        };
        ws.onmessage = (ev: MessageEvent) => {
            if (typeof ev.data === "string") return;
            const chunk = new Uint8Array(ev.data as ArrayBuffer);
            runtime.history = appendHistory(runtime.history, chunk);
            runtime.dataListeners.forEach((fn) => fn(chunk));
        };
    } catch {
        emitStatus(runtime, "error");
    }
}

function ensureRuntime(sessionKey: string, cwd?: string): SessionRuntime {
    const existing = runtimes.get(sessionKey);
    if (existing) {
        if (!existing.cwd && cwd) {
            existing.cwd = cwd;
        }
        void connect(existing);
        return existing;
    }

    const runtime: SessionRuntime = {
        key: sessionKey,
        cwd,
        ws: null,
        status: "connecting",
        history: new Uint8Array(0),
        dataListeners: new Set(),
        statusListeners: new Set(),
    };
    runtimes.set(sessionKey, runtime);
    void connect(runtime);
    return runtime;
}

export function useTerminalSession(sessionKey: string, cwd?: string) {
    const runtime = ensureRuntime(sessionKey, cwd);

    return {
        getHistory: (): Uint8Array => runtime.history,
        getStatus: (): SessionStatus => runtime.status,
        onData: (fn: DataListener) => {
            runtime.dataListeners.add(fn);
            return () => runtime.dataListeners.delete(fn);
        },
        onStatus: (fn: StatusListener) => {
            runtime.statusListeners.add(fn);
            fn(runtime.status);
            return () => runtime.statusListeners.delete(fn);
        },
        sendInput: (data: string) => {
            if (!runtime.ws || runtime.ws.readyState !== WebSocket.OPEN) return;
            runtime.ws.send(new TextEncoder().encode(data));
        },
        sendResize: (rows: number, cols: number) => {
            if (!runtime.ws || runtime.ws.readyState !== WebSocket.OPEN) return;
            runtime.ws.send(JSON.stringify({ type: "resize", rows, cols }));
        },
    };
}
