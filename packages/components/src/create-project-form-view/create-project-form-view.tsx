import Loader2 from "lucide-solid/icons/loader-2";
import { Show, type Component } from "solid-js";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTitle,
} from "../dialog/dialog";
import { Button } from "../button/button";
import { Input } from "../input/input";
import { Label } from "../label/label";
import { cn } from "../utils";

export type CreateProjectTab = "url" | "folder";

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
    setUrlInputRef?: (el: HTMLInputElement) => void;
}

export const CreateProjectFormView: Component<CreateProjectFormViewProps> = (
    props,
) => {
    return (
        <Dialog
            open={props.open}
            onEscapeKeyDown={() => {
                if (!props.submitting) props.onCancel();
            }}
        >
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
                        class="flex border border-void-700 bg-void-950/40"
                        role="tablist"
                        aria-label="Project source"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={props.tab === "url"}
                            class={cn(
                                "flex-1 cursor-pointer rounded-none px-3 py-2 text-[12px] font-medium uppercase tracking-[0.14em] transition-colors duration-100 disabled:cursor-not-allowed",
                                props.tab === "url"
                                    ? "bg-void-800 text-starlight-300"
                                    : "text-void-500 hover:bg-void-800/60 hover:text-void-200",
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
                                "flex-1 cursor-pointer rounded-none border-l border-void-700 px-3 py-2 text-[12px] font-medium uppercase tracking-[0.14em] transition-colors duration-100 disabled:cursor-not-allowed",
                                props.tab === "folder"
                                    ? "bg-void-800 text-starlight-300"
                                    : "text-void-500 hover:bg-void-800/60 hover:text-void-200",
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
                                    class="h-auto w-full cursor-pointer justify-start py-2.5 text-left font-mono font-normal text-void-200 hover:bg-void-800/60"
                                    onClick={() => props.onPickFolder()}
                                >
                                    {props.folderPath.trim()
                                        ? props.folderPath
                                        : "Choose folder…"}
                                </Button>
                            </div>
                            <div class="space-y-1.5">
                                <Label for="create-project-default-branch">
                                    Default branch (remote ref)
                                </Label>
                                <Input
                                    id="create-project-default-branch"
                                    type="text"
                                    autocomplete="off"
                                    placeholder="origin/main"
                                    value={props.folderDefaultBranch}
                                    disabled={props.submitting}
                                    onInput={(e) =>
                                        props.onFolderDefaultBranch(
                                            e.currentTarget.value,
                                        )
                                    }
                                />
                                <p class="text-[11px] text-void-500">
                                    Which branch represents the main line of
                                    development for this repo (often{" "}
                                    <code class="font-mono text-[11px] text-nebula-300">
                                        main
                                    </code>{" "}
                                    or{" "}
                                    <code class="font-mono text-[11px] text-nebula-300">
                                        master
                                    </code>
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
