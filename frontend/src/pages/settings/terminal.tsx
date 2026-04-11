import { TerminalWebSocketURL } from "@wails/go/app/App";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import type { Component } from "solid-js";
import { createSignal, onCleanup, onMount } from "solid-js";

export const SettingsTerminalPage: Component = () => {
    const [status, setStatus] = createSignal<string>("Connecting…");
    let container: HTMLDivElement | undefined;

    onMount(() => {
        if (!container) return;
        const el: HTMLDivElement = container;

        const term = new Terminal({
            cursorBlink: true,
            fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            theme: {
                background: "#0c110f",
                foreground: "#cbd2ce",
                cursor: "#10b981",
                cursorAccent: "#0c110f",
                selectionBackground: "rgba(16, 185, 129, 0.2)",
                selectionForeground: undefined,
                black: "#101613",
                red: "#e06c75",
                green: "#34d399",
                yellow: "#e5c07b",
                blue: "#61afef",
                magenta: "#c678dd",
                cyan: "#56b6c2",
                white: "#acb6b1",
                brightBlack: "#5b6a62",
                brightRed: "#f2979e",
                brightGreen: "#6ee7b7",
                brightYellow: "#f5dda7",
                brightBlue: "#82c8f0",
                brightMagenta: "#daa2e8",
                brightCyan: "#7dd4df",
                brightWhite: "#f2f4f3",
            },
        });
        const fit = new FitAddon();
        term.loadAddon(fit);
        term.open(el);
        fit.fit();

        let ws: WebSocket | null = null;
        let ro: ResizeObserver | null = null;

        function sendResize() {
            if (!ws || ws.readyState !== WebSocket.OPEN) return;
            const rows = term.rows;
            const cols = term.cols;
            ws.send(
                JSON.stringify({
                    type: "resize",
                    rows,
                    cols,
                }),
            );
        }

        function attachSocket(url: string) {
            const socket = new WebSocket(url);
            socket.binaryType = "arraybuffer";

            socket.onopen = () => {
                setStatus("");
                fit.fit();
                sendResize();
            };

            socket.onmessage = (ev: MessageEvent) => {
                if (typeof ev.data === "string") {
                    return;
                }
                const buf = ev.data as ArrayBuffer;
                term.write(new Uint8Array(buf));
            };

            socket.onerror = () => {
                setStatus("Connection error.");
            };

            socket.onclose = () => {
                setStatus("Disconnected.");
            };

            term.onData((data) => {
                if (socket.readyState !== WebSocket.OPEN) return;
                socket.send(new TextEncoder().encode(data));
            });

            ws = socket;

            ro = new ResizeObserver(() => {
                fit.fit();
                sendResize();
            });
            ro.observe(el);
        }

        void (async () => {
            try {
                const url = await TerminalWebSocketURL();
                attachSocket(url);
            } catch {
                setStatus("Terminal is unavailable.");
            }
        })();

        onCleanup(() => {
            ro?.disconnect();
            ro = null;
            ws?.close();
            ws = null;
            term.dispose();
        });
    });

    return (
        <div class="flex min-h-0 flex-1 flex-col gap-3">
            <div>
                <h2 class="text-sm font-medium text-slate-200">Terminal</h2>
                <p class="mt-0.5 text-xs text-slate-600">
                    Embedded shell session over a local WebSocket (PTY on macOS
                    and Linux).
                </p>
            </div>
            {status() ? (
                <p class="text-xs text-amber-600/90">{status()}</p>
            ) : null}
            <div
                class="min-h-[320px] flex-1 overflow-hidden rounded-md border border-slate-800/60 bg-app-panel p-1"
                ref={(r) => {
                    container = r;
                }}
            />
        </div>
    );
};
