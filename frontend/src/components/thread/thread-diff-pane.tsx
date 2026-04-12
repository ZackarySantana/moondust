import ArrowLeft from "lucide-solid/icons/arrow-left";
import ChevronDown from "lucide-solid/icons/chevron-down";
import ChevronUpNav from "lucide-solid/icons/chevron-up";
import Columns2 from "lucide-solid/icons/columns-2";
import Loader2 from "lucide-solid/icons/loader-2";
import Rows2 from "lucide-solid/icons/rows-2";
import type { Component } from "solid-js";
import { Show } from "solid-js";
import { DiffViewer, type DiffNav } from "@/components/diff-viewer";
import { Kbd } from "@/components/kbd";
import { gitStatusColor } from "@/lib/git-display";
import type { store } from "@wails/go/models";
import type { DiffTarget } from "./types";

export const ThreadDiffPane: Component<{
    target: () => DiffTarget;
    diffLoading: () => boolean;
    diffData: () => store.FileDiff | undefined;
    diffIsError: () => boolean;
    sideBySide: () => boolean;
    setSideBySide: (sideBySide: boolean) => void;
    setDiffNav: (nav: DiffNav | null) => void;
    onClose: () => void;
    onPrevDiff: () => void;
    onNextDiff: () => void;
    formatKey: (id: string) => string;
}> = (props) => {
    return (
        <>
            <div class="flex items-center gap-2 border-b border-slate-800/40 px-4 py-2">
                <button
                    type="button"
                    class="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-slate-200"
                    onClick={props.onClose}
                    title={`Back to chat (${props.formatKey("close_diff")})`}
                >
                    <ArrowLeft
                        class="size-3"
                        stroke-width={2}
                        aria-hidden
                    />
                    Chat
                    <Kbd combo={props.formatKey("close_diff")} />
                </button>
                <span class="text-slate-700">·</span>
                <span
                    class={`font-mono text-[10px] font-bold ${gitStatusColor(props.target().status)}`}
                >
                    {props.target().status === "untracked"
                        ? "?"
                        : props.target().status}
                </span>
                <span class="min-w-0 truncate font-mono text-xs text-slate-300">
                    {props.target().path}
                </span>
                <div class="ml-auto flex items-center gap-1">
                    <button
                        type="button"
                        class="cursor-pointer rounded p-1 text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-200"
                        onClick={props.onPrevDiff}
                        title={`Previous change (${props.formatKey("prev_diff")})`}
                    >
                        <ChevronUpNav
                            class="size-3.5"
                            stroke-width={2}
                            aria-hidden
                        />
                    </button>
                    <button
                        type="button"
                        class="cursor-pointer rounded p-1 text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-200"
                        onClick={props.onNextDiff}
                        title={`Next change (${props.formatKey("next_diff")})`}
                    >
                        <ChevronDown
                            class="size-3.5"
                            stroke-width={2}
                            aria-hidden
                        />
                    </button>
                    <span class="mx-0.5 h-4 w-px bg-slate-800/60" />
                    <button
                        type="button"
                        class={`cursor-pointer rounded p-1 transition-colors ${props.sideBySide() ? "bg-slate-800/50 text-slate-200" : "text-slate-500 hover:text-slate-300"}`}
                        onClick={() => props.setSideBySide(true)}
                        title="Side by side"
                    >
                        <Columns2
                            class="size-3.5"
                            stroke-width={1.5}
                            aria-hidden
                        />
                    </button>
                    <button
                        type="button"
                        class={`cursor-pointer rounded p-1 transition-colors ${!props.sideBySide() ? "bg-slate-800/50 text-slate-200" : "text-slate-500 hover:text-slate-300"}`}
                        onClick={() => props.setSideBySide(false)}
                        title="Inline"
                    >
                        <Rows2
                            class="size-3.5"
                            stroke-width={1.5}
                            aria-hidden
                        />
                    </button>
                </div>
            </div>
            <div class="min-h-0 flex-1 p-2">
                <Show
                    when={!props.diffLoading() && props.diffData()}
                    fallback={
                        <div class="flex h-full items-center justify-center">
                            <Loader2
                                class="size-6 animate-spin text-slate-500"
                                stroke-width={1.5}
                            />
                        </div>
                    }
                >
                    <Show
                        when={props.diffIsError()}
                        fallback={
                            <DiffViewer
                                original={props.diffData()?.original ?? ""}
                                modified={props.diffData()?.modified ?? ""}
                                language={
                                    props.diffData()?.language ?? "plaintext"
                                }
                                path={props.target().path}
                                sideBySide={props.sideBySide()}
                                onReady={props.setDiffNav}
                            />
                        }
                    >
                        <div class="flex h-full items-center justify-center">
                            <p class="text-xs text-red-400">
                                Failed to load diff.
                            </p>
                        </div>
                    </Show>
                </Show>
            </div>
        </>
    );
};
