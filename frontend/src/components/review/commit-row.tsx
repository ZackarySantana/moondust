import type { Component } from "solid-js";
import { Show } from "solid-js";
import { openExternalURL } from "@/lib/open-external-url";
import type { store } from "@wails/go/models";

export const CommitRow: Component<{
    commit: store.GitCommitSummary;
    githubURL: string | null;
}> = (props) => {
    async function copyHash() {
        await navigator.clipboard.writeText(props.commit.hash);
    }

    async function copyExactDate() {
        if (props.commit.exact_date) {
            await navigator.clipboard.writeText(props.commit.exact_date);
        }
    }

    function openOnGitHub() {
        if (props.githubURL) {
            openExternalURL(
                `${props.githubURL}/commit/${props.commit.hash}`,
            );
        }
    }

    return (
        <div class="group flex flex-col gap-0.5 rounded px-1.5 py-1 transition-colors hover:bg-slate-800/30">
            <div class="flex items-center gap-1.5">
                <button
                    type="button"
                    class="cursor-pointer font-mono text-[10px] text-violet-400 transition-colors hover:text-violet-300"
                    onClick={() => void copyHash()}
                    title="Copy hash"
                >
                    {props.commit.hash}
                </button>
                <span class="text-slate-700">·</span>
                <button
                    type="button"
                    class="cursor-pointer text-[10px] text-slate-500 transition-colors hover:text-slate-300"
                    onClick={() => void copyExactDate()}
                    title={props.commit.exact_date || props.commit.when}
                >
                    {props.commit.when}
                </button>
            </div>
            <Show
                when={props.githubURL}
                fallback={
                    <p class="text-[11px] text-slate-200">
                        {props.commit.subject}
                    </p>
                }
            >
                <button
                    type="button"
                    class="cursor-pointer text-left text-[11px] text-slate-200 transition-colors hover:text-sky-300"
                    onClick={openOnGitHub}
                    title="Open on GitHub"
                >
                    {props.commit.subject}
                </button>
            </Show>
            <p class="text-[10px] text-slate-600">{props.commit.author}</p>
        </div>
    );
};
