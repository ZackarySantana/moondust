import type { Component } from "solid-js";
import { TerminalPane } from "@/components/terminal-pane";

export const SettingsTerminalPage: Component = () => {
    return (
        <div class="flex min-h-0 flex-1 flex-col gap-3">
            <div>
                <h2 class="text-sm font-medium text-slate-200">Terminal</h2>
                <p class="mt-0.5 text-xs text-slate-600">
                    Embedded shell session over a local WebSocket (PTY on macOS
                    and Linux).
                </p>
            </div>
            <TerminalPane
                class="min-h-[320px]"
                sessionKey="settings-terminal"
            />
        </div>
    );
};
