import type { Component } from "solid-js";
import { Show } from "solid-js";
import { ResizeHandle } from "@/components/resize-handle";
import { TerminalPane } from "@/components/terminal-pane";

export const ThreadTerminalDock: Component<{
    terminalHeight: () => number;
    onResizeTerminal: (delta: number) => void;
    readyKey: () => string;
}> = (props) => {
    return (
        <>
            <ResizeHandle
                direction="vertical"
                onResize={(delta) => props.onResizeTerminal(delta)}
            />
            <div
                class="flex min-h-0 shrink-0 p-3"
                style={{ height: `${props.terminalHeight()}px` }}
            >
                <Show
                    when={props.readyKey()}
                    keyed
                    fallback={
                        <div class="flex h-full w-full items-center justify-center rounded-md border border-slate-800/60 bg-app-panel text-xs text-slate-500">
                            Loading terminal...
                        </div>
                    }
                >
                    {(ready) => {
                        const [threadID, cwd] = ready.split("|", 2);
                        return (
                            <TerminalPane
                                sessionKey={`thread:${threadID}`}
                                workingDirectory={cwd}
                            />
                        );
                    }}
                </Show>
            </div>
        </>
    );
};
