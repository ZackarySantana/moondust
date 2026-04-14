import type { Component } from "solid-js";
import { createMemo, Show } from "solid-js";
import { CopyableReadonlyField, Section } from "@/components/settings-form";
import { useThreadSettings } from "./layout";

function formatWhen(iso: unknown): string {
    if (iso == null) return "—";
    const d =
        typeof iso === "string"
            ? new Date(iso)
            : iso instanceof Date
              ? iso
              : null;
    if (!d || Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(d);
}

export const ThreadSettingsGeneralPage: Component = () => {
    const { thread, project, messages, isLoading } = useThreadSettings();

    const threadId = createMemo(() => thread()?.id ?? "");
    const projectRoot = createMemo(() => project()?.directory ?? "");
    const worktreeDir = createMemo(() => (thread()?.worktree_dir ?? "").trim());
    const workspaceDir = createMemo(() => {
        const wt = worktreeDir();
        if (wt) return wt;
        return projectRoot();
    });

    const userMessagesSent = createMemo(
        () => messages().filter((m) => m.role === "user").length,
    );

    return (
        <Section
            title="General"
            description="Read-only information about this thread and its workspace."
        >
            <Show
                when={!isLoading()}
                fallback={<p class="text-xs text-slate-500">Loading…</p>}
            >
                <CopyableReadonlyField
                    label="Thread ID"
                    value={threadId()}
                    copyAriaLabel="Copy thread ID"
                    description="Immutable identifier for this conversation."
                />
                <CopyableReadonlyField
                    label="Project directory"
                    value={projectRoot()}
                    copyAriaLabel="Copy project directory path"
                    description="Root folder of the parent project."
                />
                <CopyableReadonlyField
                    label="Workspace directory"
                    value={workspaceDir()}
                    copyAriaLabel="Copy workspace directory path"
                    description="Files and terminal commands use this folder. When a git worktree is configured for the thread, this is the worktree path; otherwise it matches the project directory."
                />
                <CopyableReadonlyField
                    label="Created"
                    value={formatWhen(thread()?.created_at)}
                    copyAriaLabel="Copy created time"
                    description="When this thread was created."
                />
                <CopyableReadonlyField
                    label="Last updated"
                    value={formatWhen(thread()?.updated_at)}
                    copyAriaLabel="Copy last updated time"
                    description="Last time thread metadata changed."
                />
                <CopyableReadonlyField
                    label="Messages sent"
                    value={String(userMessagesSent())}
                    copyAriaLabel="Copy message count"
                    description="Number of user messages in this thread (outgoing chat turns)."
                />
            </Show>
        </Section>
    );
};
