import { useNavigate, useParams } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import Loader2 from "lucide-solid/icons/loader-2";
import type { Component } from "solid-js";
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
import { Section } from "@/components/settings-form";
import { queryKeys } from "@/lib/query-client";
import { DeleteProject } from "@wails/go/app/App";
import { useProjectSettings } from "./layout";

export const ProjectDangerPage: Component = () => {
    const params = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const { project } = useProjectSettings();
    const [deleteModalOpen, setDeleteModalOpen] = createSignal(false);

    return (
        <>
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

            <DeleteProjectModal
                open={deleteModalOpen()}
                onOpenChange={setDeleteModalOpen}
                projectName={project()?.name ?? ""}
                projectId={params.id}
                onDeleted={() => {
                    queryClient.invalidateQueries({
                        queryKey: queryKeys.projects.all,
                    });
                }}
            />
        </>
    );
};

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
