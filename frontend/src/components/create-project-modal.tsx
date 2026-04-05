import {
    createEffect,
    createMemo,
    createSignal,
    on,
    onCleanup,
    Show,
    type Component,
} from "solid-js";
import { SelectProjectFolder } from "../../wailsjs/go/main/App";
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
}

type CreateProjectTab = "url" | "folder";

function deriveNameFromUrl(raw: string): string {
    const t = raw.trim();
    if (!t) return "";
    try {
        const u = new URL(t.includes("://") ? t : `https://${t}`);
        const parts = u.pathname.split("/").filter(Boolean);
        if (parts.length >= 1) {
            return (
                parts[parts.length - 1].replace(/\.git$/i, "") ||
                u.hostname.replace(/^www\./, "")
            );
        }
        return u.hostname.replace(/^www\./, "") || "";
    } catch {
        return "";
    }
}

function deriveNameFromFolderPath(path: string): string {
    const t = path.trim();
    if (!t) return "";
    const parts = t.split(/[/\\]/).filter(Boolean);
    return parts[parts.length - 1] ?? "";
}

export const CreateProjectModal: Component<CreateProjectModalProps> = (
    props,
) => {
    const [createTab, setCreateTab] = createSignal<CreateProjectTab>("url");
    const [urlDraft, setUrlDraft] = createSignal("");
    const [folderPath, setFolderPath] = createSignal("");
    const [nameOverride, setNameOverride] = createSignal<string | null>(null);

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
    }

    function close() {
        props.onOpenChange(false);
    }

    async function pickFolder() {
        try {
            const p = await SelectProjectFolder();
            if (p) setFolderPath(p);
        } catch {
            /* dialog failed */
        }
    }

    function submitCreateProject() {
        const name = resolvedName().trim();
        if (createTab() === "url") {
            const raw = urlDraft().trim();
            if (!raw) return;
            let href: string;
            try {
                const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
                href = u.href;
            } catch {
                alert("That doesn’t look like a valid URL.");
                return;
            }
            props.onOpenChange(false);
            alert(`create project: ${name} from ${href}`);
            return;
        }
        const fp = folderPath().trim();
        if (!fp) {
            alert("Choose a folder first.");
            return;
        }
        props.onOpenChange(false);
        alert(`create project: ${name} from folder ${fp}`);
    }

    function canSubmit(): boolean {
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
            if (e.key === "Escape") props.onOpenChange(false);
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
                    Creating project
                </DialogTitle>
                <form
                    class="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        submitCreateProject();
                    }}
                >
                    <div
                        class="flex rounded-lg bg-slate-900/60 p-0.5"
                        role="tablist"
                        aria-label="Project source"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={createTab() === "url"}
                            class={cn(
                                "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                                createTab() === "url"
                                    ? "bg-slate-700 text-slate-100 shadow-sm"
                                    : "text-slate-400 hover:text-slate-200",
                            )}
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
                            class={cn(
                                "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                                createTab() === "folder"
                                    ? "bg-slate-700 text-slate-100 shadow-sm"
                                    : "text-slate-400 hover:text-slate-200",
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
                        <div>
                            <Label for="create-project-url">
                                Repository URL
                            </Label>
                            <Input
                                id="create-project-url"
                                ref={(el) => {
                                    urlInputRef = el;
                                }}
                                type="url"
                                autocomplete="url"
                                placeholder="https://github.com/org/repo"
                                class="border-slate-600/80 focus-visible:border-sky-500/80"
                                value={urlDraft()}
                                onInput={(e) =>
                                    setUrlDraft(e.currentTarget.value)
                                }
                            />
                        </div>
                    </Show>

                    <Show when={createTab() === "folder"}>
                        <div class="space-y-2">
                            <span class="block text-xs font-medium uppercase tracking-wide text-slate-500">
                                Local folder
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                class="h-auto w-full cursor-pointer justify-start border-slate-600/80 bg-slate-900/50 py-2 text-left font-normal text-slate-200 hover:bg-slate-800/80"
                                onClick={() => void pickFolder()}
                            >
                                {folderPath().trim()
                                    ? folderPath()
                                    : "Choose folder…"}
                            </Button>
                        </div>
                    </Show>

                    <div>
                        <Label for="create-project-name">Name</Label>
                        <Input
                            id="create-project-name"
                            type="text"
                            class="border-slate-600/50 focus-visible:border-sky-500/80"
                            value={resolvedName()}
                            placeholder="Autogenerated from URL or folder"
                            onInput={onNameInput}
                        />
                    </div>

                    <div class="flex justify-end gap-2 pt-1">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => close()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!canSubmit()}
                        >
                            Create project
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
