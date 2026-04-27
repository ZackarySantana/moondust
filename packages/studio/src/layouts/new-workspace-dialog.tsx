import { useNavigate } from "@solidjs/router";
import {
    Button,
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTitle,
    Input,
    TabsContent,
    TabsList,
    TabsRoot,
    TabsTrigger,
    Text,
} from "@moondust/components";
import { createEffect, createSignal, Show, type Component } from "solid-js";
import { useQueryClient } from "@tanstack/solid-query";
import {
    CreateWorkspaceFromFolder,
    CreateWorkspaceFromGit,
    SelectWorkspaceFolder,
} from "@/lib/wails";
import { invalidateProjects } from "@/lib/query-client";
import { paths } from "@/lib/workspace";
import { useToast } from "@/lib/toast";
import { useUIState } from "@/lib/ui-state";

function folderBasename(p: string): string {
    const s = p.replace(/[/\\]+$/, "");
    const i = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\"));
    return i >= 0 ? s.slice(i + 1) : s;
}

function errMsg(e: unknown): string {
    if (e instanceof Error) return e.message;
    return String(e);
}

/**
 * Modal to add a workspace: open an existing folder, or clone from a Git remote.
 */
export const NewWorkspaceDialog: Component = () => {
    const ui = useUIState();
    const toast = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [mode, setMode] = createSignal<"folder" | "git">("folder");
    const [folderPath, setFolderPath] = createSignal("");
    const [folderName, setFolderName] = createSignal("");
    const [gitURL, setGitURL] = createSignal("");
    const [gitName, setGitName] = createSignal("");
    const [busy, setBusy] = createSignal(false);
    const [formError, setFormError] = createSignal("");

    createEffect(() => {
        if (!ui.newWorkspaceDialogOpen()) return;
        setMode("folder");
        setFolderPath("");
        setFolderName("");
        setGitURL("");
        setGitName("");
        setFormError("");
        setBusy(false);
    });

    function close() {
        ui.closeNewWorkspaceDialog();
    }

    async function pickFolder() {
        setFormError("");
        try {
            const dir = await SelectWorkspaceFolder();
            if (!dir) return;
            setFolderPath(dir);
            setFolderName((prev) => prev.trim() || folderBasename(dir));
        } catch (e) {
            toast.showToast({
                title: "Folder picker failed",
                body: errMsg(e),
            });
        }
    }

    async function submitFolder() {
        const dir = folderPath().trim();
        if (!dir) {
            setFormError("Choose a folder first.");
            return;
        }
        setBusy(true);
        setFormError("");
        try {
            const p = await CreateWorkspaceFromFolder(dir, folderName().trim());
            await invalidateProjects(queryClient);
            close();
            navigate(paths.workspace(p.ID));
            toast.showToast({
                title: "Workspace added",
                body: p.Name,
            });
        } catch (e) {
            setFormError(errMsg(e));
        } finally {
            setBusy(false);
        }
    }

    async function submitGit() {
        const url = gitURL().trim();
        if (!url) {
            setFormError("Enter a Git URL.");
            return;
        }
        setBusy(true);
        setFormError("");
        try {
            const p = await CreateWorkspaceFromGit(url, gitName().trim());
            await invalidateProjects(queryClient);
            close();
            navigate(paths.workspace(p.ID));
            toast.showToast({
                title: "Repository cloned",
                body: p.Name,
            });
        } catch (e) {
            setFormError(errMsg(e));
        } finally {
            setBusy(false);
        }
    }

    return (
        <Dialog
            open={ui.newWorkspaceDialogOpen()}
            onEscapeKeyDown={close}
        >
            <DialogOverlay
                type="button"
                aria-label="Close dialog"
                onClick={close}
            />
            <DialogContent class="max-w-lg">
                <DialogTitle>New workspace</DialogTitle>
                <p class="mb-4 text-[13px] text-void-400">
                    Open a local folder or clone a repository. Both are saved in
                    your workspace list.
                </p>

                <TabsRoot
                    value={mode()}
                    onValueChange={(v) =>
                        setMode(v === "git" ? "git" : "folder")
                    }
                    class="flex flex-col gap-4"
                >
                    <TabsList
                        aria-label="Workspace source"
                        class="w-full justify-start"
                    >
                        <TabsTrigger value="folder">Open folder</TabsTrigger>
                        <TabsTrigger value="git">Clone Git URL</TabsTrigger>
                    </TabsList>

                    <TabsContent value="folder">
                        <div class="flex flex-col gap-3">
                            <div class="flex flex-col gap-1.5">
                                <Text
                                    variant="caption"
                                    class="text-void-400"
                                >
                                    Folder
                                </Text>
                                <div class="flex gap-2">
                                    <Input
                                        readOnly
                                        class="flex-1 font-mono text-[12px]"
                                        placeholder="No folder selected"
                                        value={folderPath()}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={busy()}
                                        onClick={pickFolder}
                                    >
                                        Browse…
                                    </Button>
                                </div>
                            </div>
                            <div class="flex flex-col gap-1.5">
                                <Text
                                    variant="caption"
                                    class="text-void-400"
                                >
                                    Display name
                                </Text>
                                <Input
                                    placeholder="Defaults to folder name"
                                    value={folderName()}
                                    onInput={(e) =>
                                        setFolderName(e.currentTarget.value)
                                    }
                                />
                            </div>
                            <div class="flex justify-end gap-2 pt-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    disabled={busy()}
                                    onClick={close}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    disabled={busy()}
                                    onClick={submitFolder}
                                >
                                    <Show
                                        when={busy()}
                                        fallback="Add workspace"
                                    >
                                        Adding…
                                    </Show>
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="git">
                        <div class="flex flex-col gap-3">
                            <div class="flex flex-col gap-1.5">
                                <Text
                                    variant="caption"
                                    class="text-void-400"
                                >
                                    Remote URL
                                </Text>
                                <Input
                                    class="font-mono text-[12px]"
                                    placeholder="https://github.com/org/repo.git"
                                    value={gitURL()}
                                    onInput={(e) =>
                                        setGitURL(e.currentTarget.value)
                                    }
                                />
                            </div>
                            <div class="flex flex-col gap-1.5">
                                <Text
                                    variant="caption"
                                    class="text-void-400"
                                >
                                    Display name
                                </Text>
                                <Input
                                    placeholder="Defaults from URL"
                                    value={gitName()}
                                    onInput={(e) =>
                                        setGitName(e.currentTarget.value)
                                    }
                                />
                            </div>
                            <p class="text-[11px] text-void-500">
                                Clone runs on your machine (SSH URLs use your
                                SSH agent / keys). This may take a while.
                            </p>
                            <div class="flex justify-end gap-2 pt-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    disabled={busy()}
                                    onClick={close}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    disabled={busy()}
                                    onClick={submitGit}
                                >
                                    <Show
                                        when={busy()}
                                        fallback="Clone & add"
                                    >
                                        Cloning…
                                    </Show>
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </TabsRoot>

                <Show when={formError()}>
                    <p class="mt-3 text-[12px] text-flare-300">{formError()}</p>
                </Show>
            </DialogContent>
        </Dialog>
    );
};
