import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { A, useNavigate, useParams } from "@solidjs/router";
import ArrowLeft from "lucide-solid/icons/arrow-left";
import Check from "lucide-solid/icons/check";
import Copy from "lucide-solid/icons/copy";
import Loader2 from "lucide-solid/icons/loader-2";
import type { Component, JSX } from "solid-js";
import {
    createEffect,
    createMemo,
    createSignal,
    on,
    onCleanup,
    Show,
} from "solid-js";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { queryKeys } from "@/lib/query-client";
import { DeleteProject, GetProject, UpdateProject } from "@wails/go/app/App";
import { store } from "@wails/go/models";

interface FieldRowProps {
    id: string;
    label: string;
    value: string;
    placeholder?: string;
    disabled?: boolean;
    description?: string;
    onInput?: JSX.EventHandler<HTMLInputElement, InputEvent>;
}

const FieldRow: Component<FieldRowProps> = (props) => (
    <div class="grid grid-cols-[11rem_1fr] items-start gap-4">
        <Label
            for={props.id}
            class="mb-0 pt-2 text-right text-[13px] text-slate-400"
        >
            {props.label}
        </Label>
        <div class="space-y-1">
            <Input
                id={props.id}
                value={props.value}
                placeholder={props.placeholder}
                disabled={props.disabled}
                onInput={props.onInput}
                readOnly={!props.onInput}
            />
            {props.description && (
                <p class="text-xs text-slate-600">{props.description}</p>
            )}
        </div>
    </div>
);

interface SectionProps {
    title: string;
    description?: string;
    children: any;
}

const Section: Component<SectionProps> = (props) => (
    <section class="space-y-5">
        <div>
            <h2 class="text-sm font-medium text-slate-200">{props.title}</h2>
            {props.description && (
                <p class="mt-0.5 text-xs text-slate-600">{props.description}</p>
            )}
        </div>
        <div class="space-y-4">{props.children}</div>
    </section>
);

interface CopyableReadonlyFieldProps {
    label: string;
    value: string;
    description?: string;
    copyAriaLabel: string;
}

const CopyableReadonlyField: Component<CopyableReadonlyFieldProps> = (
    props,
) => {
    const [copied, setCopied] = createSignal(false);

    async function copy() {
        try {
            await navigator.clipboard.writeText(props.value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard not available */
        }
    }

    return (
        <div class="grid grid-cols-[11rem_1fr] items-start gap-4">
            <Label class="mb-0 pt-2 text-right text-[13px] text-slate-400">
                {props.label}
            </Label>
            <div class="space-y-1">
                <div class="flex items-center gap-2">
                    <code class="flex h-9 min-w-0 flex-1 items-center rounded-lg border border-slate-800/40 bg-slate-950/30 px-3 font-mono text-xs text-slate-500 select-all">
                        {props.value}
                    </code>
                    <button
                        type="button"
                        class="shrink-0 cursor-pointer rounded-lg border border-slate-800/40 p-2 text-slate-500 transition-colors duration-100 hover:bg-slate-800/40 hover:text-slate-300"
                        aria-label={props.copyAriaLabel}
                        onClick={() => void copy()}
                    >
                        <Show
                            when={!copied()}
                            fallback={
                                <Check
                                    class="size-3.5 text-emerald-500"
                                    stroke-width={2}
                                    aria-hidden
                                />
                            }
                        >
                            <Copy
                                class="size-3.5"
                                stroke-width={2}
                                aria-hidden
                            />
                        </Show>
                    </button>
                </div>
                {props.description && (
                    <p class="text-xs text-slate-600">{props.description}</p>
                )}
            </div>
        </div>
    );
};

export const ProjectSettingsPage: Component = () => {
    const params = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const [saved, setSaved] = createSignal(false);
    const [error, setError] = createSignal("");
    const [deleteModalOpen, setDeleteModalOpen] = createSignal(false);

    const [projectId, setProjectId] = createSignal("");
    const [name, setName] = createSignal("");
    const [directory, setDirectory] = createSignal("");
    const [remoteUrl, setRemoteUrl] = createSignal("");

    const [defaultBranch, setDefaultBranch] = createSignal("");
    const [autoPull, setAutoPull] = createSignal("");
    const [commitSigning, setCommitSigning] = createSignal("");

    const [model, setModel] = createSignal("");
    const [systemPrompt, setSystemPrompt] = createSignal("");
    const [maxTokens, setMaxTokens] = createSignal("");
    const [temperature, setTemperature] = createSignal("");

    const [runtime, setRuntime] = createSignal("");
    const [shell, setShell] = createSignal("");
    const [workingDir, setWorkingDir] = createSignal("");

    const projectQuery = useQuery(() => ({
        queryKey: queryKeys.projects.detail(params.id),
        queryFn: async () => {
            const p = await GetProject(params.id);
            if (!p) {
                throw new Error("Project not found");
            }
            return p;
        },
        enabled: !!params.id,
    }));

    const updateMutation = useMutation(() => ({
        mutationFn: (p: store.Project) => UpdateProject(p),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.projects.all,
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.projects.detail(params.id),
            });
        },
    }));

    function populateFromProject(p: store.Project) {
        setProjectId(p.id);
        setName(p.name);
        setDirectory(p.directory);
        setRemoteUrl(p.remote_url ?? "");

        // const m = p.meta ?? {};
        // setDefaultBranch(m["default_branch"] ?? "");
        // setAutoPull(m["auto_pull"] ?? "");
        // setCommitSigning(m["commit_signing"] ?? "");
        // setModel(m["model"] ?? "");
        // setSystemPrompt(m["system_prompt"] ?? "");
        // setMaxTokens(m["max_tokens"] ?? "");
        // setTemperature(m["temperature"] ?? "");
        // setRuntime(m["runtime"] ?? "");
        // setShell(m["shell"] ?? "");
        // setWorkingDir(m["working_dir"] ?? "");
    }

    createEffect(
        on(
            () => params.id,
            () => {
                setError("");
                setSaved(false);
            },
        ),
    );

    createEffect(
        on(
            () => projectQuery.data,
            (p) => {
                if (p) populateFromProject(p);
            },
        ),
    );

    function buildMeta(): Record<string, string> {
        const m: Record<string, string> = {};
        if (defaultBranch()) m["default_branch"] = defaultBranch();
        if (autoPull()) m["auto_pull"] = autoPull();
        if (commitSigning()) m["commit_signing"] = commitSigning();
        if (model()) m["model"] = model();
        if (systemPrompt()) m["system_prompt"] = systemPrompt();
        if (maxTokens()) m["max_tokens"] = maxTokens();
        if (temperature()) m["temperature"] = temperature();
        if (runtime()) m["runtime"] = runtime();
        if (shell()) m["shell"] = shell();
        if (workingDir()) m["working_dir"] = workingDir();
        return m;
    }

    async function save() {
        setError("");
        setSaved(false);
        try {
            const p = new store.Project({
                id: projectId(),
                name: name(),
                directory: directory(),
                remote_url: remoteUrl() || undefined,
                meta: buildMeta(),
            });
            await updateMutation.mutateAsync(p);
            setSaved(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }

    createEffect(
        on(saved, (v) => {
            if (!v) return;
            const t = setTimeout(() => setSaved(false), 2000);
            return () => clearTimeout(t);
        }),
    );

    return (
        <div class="h-full min-h-0 w-full overflow-y-auto p-8 pt-10 animate-fade-in">
            <div class="mx-auto w-full max-w-3xl">
                <header class="mb-8">
                    <A
                        href="/"
                        class="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors duration-100 hover:text-slate-300"
                    >
                        <ArrowLeft
                            class="size-3.5"
                            stroke-width={2}
                            aria-hidden
                        />
                        Back
                    </A>
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-xl font-semibold tracking-tight text-slate-100">
                                {name() || params.id}
                            </h1>
                            <p class="mt-1 text-sm text-slate-600">
                                Project configuration and runtime settings.
                            </p>
                        </div>
                        <Button
                            onClick={() => void save()}
                            disabled={
                                updateMutation.isPending ||
                                !projectQuery.isSuccess
                            }
                            class="min-w-24"
                        >
                            <Show
                                when={!updateMutation.isPending}
                                fallback={
                                    <>
                                        <Loader2
                                            class="size-4 animate-spin"
                                            stroke-width={2}
                                            aria-hidden
                                        />
                                        Saving…
                                    </>
                                }
                            >
                                <Show
                                    when={!saved()}
                                    fallback={
                                        <>
                                            <Check
                                                class="size-4"
                                                stroke-width={2}
                                                aria-hidden
                                            />
                                            Saved
                                        </>
                                    }
                                >
                                    Save
                                </Show>
                            </Show>
                        </Button>
                    </div>
                    <Show when={projectQuery.isError}>
                        <p class="mt-3 rounded-lg border border-red-900/30 bg-red-950/15 px-3 py-2 text-xs text-red-400">
                            Failed to load project.
                        </p>
                    </Show>
                    <Show when={error()}>
                        <p class="mt-3 rounded-lg border border-red-900/30 bg-red-950/15 px-3 py-2 text-xs text-red-400">
                            {error()}
                        </p>
                    </Show>
                </header>

                <Separator class="mb-8 bg-slate-800/30" />

                <div class="space-y-10">
                    {/* ── General ── */}
                    <Section title="General">
                        <CopyableReadonlyField
                            label="ID"
                            value={projectId()}
                            copyAriaLabel="Copy ID"
                            description="Immutable identifier used internally. Cannot be changed."
                        />
                        <FieldRow
                            id="proj-name"
                            label="Name"
                            value={name()}
                            placeholder="Project name"
                            description="Display name shown in the sidebar and thread headers."
                            onInput={(e) => setName(e.currentTarget.value)}
                        />
                        <CopyableReadonlyField
                            label="Directory"
                            value={directory()}
                            copyAriaLabel="Copy directory path"
                            description="Local path where the project files are stored."
                        />
                        <FieldRow
                            id="proj-remote-url"
                            label="Remote URL"
                            value={remoteUrl()}
                            placeholder="Not configured"
                            description="Git remote used for cloning and syncing."
                            onInput={(e) => setRemoteUrl(e.currentTarget.value)}
                        />
                    </Section>

                    <Separator class="bg-slate-800/25" />

                    {/* ── Git ── */}
                    <Section
                        title="Git"
                        description="Version control behavior for this project."
                    >
                        <FieldRow
                            id="proj-default-branch"
                            label="Default branch"
                            value={defaultBranch()}
                            placeholder="main"
                            description="Branch checked out when opening the project."
                            onInput={(e) =>
                                setDefaultBranch(e.currentTarget.value)
                            }
                        />
                        <FieldRow
                            id="proj-auto-pull"
                            label="Auto-pull"
                            value={autoPull()}
                            placeholder="on change"
                            description="When to pull upstream changes automatically."
                            onInput={(e) => setAutoPull(e.currentTarget.value)}
                        />
                        <FieldRow
                            id="proj-commit-signing"
                            label="Commit signing"
                            value={commitSigning()}
                            placeholder="Disabled"
                            description="GPG or SSH key used to sign commits."
                            onInput={(e) =>
                                setCommitSigning(e.currentTarget.value)
                            }
                        />
                    </Section>

                    <Separator class="bg-slate-800/25" />

                    {/* ── Agent ── */}
                    <Section
                        title="Agent"
                        description="Defaults for threads running in this project."
                    >
                        <FieldRow
                            id="proj-model"
                            label="Model"
                            value={model()}
                            placeholder="Default"
                            description="LLM model used for new threads."
                            onInput={(e) => setModel(e.currentTarget.value)}
                        />
                        <FieldRow
                            id="proj-system-prompt"
                            label="System prompt"
                            value={systemPrompt()}
                            placeholder="None"
                            description="Prepended to every thread in this project."
                            onInput={(e) =>
                                setSystemPrompt(e.currentTarget.value)
                            }
                        />
                        <FieldRow
                            id="proj-max-tokens"
                            label="Max tokens"
                            value={maxTokens()}
                            placeholder="8192"
                            description="Maximum response length per turn."
                            onInput={(e) => setMaxTokens(e.currentTarget.value)}
                        />
                        <FieldRow
                            id="proj-temperature"
                            label="Temperature"
                            value={temperature()}
                            placeholder="0.7"
                            description="Sampling temperature for model responses."
                            onInput={(e) =>
                                setTemperature(e.currentTarget.value)
                            }
                        />
                    </Section>

                    <Separator class="bg-slate-800/25" />

                    {/* ── Environment ── */}
                    <Section
                        title="Environment"
                        description="Variables and context injected into agent sessions."
                    >
                        <FieldRow
                            id="proj-runtime"
                            label="Runtime"
                            value={runtime()}
                            placeholder="Auto-detect"
                            description="Language runtime (e.g. Node 20, Python 3.12, Go 1.22)."
                            onInput={(e) => setRuntime(e.currentTarget.value)}
                        />
                        <FieldRow
                            id="proj-shell"
                            label="Shell"
                            value={shell()}
                            placeholder="/bin/bash"
                            description="Shell used for command execution."
                            onInput={(e) => setShell(e.currentTarget.value)}
                        />
                        <FieldRow
                            id="proj-working-dir"
                            label="Working directory"
                            value={workingDir()}
                            placeholder="Project root"
                            description="Override the default cwd for agent commands."
                            onInput={(e) =>
                                setWorkingDir(e.currentTarget.value)
                            }
                        />
                    </Section>

                    <Separator class="bg-slate-800/25" />

                    {/* ── Danger zone ── */}
                    <Section title="Danger Zone">
                        <div class="flex items-center justify-between rounded-lg border border-red-900/30 bg-red-950/10 px-4 py-3">
                            <div>
                                <p class="text-sm font-medium text-slate-200">
                                    Remove project
                                </p>
                                <p class="text-xs text-slate-500">
                                    Deletes the project from Moondust.
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteModalOpen(true)}
                            >
                                Remove
                            </Button>
                        </div>
                    </Section>

                    <div class="h-8" />
                </div>
            </div>

            <DeleteProjectModal
                open={deleteModalOpen()}
                onOpenChange={setDeleteModalOpen}
                projectName={name()}
                projectId={params.id}
                onDeleted={() => {
                    queryClient.invalidateQueries({
                        queryKey: queryKeys.projects.all,
                    });
                }}
            />
        </div>
    );
};

// ---------------------------------------------------------------------------
// Delete project confirmation modal
// ---------------------------------------------------------------------------

const DeleteProjectModal: Component<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectName: string;
    projectId: string;
    onDeleted: () => void;
}> = (props) => {
    const navigate = useNavigate();
    const [confirmText, setConfirmText] = createSignal("");
    const [deleteFiles, setDeleteFiles] = createSignal(false);
    const [deleting, setDeleting] = createSignal(false);
    const [error, setError] = createSignal("");

    const canConfirm = createMemo(
        () => confirmText().trim() === props.projectName && !deleting(),
    );

    function close() {
        if (deleting()) return;
        props.onOpenChange(false);
    }

    createEffect(
        on(
            () => props.open,
            (isOpen) => {
                if (isOpen) {
                    setConfirmText("");
                    setDeleteFiles(false);
                    setDeleting(false);
                    setError("");
                }
            },
        ),
    );

    createEffect(() => {
        if (!props.open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        document.addEventListener("keydown", onKey);
        onCleanup(() => document.removeEventListener("keydown", onKey));
    });

    async function handleDelete() {
        if (!canConfirm()) return;
        setDeleting(true);
        setError("");
        try {
            await DeleteProject(props.projectId, deleteFiles());
            props.onDeleted();
            navigate("/");
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
            setDeleting(false);
        }
    }

    return (
        <Dialog open={props.open}>
            <DialogOverlay
                aria-label="Close dialog"
                onClick={() => close()}
            />
            <DialogContent
                role="dialog"
                aria-modal="true"
            >
                <DialogTitle>Delete project</DialogTitle>

                <div class="space-y-4">
                    <p class="text-sm text-slate-400">
                        This will permanently remove{" "}
                        <span class="font-semibold text-slate-200">
                            {props.projectName}
                        </span>{" "}
                        from Moondust. This action cannot be undone.
                    </p>

                    <div class="space-y-1.5">
                        <Label for="delete-confirm-name">
                            Type{" "}
                            <span class="font-semibold text-slate-200">
                                {props.projectName}
                            </span>{" "}
                            to confirm
                        </Label>
                        <Input
                            id="delete-confirm-name"
                            type="text"
                            autocomplete="off"
                            placeholder={props.projectName}
                            value={confirmText()}
                            disabled={deleting()}
                            onInput={(e) =>
                                setConfirmText(e.currentTarget.value)
                            }
                        />
                    </div>

                    <label class="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-800/40 px-3 py-2.5">
                        <input
                            type="checkbox"
                            class="size-4 shrink-0 cursor-pointer rounded border-slate-700 bg-slate-950/40 text-red-500 accent-red-500"
                            checked={deleteFiles()}
                            disabled={deleting()}
                            onChange={(e) =>
                                setDeleteFiles(e.currentTarget.checked)
                            }
                        />
                        <div>
                            <p class="text-sm text-slate-300">
                                Also delete files on disk
                            </p>
                            <p class="text-xs text-slate-600">
                                Removes the project folder and all its contents
                            </p>
                        </div>
                    </label>

                    <Show when={error()}>
                        <p class="rounded-lg border border-red-900/30 bg-red-950/15 px-3 py-2 text-xs text-red-400">
                            {error()}
                        </p>
                    </Show>

                    <div class="flex justify-end gap-2 pt-1">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => close()}
                            disabled={deleting()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            class="inline-flex min-w-36 items-center justify-center gap-2"
                            disabled={!canConfirm()}
                            onClick={() => void handleDelete()}
                        >
                            <Show
                                when={deleting()}
                                fallback="Delete project"
                            >
                                <Loader2
                                    class="size-4 shrink-0 animate-spin"
                                    stroke-width={2}
                                    aria-hidden
                                />
                                <span>Deleting…</span>
                            </Show>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
