import {
    createEffect,
    createMemo,
    createSignal,
    on,
    onCleanup,
    Show,
    type Component,
} from "solid-js";
import {
    CancelCreateProject,
    CreateProjectFromFolder,
    CreateProjectFromRemote,
    SelectProjectFolder,
} from "@wails/go/app/App";
import Loader2 from "lucide-solid/icons/loader-2";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface CreateProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated?: () => void;
}

type CreateProjectTab = "url" | "folder";

const GIT_SCP_REMOTE_RE = /^[^@\s]+@[^:\s]+:(.+)$/;

function repoNameFromPathSegment(lastSegment: string): string {
    return lastSegment.replace(/\.git$/i, "").trim();
}

function deriveNameFromUrl(raw: string): string {
    const t = raw.trim();
    if (!t) return "";

    const scp = t.match(GIT_SCP_REMOTE_RE);
    if (scp) {
        const segments = scp[1].split("/").filter(Boolean);
        const last = segments[segments.length - 1] ?? "";
        return repoNameFromPathSegment(last);
    }

    try {
        const u = new URL(t.includes("://") ? t : `https://${t}`);
        const parts = u.pathname.split("/").filter(Boolean);
        if (parts.length >= 1) {
            return (
                repoNameFromPathSegment(parts[parts.length - 1] ?? "") ||
                u.hostname.replace(/^www\./, "")
            );
        }
        return u.hostname.replace(/^www\./, "") || "";
    } catch {
        return "";
    }
}

function parseGitRemoteUrl(raw: string): { cloneUrl: string } | null {
    const t = raw.trim();
    if (!t) return null;
    if (GIT_SCP_REMOTE_RE.test(t)) return { cloneUrl: t };
    try {
        const u = new URL(t.includes("://") ? t : `https://${t}`);
        return { cloneUrl: u.href };
    } catch {
        return null;
    }
}

function deriveNameFromFolderPath(path: string): string {
    const t = path.trim();
    if (!t) return "";
    const parts = t.split(/[/\\]/).filter(Boolean);
    return parts[parts.length - 1] ?? "";
}

function isUserCanceled(err: unknown): boolean {
    const msg = err instanceof Error ? err.message : String(err);
    return /context canceled|context cancelled/i.test(msg);
}

export const CreateProjectModal: Component<CreateProjectModalProps> = (
    props,
) => {
    const [createTab, setCreateTab] = createSignal<CreateProjectTab>("url");
    const [urlDraft, setUrlDraft] = createSignal("");
    const [folderPath, setFolderPath] = createSignal("");
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
        setNameOverride(null);
        setCreateTab("url");
        setSubmitting(false);
    }

    function close() {
        if (submitting()) {
            void CancelCreateProject();
        }
        props.onOpenChange(false);
    }

    async function pickFolder() {
        try {
            const p = await SelectProjectFolder();
            SelectProjectFolder;
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
                props.onCreated?.();
                props.onOpenChange(false);
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
        setSubmitting(true);
        try {
            await CreateProjectFromFolder(name, fp);
            props.onCreated?.();
            props.onOpenChange(false);
        } catch (e) {
            if (!isUserCanceled(e)) {
                alert(e instanceof Error ? e.message : String(e));
            }
        } finally {
            setSubmitting(false);
        }
    }

    function canSubmitForm(): boolean {
        if (!resolvedName().trim()) return false;
        if (createTab() === "url") {
            return urlDraft().trim().length > 0;
        }
        return folderPath().trim().length > 0;
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
            () => props.open,
            (isOpen) => {
                if (isOpen) resetForm();
            },
        ),
    );

    createEffect(() => {
        if (!props.open) return;
        const id = requestAnimationFrame(() => {
            if (createTab() === "url") urlInputRef?.focus();
        });
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        document.addEventListener("keydown", onKey);
        onCleanup(() => {
            cancelAnimationFrame(id);
            document.removeEventListener("keydown", onKey);
        });
    });

    return (
        <Dialog open={props.open}>
            <DialogOverlay
                aria-label="Close dialog"
                onClick={() => close()}
            />
            <DialogContent
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-project-title"
            >
                <DialogTitle id="create-project-title">
                    Create project
                </DialogTitle>
                <form
                    class="space-y-5"
                    aria-busy={submitting()}
                    onSubmit={(e) => {
                        e.preventDefault();
                        void submitCreateProject();
                    }}
                >
                    {/* Tab switcher */}
                    <div
                        class="flex rounded-lg bg-slate-950/60 p-1"
                        role="tablist"
                        aria-label="Project source"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={createTab() === "url"}
                            class={cn(
                                "flex-1 cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-medium transition-all duration-150 disabled:cursor-not-allowed",
                                createTab() === "url"
                                    ? "bg-slate-800/80 text-slate-100 shadow-sm"
                                    : "text-slate-500 hover:text-slate-300",
                            )}
                            disabled={submitting()}
                            onClick={() => {
                                setNameOverride(null);
                                setCreateTab("url");
                            }}
                        >
                            URL
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={createTab() === "folder"}
                            disabled={submitting()}
                            class={cn(
                                "flex-1 cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-medium transition-all duration-150 disabled:cursor-not-allowed",
                                createTab() === "folder"
                                    ? "bg-slate-800/80 text-slate-100 shadow-sm"
                                    : "text-slate-500 hover:text-slate-300",
                            )}
                            onClick={() => {
                                setNameOverride(null);
                                setCreateTab("folder");
                            }}
                        >
                            Folder
                        </button>
                    </div>

                    <Show when={createTab() === "url"}>
                        <div class="space-y-1.5">
                            <Label for="create-project-url">
                                Repository URL
                            </Label>
                            <Input
                                id="create-project-url"
                                ref={(el) => {
                                    urlInputRef = el;
                                }}
                                type="text"
                                autocomplete="off"
                                placeholder="https://github.com/org/repo"
                                value={urlDraft()}
                                disabled={submitting()}
                                onInput={(e) =>
                                    setUrlDraft(e.currentTarget.value)
                                }
                            />
                        </div>
                    </Show>

                    <Show when={createTab() === "folder"}>
                        <div class="space-y-1.5">
                            <Label>Local folder</Label>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={submitting()}
                                class="h-auto w-full cursor-pointer justify-start bg-slate-950/40 py-2.5 text-left font-normal text-slate-300 hover:bg-slate-900/60"
                                onClick={() => void pickFolder()}
                            >
                                {folderPath().trim()
                                    ? folderPath()
                                    : "Choose folder…"}
                            </Button>
                        </div>
                    </Show>

                    <div class="space-y-1.5">
                        <Label for="create-project-name">Name</Label>
                        <Input
                            id="create-project-name"
                            type="text"
                            value={resolvedName()}
                            placeholder="Derived from source"
                            disabled={submitting()}
                            onInput={onNameInput}
                        />
                    </div>

                    <div class="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => close()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            class="inline-flex min-w-36 items-center justify-center gap-2"
                            disabled={submitting() || !canSubmitForm()}
                            aria-busy={submitting()}
                        >
                            <Show
                                when={submitting()}
                                fallback={<>Create</>}
                            >
                                <>
                                    <Loader2
                                        class="size-4 shrink-0 animate-spin"
                                        stroke-width={2}
                                        aria-hidden
                                    />
                                    <span>Creating…</span>
                                </>
                            </Show>
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
