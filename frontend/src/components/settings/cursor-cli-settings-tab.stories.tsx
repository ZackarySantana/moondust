import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { store } from "@wails/go/models";
import { queryKeys } from "@/lib/query-client";
import { CursorCliSettingsTab } from "./cursor-cli-settings-tab";

function wrap(info: store.CursorCLIInfo) {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.cursorCLI, info);
    return (
        <QueryClientProvider client={qc}>
            <div class="max-w-2xl rounded-lg border border-slate-800/50 bg-slate-950/20 p-4">
                <CursorCliSettingsTab />
            </div>
        </QueryClientProvider>
    );
}

const installed = store.CursorCLIInfo.createFrom({
    installed: true,
    binary_path: "/usr/local/bin/agent",
    version: "2026.04.01",
    status_output: "ok",
    about_output: "Cursor Agent CLI",
    usage: store.CursorUsageSnapshot.createFrom({
        auto_percent_used: 12.5,
        api_percent_used: 3.2,
        total_percent_used: 15.7,
        display_message: "Within limits",
        auto_usage_message: "",
        api_usage_message: "",
    }),
});

const notInstalled = store.CursorCLIInfo.createFrom({
    installed: false,
    binary_path: "",
    version: "",
    status_output: "",
    about_output: "",
    probe_error: "agent: command not found",
});

const meta = {
    title: "Settings/CursorCliSettingsTab",
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Installed: Story = {
    render: () => wrap(installed),
};

export const NotInstalled: Story = {
    render: () => wrap(notInstalled),
};
