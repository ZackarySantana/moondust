import Info from "lucide-solid/icons/info";
import type { Component } from "solid-js";
import { createMemo, createSignal, onCleanup, onMount, Show } from "solid-js";
import type { store } from "@wails/go/models";

function hasOpenRouterMeta(
    m: store.OpenRouterChatMessageMetadata | undefined,
): boolean {
    if (!m) return false;
    return (
        m.prompt_tokens != null ||
        m.completion_tokens != null ||
        m.total_tokens != null ||
        m.cost_usd != null ||
        (m.tool_calls != null && m.tool_calls.length > 0)
    );
}

/** True when this assistant message has any provider metadata to show. */
export function assistantMessageHasMetadata(msg: store.ChatMessage): boolean {
    if (msg.role !== "assistant") return false;
    return hasOpenRouterMeta(msg.metadata?.openrouter);
}

const formatUsd = (n: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
    }).format(n);

const formatInt = (n: number) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);

export const AssistantMessageMetadataButton: Component<{
    msg: store.ChatMessage;
}> = (props) => {
    const [open, setOpen] = createSignal(false);
    let root!: HTMLDivElement;

    onMount(() => {
        const onDoc = (e: MouseEvent) => {
            if (!open()) return;
            const t = e.target as Node;
            if (root?.contains(t)) return;
            setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        onCleanup(() => document.removeEventListener("mousedown", onDoc));
    });

    const or = () => props.msg.metadata?.openrouter;

    const panel = createMemo(() => {
        if (!open() || !or()) return null;
        const m = or()!;
        return (
            <div
                class="absolute left-0 top-full z-40 mt-1 w-[min(16rem,calc(100vw-2rem))] rounded-md border border-slate-800/60 bg-slate-950/98 px-3 py-2 text-[11px] text-slate-300 shadow-lg backdrop-blur-sm"
                role="dialog"
                aria-label="OpenRouter usage"
            >
                <p class="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    OpenRouter
                </p>
                <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[10px]">
                    <Show when={m.prompt_tokens != null}>
                        <dt class="text-slate-500">Prompt tokens</dt>
                        <dd class="font-mono text-slate-200">
                            {formatInt(m.prompt_tokens!)}
                        </dd>
                    </Show>
                    <Show when={m.completion_tokens != null}>
                        <dt class="text-slate-500">Completion tokens</dt>
                        <dd class="font-mono text-slate-200">
                            {formatInt(m.completion_tokens!)}
                        </dd>
                    </Show>
                    <Show when={m.total_tokens != null}>
                        <dt class="text-slate-500">Total tokens</dt>
                        <dd class="font-mono text-slate-200">
                            {formatInt(m.total_tokens!)}
                        </dd>
                    </Show>
                    <Show when={m.cost_usd != null}>
                        <dt class="text-slate-500">Cost</dt>
                        <dd class="font-mono text-emerald-400/90">
                            {formatUsd(m.cost_usd!)}
                        </dd>
                    </Show>
                    <Show when={(m.tool_calls?.length ?? 0) > 0}>
                        <dt class="text-slate-500">Tool calls</dt>
                        <dd class="font-mono text-slate-200">
                            {formatInt(m.tool_calls!.length)}
                        </dd>
                    </Show>
                </dl>
            </div>
        );
    });

    return (
        <Show when={assistantMessageHasMetadata(props.msg)}>
            <div
                class="relative inline-flex shrink-0"
                ref={root}
            >
                <button
                    type="button"
                    class="rounded p-0.5 text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-300"
                    aria-label="Message details"
                    aria-expanded={open()}
                    onClick={() => setOpen(!open())}
                >
                    <Info
                        class="size-3.5"
                        stroke-width={2}
                        aria-hidden
                    />
                </button>
                {panel()}
            </div>
        </Show>
    );
};
