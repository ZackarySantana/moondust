import Loader2 from "lucide-solid/icons/loader-2";
import { Show, type Component } from "solid-js";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateProjectTab } from "@/lib/create-project";
import { cn } from "@/lib/utils";

export interface CreateProjectFormViewProps {
    open: boolean;
    tab: CreateProjectTab;
    urlDraft: string;
    folderPath: string;
    folderDefaultBranch: string;
    resolvedName: string;
    submitting: boolean;
    canSubmit: boolean;
    onTabChange: (tab: CreateProjectTab) => void;
    onUrlDraft: (v: string) => void;
    onFolderDefaultBranch: (v: string) => void;
    onNameInput: (e: InputEvent & { currentTarget: HTMLInputElement }) => void;
    onPickFolder: () => void;
    onSubmit: (e: Event) => void;
    onCancel: () => void;
    setUrlInputRef: (el: HTMLInputElement) => void;
}

export const CreateProjectFormView: Component<CreateProjectFormViewProps> = (
    props,
) => {
    return (
        <Dialog open={props.open}>
            <DialogOverlay
                aria-label="Close dialog"
                onClick={() => props.onCancel()}
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
                    aria-busy={props.submitting}
                    onSubmit={props.onSubmit}
                >
                    <div
                        class="flex rounded-lg bg-slate-950/60 p-1"
                        role="tablist"
                        aria-label="Project source"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={props.tab === "url"}
                            class={cn(
                                "flex-1 cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-medium transition-all duration-150 disabled:cursor-not-allowed",
                                props.tab === "url"
                                    ? "bg-slate-800/80 text-slate-100 shadow-sm"
                                    : "text-slate-500 hover:text-slate-300",
                            )}
                            disabled={props.submitting}
                            onClick={() => props.onTabChange("url")}
                        >
                            URL
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={props.tab === "folder"}
                            disabled={props.submitting}
                            class={cn(
                                "flex-1 cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-medium transition-all duration-150 disabled:cursor-not-allowed",
                                props.tab === "folder"
                                    ? "bg-slate-800/80 text-slate-100 shadow-sm"
                                    : "text-slate-500 hover:text-slate-300",
                            )}
                            onClick={() => props.onTabChange("folder")}
                        >
                            Folder
                        </button>
                    </div>

                    <Show when={props.tab === "url"}>
                        <div class="space-y-1.5">
                            <Label for="create-project-url">
                                Repository URL
                            </Label>
                            <Input
                                id="create-project-url"
                                ref={props.setUrlInputRef}
                                type="text"
                                autocomplete="off"
                                placeholder="https://github.com/org/repo"
                                value={props.urlDraft}
                                disabled={props.submitting}
                                onInput={(e) =>
                                    props.onUrlDraft(e.currentTarget.value)
                                }
                            />
                        </div>
                    </Show>

                    <Show when={props.tab === "folder"}>
                        <div class="space-y-4">
                            <div class="space-y-1.5">
                                <Label>Local folder</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={props.submitting}
                                    class="h-auto w-full cursor-pointer justify-start bg-slate-950/40 py-2.5 text-left font-normal text-slate-300 hover:bg-slate-900/60"
                                    onClick={() => props.onPickFolder()}
                                >
                                    {props.folderPath.trim()
                                        ? props.folderPath
                                        : "Choose folder…"}
                                </Button>
                            </div>
                            <div class="space-y-1.5">
                                <Label for="create-project-default-branch">
                                    Default branch
                                </Label>
                                <Input
                                    id="create-project-default-branch"
                                    type="text"
                                    autocomplete="off"
                                    placeholder="main"
                                    value={props.folderDefaultBranch}
                                    disabled={props.submitting}
                                    onInput={(e) =>
                                        props.onFolderDefaultBranch(
                                            e.currentTarget.value,
                                        )
                                    }
                                />
                                <p class="text-[11px] text-slate-600">
                                    Which branch represents the main line of
                                    development for this repo (often{" "}
                                    <span class="font-mono text-slate-500">
                                        main
                                    </span>{" "}
                                    or{" "}
                                    <span class="font-mono text-slate-500">
                                        master
                                    </span>
                                    ).
                                </p>
                            </div>
                        </div>
                    </Show>

                    <div class="space-y-1.5">
                        <Label for="create-project-name">Name</Label>
                        <Input
                            id="create-project-name"
                            type="text"
                            value={props.resolvedName}
                            placeholder="Derived from source"
                            disabled={props.submitting}
                            onInput={props.onNameInput}
                        />
                    </div>

                    <div class="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => props.onCancel()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            class="inline-flex min-w-36 items-center justify-center gap-2"
                            disabled={props.submitting || !props.canSubmit}
                            aria-busy={props.submitting}
                        >
                            <Show
                                when={props.submitting}
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
