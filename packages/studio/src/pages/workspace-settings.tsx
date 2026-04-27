import { useNavigate, useParams } from "@solidjs/router";
import {
    Button,
    EmptyState,
    FieldRow,
    Section,
    Spinner,
    Text,
} from "@moondust/components";
import { useQueryClient } from "@tanstack/solid-query";
import { createEffect, createSignal, Show, type Component } from "solid-js";
import { queryKeys } from "@/lib/query-client";
import { useToast } from "@/lib/toast";
import { UpdateWorkspaceDetails } from "@/lib/wails";
import { paths, useWorkspaceQuery } from "@/lib/workspace";

function errMsg(e: unknown): string {
    if (e instanceof Error) return e.message;
    return String(e);
}

export const WorkspaceSettingsPage: Component = () => {
    const params = useParams<{ workspaceId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    const workspaceQuery = useWorkspaceQuery(() => params.workspaceId);
    const [nameDraft, setNameDraft] = createSignal("");
    const [branchDraft, setBranchDraft] = createSignal("");
    const [saving, setSaving] = createSignal(false);

    createEffect(() => {
        const w = workspaceQuery.data;
        if (w) {
            setNameDraft(w.Name);
            setBranchDraft(w.Branch || "main");
        }
    });

    const dirty = () => {
        const w = workspaceQuery.data;
        if (!w) return false;
        const b = branchDraft().trim() || "main";
        const storedBranch = w.Branch || "main";
        return nameDraft().trim() !== w.Name || b !== storedBranch;
    };

    async function save() {
        const wid = params.workspaceId;
        if (!wid) return;
        const n = nameDraft().trim();
        const b = branchDraft().trim();
        if (!n) {
            toast.showToast({
                title: "Name required",
                body: "Enter a display name for this workspace.",
            });
            return;
        }
        if (!b) {
            toast.showToast({
                title: "Base branch required",
                body: "Enter the branch new worktrees should start from.",
            });
            return;
        }
        setSaving(true);
        try {
            await UpdateWorkspaceDetails(wid, n, b);
            await queryClient.invalidateQueries({
                queryKey: queryKeys.workspaces.all,
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.workspaces.detail(wid),
            });
            toast.showToast({
                title: "Saved",
                body: "Workspace settings updated.",
            });
        } catch (e) {
            toast.showToast({
                title: "Could not save",
                body: errMsg(e),
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div class="min-h-0 min-w-0 flex-1 overflow-y-auto">
            <Show
                when={workspaceQuery.data}
                fallback={
                    <Show
                        when={workspaceQuery.isPending}
                        fallback={
                            <div class="flex h-full items-center justify-center p-10">
                                <EmptyState
                                    title="Workspace not found"
                                    description="It may have been removed; head back to the Hub."
                                    actions={
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                navigate(paths.hub())
                                            }
                                        >
                                            Back to Hub
                                        </Button>
                                    }
                                    bordered
                                />
                            </div>
                        }
                    >
                        <div class="flex h-full items-center justify-center p-10">
                            <Spinner />
                        </div>
                    </Show>
                }
            >
                {(workspace) => {
                    const wid = () => workspace().ID;
                    return (
                        <div class="mx-auto flex max-w-3xl flex-col gap-10 px-8 py-10">
                            <header class="flex flex-col gap-3">
                                <div class="flex flex-wrap items-end justify-between gap-3">
                                    <div>
                                        <Text variant="eyebrow">
                                            Workspace settings
                                        </Text>
                                        <h1 class="mt-1 text-2xl font-semibold tracking-tight text-void-50">
                                            {workspace().Name}
                                        </h1>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            navigate(paths.workspace(wid()))
                                        }
                                    >
                                        Back to overview
                                    </Button>
                                </div>
                                <p class="text-[13px] text-void-400">
                                    The folder on disk is fixed when the
                                    workspace is added. You can change the
                                    display name and which git branch new
                                    worktrees use as their base.
                                </p>
                            </header>

                            <Section
                                title="General"
                                description="How this workspace appears in Moondust and how threads branch from git."
                            >
                                <FieldRow
                                    id="ws-name"
                                    label="Display name"
                                    value={nameDraft()}
                                    placeholder="Workspace name"
                                    description="Shown in the hub, rail, and title bar."
                                    onInput={(e) =>
                                        setNameDraft(e.currentTarget.value)
                                    }
                                />
                                <FieldRow
                                    id="ws-base-branch"
                                    label="Base branch for worktrees"
                                    value={branchDraft()}
                                    placeholder="main"
                                    description="New threads’ worktrees are created from this branch. Use the same name as on the remote (e.g. main, develop)."
                                    onInput={(e) =>
                                        setBranchDraft(e.currentTarget.value)
                                    }
                                />
                                <div class="flex justify-end pt-2">
                                    <Button
                                        type="button"
                                        disabled={!dirty() || saving()}
                                        onClick={() => void save()}
                                    >
                                        <Show
                                            when={saving()}
                                            fallback="Save changes"
                                        >
                                            Saving…
                                        </Show>
                                    </Button>
                                </div>
                            </Section>

                            <Section
                                title="Location"
                                description="Root directory on disk."
                            >
                                <FieldRow
                                    id="ws-dir"
                                    label="Directory"
                                    value={workspace().Directory}
                                    description="To use a different folder, add a new workspace."
                                />
                            </Section>
                        </div>
                    );
                }}
            </Show>
        </div>
    );
};
