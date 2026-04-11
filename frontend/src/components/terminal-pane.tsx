import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import type { Component } from "solid-js";
import { createSignal, onCleanup, onMount } from "solid-js";
import { useTerminalSession } from "@/lib/terminal-sessions";
import { cn } from "@/lib/utils";

export interface TerminalPaneProps {
    class?: string;
    workingDirectory?: string;
    sessionKey?: string;
}

export const TerminalPane: Component<TerminalPaneProps> = (props) => {
    const [status, setStatus] = createSignal<string>("Connecting…");
    let container: HTMLDivElement | undefined;

    onMount(() => {
        if (!container) return;
        const el: HTMLDivElement = container;

        const term = new Terminal({
            cursorBlink: true,
            scrollback: 10_000,
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

        function fitTerminal() {
            requestAnimationFrame(() => fit.fit());
        }
        fitTerminal();

        let ro: ResizeObserver | null = null;
        let offData: { dispose: () => void } | null = null;
        let offWSData: (() => void) | null = null;
        let offWSStatus: (() => void) | null = null;
        let fitFrame = 0;
        const session = useTerminalSession(
            props.sessionKey ?? "default",
            props.workingDirectory,
        );

        function fitAndResize() {
            cancelAnimationFrame(fitFrame);
            fitFrame = requestAnimationFrame(() => {
                fit.fit();
                session.sendResize(term.rows, term.cols);
            });
        }
        const history = session.getHistory();
        if (history.length > 0) {
            term.write(history);
            term.scrollToBottom();
        }

        offWSData = session.onData((chunk) => {
            term.write(chunk);
            term.scrollToBottom();
        });
        offWSStatus = session.onStatus((next) => {
            if (next === "ready") {
                setStatus("");
                fitAndResize();
            } else if (next === "connecting") {
                setStatus("Connecting…");
            } else if (next === "error") {
                setStatus("Connection error.");
            } else {
                setStatus("Disconnected.");
            }
        });

        offData = term.onData((data) => {
            session.sendInput(data);
        });
        ro = new ResizeObserver(() => {
            fitAndResize();
        });
        ro.observe(el);

        onCleanup(() => {
            cancelAnimationFrame(fitFrame);
            offWSData?.();
            offWSStatus?.();
            offData?.dispose();
            ro?.disconnect();
            term.dispose();
        });
    });

    return (
        <div class={cn("flex h-full min-h-0 flex-1 flex-col", props.class)}>
            {status() ? (
                <p class="shrink-0 pb-2 text-xs text-amber-600/90">
                    {status()}
                </p>
            ) : null}
            <div
                class="h-full min-h-0 flex-1 overflow-hidden rounded-md border border-slate-800/60 bg-app-panel"
                ref={(r) => {
                    container = r;
                }}
            />
        </div>
    );
};
