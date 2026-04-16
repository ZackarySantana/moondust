import { useQueryClient } from "@tanstack/solid-query";
import {
    createEffect,
    createMemo,
    createSignal,
    on,
    onCleanup,
} from "solid-js";
import {
    CancelCreateProject,
    CreateProjectFromFolder,
    CreateProjectFromRemote,
    SelectProjectFolder,
} from "@wails/go/app/App";
import {
    canSubmitCreateProjectForm,
    deriveNameFromFolderPath,
    deriveNameFromUrl,
    isUserCanceled,
    parseGitRemoteUrl,
    type CreateProjectTab,
} from "@/lib/create-project";
import { queryKeys } from "@/lib/query-client";

export interface UseCreateProjectModalOptions {
    open: () => boolean;
    onOpenChange: (open: boolean) => void;
    onCreated?: () => void;
}

/**
 * Form state, derived names, and Wails submit flow for {@link CreateProjectModal}.
 */
export function useCreateProjectModal(opts: UseCreateProjectModalOptions) {
    const queryClient = useQueryClient();
    const [createTab, setCreateTab] = createSignal<CreateProjectTab>("url");
    const [urlDraft, setUrlDraft] = createSignal("");
    const [folderPath, setFolderPath] = createSignal("");
    const [folderDefaultBranch, setFolderDefaultBranch] = createSignal("origin/main");
    const [nameOverride, setNameOverride] = createSignal<string | null>(null);
    const [submitting, setSubmitting] = createSignal(false);

    let urlInputRef: HTMLInputElement | undefined;

    const projectName = createMemo(() => {
        if (createTab() === "url") {
            return deriveNameFromUrl(urlDraft());
        }
        return deriveNameFromFolderPath(folderPath());
    });

    const resolvedName = createMemo(() => nameOverride() ?? projectName());

    function resetForm() {
        setUrlDraft("");
        setFolderPath("");
        setFolderDefaultBranch("origin/main");
        setNameOverride(null);
        setCreateTab("url");
        setSubmitting(false);
    }

    function close() {
        if (submitting()) {
            void CancelCreateProject();
        }
        opts.onOpenChange(false);
    }

    async function pickFolder() {
        try {
            const p = await SelectProjectFolder();
            if (p) setFolderPath(p);
        } catch {
            /* dialog failed */
        }
    }

    async function submitCreateProject() {
        const name = resolvedName().trim();
        if (createTab() === "url") {
            const raw = urlDraft().trim();
            if (!raw) return;
            const parsed = parseGitRemoteUrl(raw);
            if (!parsed) {
                alert("That doesn't look like a valid repository URL.");
                return;
            }
            setSubmitting(true);
            try {
                await CreateProjectFromRemote(name, parsed.cloneUrl);
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.projects.all,
                });
                opts.onCreated?.();
                opts.onOpenChange(false);
            } catch (e) {
                if (!isUserCanceled(e)) {
                    alert(e instanceof Error ? e.message : String(e));
                }
            } finally {
                setSubmitting(false);
            }
            return;
        }
        const fp = folderPath().trim();
        if (!fp) {
            alert("Choose a folder first.");
            return;
        }
        const branch = folderDefaultBranch().trim();
        if (!branch) {
            alert(
                "Enter the remote default branch ref (e.g. origin/main).",
            );
            return;
        }
        if (!branch.includes("/")) {
            alert(
                "Default branch must be a remote ref containing '/' (e.g. origin/main).",
            );
            return;
        }
        setSubmitting(true);
        try {
            await CreateProjectFromFolder(name, fp, branch);
            await queryClient.invalidateQueries({
                queryKey: queryKeys.projects.all,
            });
            opts.onCreated?.();
            opts.onOpenChange(false);
        } catch (e) {
            if (!isUserCanceled(e)) {
                alert(e instanceof Error ? e.message : String(e));
            }
        } finally {
            setSubmitting(false);
        }
    }

    function onNameInput(e: InputEvent & { currentTarget: HTMLInputElement }) {
        const v = e.currentTarget.value;
        if (v === "") {
            setNameOverride(null);
        } else {
            setNameOverride(v);
        }
    }

    createEffect(
        on(
            () => opts.open(),
            (isOpen) => {
                if (isOpen) resetForm();
            },
        ),
    );

    createEffect(() => {
        if (!opts.open()) return;
        const id = requestAnimationFrame(() => {
            if (createTab() === "url") urlInputRef?.focus();
        });
        onCleanup(() => cancelAnimationFrame(id));
    });

    function onTabChange(tab: CreateProjectTab) {
        setNameOverride(null);
        setCreateTab(tab);
    }

    const setUrlInputRef = (el: HTMLInputElement) => {
        urlInputRef = el;
    };

    return {
        createTab,
        onTabChange,
        urlDraft,
        setUrlDraft,
        folderPath,
        folderDefaultBranch,
        setFolderDefaultBranch,
        resolvedName,
        submitting,
        pickFolder,
        submitCreateProject,
        onNameInput,
        close,
        setUrlInputRef,
        canSubmit: () =>
            canSubmitCreateProjectForm(
                createTab(),
                resolvedName(),
                urlDraft(),
                folderPath(),
                folderDefaultBranch(),
            ),
    };
}
