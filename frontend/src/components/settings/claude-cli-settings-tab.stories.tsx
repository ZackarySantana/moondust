import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { store } from "@wails/go/models";
import { queryKeys } from "@/lib/query-client";
import { ClaudeCliSettingsTab } from "./claude-cli-settings-tab";

function wrap(info: store.ClaudeCLIInfo) {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.claudeCLI, info);
    return (
        <QueryClientProvider client={qc}>
            <div class="max-w-2xl rounded-lg border border-slate-800/50 bg-slate-950/20 p-4">
                <ClaudeCliSettingsTab />
            </div>
        </QueryClientProvider>
    );
}

const installedWithAuth = store.ClaudeCLIInfo.createFrom({
    installed: true,
    binary_path: "/usr/local/bin/claude",
    version: "2026.04.01",
    auth: store.ClaudeAuthStatus.createFrom({
        logged_in: true,
        auth_method: "claude.ai",
        api_provider: "firstParty",
        email: "dev@example.com",
        org_id: "00000000-0000-0000-0000-000000000001",
        org_name: "Example Org",
        subscription_type: "pro",
    }),
});

const notInstalled = store.ClaudeCLIInfo.createFrom({
    installed: false,
    binary_path: "",
    version: "",
    probe_error: "Claude Code CLI (`claude`) not found on PATH.",
});

const installedAuthError = store.ClaudeCLIInfo.createFrom({
    installed: true,
    binary_path: "/usr/local/bin/claude",
    version: "2026.04.01",
    auth_error: "exit status 1: network unreachable",
});

const installedLoggedOut = store.ClaudeCLIInfo.createFrom({
    installed: true,
    binary_path: "/usr/local/bin/claude",
    version: "2026.04.01",
    auth: store.ClaudeAuthStatus.createFrom({
        logged_in: false,
    }),
});

const meta = {
    title: "Settings/ClaudeCliSettingsTab",
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Installed: Story = {
    render: () => wrap(installedWithAuth),
};

export const NotInstalled: Story = {
    render: () => wrap(notInstalled),
};

export const AuthError: Story = {
    render: () => wrap(installedAuthError),
};

export const InstalledLoggedOut: Story = {
    render: () => wrap(installedLoggedOut),
};
