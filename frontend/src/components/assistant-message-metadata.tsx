import {
    autoUpdate,
    computePosition,
    flip,
    offset,
    shift,
} from "@floating-ui/dom";
import Info from "lucide-solid/icons/info";
import type { Component, JSX } from "solid-js";
import { createEffect, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";
import type { store } from "@wails/go/models";

function openRouterSegmentToolCount(
    m: store.OpenRouterChatMessageMetadata | undefined,
): number {
    const segs = m?.segments;
    if (!segs?.length) return 0;
    return segs.filter((s) => (s.tool?.name ?? "").trim().length > 0).length;
}

function hasOpenRouterMeta(
    m: store.OpenRouterChatMessageMetadata | undefined,
): boolean {
    if (!m) return false;
    return (
        m.prompt_tokens != null ||
        m.completion_tokens != null ||
        m.total_tokens != null ||
        m.cost_usd != null ||
        openRouterSegmentToolCount(m) > 0
    );
}

function hasCursorMeta(
    m: store.CursorChatMessageMetadata | undefined,
): boolean {
    if (!m) return false;
    return (
        m.input_tokens != null ||
        m.output_tokens != null ||
        m.cache_read_tokens != null ||
        m.cache_write_tokens != null ||
        (m.request_id != null && m.request_id !== "") ||
        m.plan_auto_percent_delta != null ||
        m.plan_api_percent_delta != null ||
        (m.tool_calls != null && m.tool_calls.length > 0)
    );
}

function hasClaudeMeta(
    m: store.ClaudeChatMessageMetadata | undefined,
): boolean {
    if (!m) return false;
    return (
        m.input_tokens != null ||
        m.output_tokens != null ||
        m.cache_read_tokens != null ||
        m.cache_write_tokens != null ||
        (m.request_id != null && m.request_id !== "") ||
        (m.tool_calls != null && m.tool_calls.length > 0)
    );
}

/** True when this assistant message has any provider metadata to show. */
export function assistantMessageHasMetadata(msg: store.ChatMessage): boolean {
    if (msg.role !== "assistant") return false;
    if (msg.chat_provider === "claude") return true;
    return (
        hasOpenRouterMeta(msg.metadata?.openrouter) ||
        hasCursorMeta(msg.metadata?.cursor) ||
        hasClaudeMeta(msg.metadata?.claude)
    );
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

const formatPercentPointsDelta = (n: number) => {
    const sign = n > 0 ? "+" : "";
    return `${sign}${n.toFixed(2)} pp`;
};

/* ------------------------------------------------------------------ */
/*  Reusable sub-components for the popover interior                  */
/* ------------------------------------------------------------------ */

const StatPill: Component<{ label: string; value: string; accent?: boolean }> = (props) => (
    <div class="flex flex-col gap-0.5 rounded-md bg-slate-800/40 px-2 py-1.5">
        <span class="text-[9px] font-medium uppercase tracking-widest text-slate-600">
            {props.label}
        </span>
        <span
            class="font-mono text-[11px] font-medium"
            classList={{
                "text-emerald-400/90": props.accent,
                "text-slate-200": !props.accent,
            }}
        >
            {props.value}
        </span>
    </div>
);

const MetaRow: Component<{ label: string; children: JSX.Element }> = (props) => (
    <div class="flex items-baseline justify-between gap-3">
        <span class="text-[10px] text-slate-500">{props.label}</span>
        <span class="font-mono text-[10px] text-slate-300">{props.children}</span>
    </div>
);

const SectionHeading: Component<{ children: JSX.Element }> = (props) => (
    <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        {props.children}
    </p>
);

const SectionDivider = () => (
    <div class="border-t border-slate-800/40" aria-hidden />
);

/* ------------------------------------------------------------------ */
/*  OpenRouter section                                                */
/* ------------------------------------------------------------------ */

const OpenRouterSection: Component<{ m: store.OpenRouterChatMessageMetadata }> = (props) => {
    const pills = () => {
        const items: { label: string; value: string; accent?: boolean }[] = [];
        if (props.m.prompt_tokens != null)
            items.push({ label: "In", value: formatInt(props.m.prompt_tokens) });
        if (props.m.completion_tokens != null)
            items.push({ label: "Out", value: formatInt(props.m.completion_tokens) });
        if (props.m.total_tokens != null)
            items.push({ label: "Total", value: formatInt(props.m.total_tokens) });
        if (props.m.cost_usd != null)
            items.push({ label: "Cost", value: formatUsd(props.m.cost_usd), accent: true });
        return items;
    };
    const toolCount = () => openRouterSegmentToolCount(props.m);

    return (
        <div class="flex flex-col gap-2">
            <SectionHeading>OpenRouter</SectionHeading>
            <Show when={pills().length > 0}>
                <div class="grid grid-cols-2 gap-1.5">
                    <For each={pills()}>
                        {(p) => <StatPill label={p.label} value={p.value} accent={p.accent} />}
                    </For>
                </div>
            </Show>
            <Show when={toolCount() > 0}>
                <MetaRow label="Tool calls">{formatInt(toolCount())}</MetaRow>
            </Show>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Cursor section                                                    */
/* ------------------------------------------------------------------ */

const CursorSection: Component<{ m: store.CursorChatMessageMetadata }> = (props) => {
    const tokenPills = () => {
        const items: { label: string; value: string }[] = [];
        if (props.m.input_tokens != null)
            items.push({ label: "In", value: formatInt(props.m.input_tokens) });
        if (props.m.output_tokens != null)
            items.push({ label: "Out", value: formatInt(props.m.output_tokens) });
        if (props.m.cache_read_tokens != null)
            items.push({ label: "Cache R", value: formatInt(props.m.cache_read_tokens) });
        if (props.m.cache_write_tokens != null)
            items.push({ label: "Cache W", value: formatInt(props.m.cache_write_tokens) });
        return items;
    };

    return (
        <div class="flex flex-col gap-2">
            <SectionHeading>Cursor</SectionHeading>
            <Show when={tokenPills().length > 0}>
                <div class="grid grid-cols-2 gap-1.5">
                    <For each={tokenPills()}>
                        {(p) => <StatPill label={p.label} value={p.value} />}
                    </For>
                </div>
            </Show>
            <div class="flex flex-col gap-1">
                <Show when={props.m.plan_auto_percent_delta != null}>
                    <MetaRow label="Auto usage">
                        {formatPercentPointsDelta(props.m.plan_auto_percent_delta!)}
                    </MetaRow>
                </Show>
                <Show when={props.m.plan_api_percent_delta != null}>
                    <MetaRow label="API usage">
                        {formatPercentPointsDelta(props.m.plan_api_percent_delta!)}
                    </MetaRow>
                </Show>
                <Show when={(props.m.tool_calls?.length ?? 0) > 0}>
                    <MetaRow label="Tool calls">
                        {formatInt(props.m.tool_calls!.length)}
                    </MetaRow>
                </Show>
                <Show when={props.m.request_id != null && props.m.request_id !== ""}>
                    <div class="mt-1 rounded-md bg-slate-800/30 px-2 py-1">
                        <p class="text-[9px] font-medium uppercase tracking-widest text-slate-600">
                            Request ID
                        </p>
                        <p class="mt-0.5 break-all font-mono text-[9px] leading-snug text-slate-500 select-all">
                            {props.m.request_id}
                        </p>
                    </div>
                </Show>
            </div>
            <p class="text-[9px] leading-snug text-slate-600">
                Usage deltas match Settings &rarr; Cursor plan buckets. Other activity may affect them.
            </p>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Claude Code section                                               */
/* ------------------------------------------------------------------ */

const ClaudeSection: Component<{
    m: store.ClaudeChatMessageMetadata | undefined;
    chatProvider: string;
}> = (props) => {
    const hasMeta = () => hasClaudeMeta(props.m);

    const tokenPills = () => {
        if (!props.m) return [];
        const items: { label: string; value: string }[] = [];
        if (props.m.input_tokens != null)
            items.push({ label: "In", value: formatInt(props.m.input_tokens) });
        if (props.m.output_tokens != null)
            items.push({ label: "Out", value: formatInt(props.m.output_tokens) });
        if (props.m.cache_read_tokens != null)
            items.push({ label: "Cache R", value: formatInt(props.m.cache_read_tokens) });
        if (props.m.cache_write_tokens != null)
            items.push({ label: "Cache W", value: formatInt(props.m.cache_write_tokens) });
        return items;
    };

    return (
        <div class="flex flex-col gap-2">
            <SectionHeading>Claude Code</SectionHeading>
            <Show
                when={hasMeta()}
                fallback={
                    <p class="text-[10px] leading-snug text-slate-600">
                        No usage details stored for this reply.
                    </p>
                }
            >
                <Show when={tokenPills().length > 0}>
                    <div class="grid grid-cols-2 gap-1.5">
                        <For each={tokenPills()}>
                            {(p) => <StatPill label={p.label} value={p.value} />}
                        </For>
                    </div>
                </Show>
                <div class="flex flex-col gap-1">
                    <Show when={(props.m!.tool_calls?.length ?? 0) > 0}>
                        <MetaRow label="Tool calls">
                            {formatInt(props.m!.tool_calls!.length)}
                        </MetaRow>
                    </Show>
                    <Show when={props.m?.request_id != null && props.m!.request_id !== ""}>
                        <div class="mt-1 rounded-md bg-slate-800/30 px-2 py-1">
                            <p class="text-[9px] font-medium uppercase tracking-widest text-slate-600">
                                Request ID
                            </p>
                            <p class="mt-0.5 break-all font-mono text-[9px] leading-snug text-slate-500 select-all">
                                {props.m!.request_id}
                            </p>
                        </div>
                    </Show>
                </div>
            </Show>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Main button + popover                                             */
/* ------------------------------------------------------------------ */

export const AssistantMessageMetadataButton: Component<{
    msg: store.ChatMessage;
}> = (props) => {
    const [open, setOpen] = createSignal(false);
    const [pos, setPos] = createSignal<{ x: number; y: number } | null>(null);

    let buttonEl!: HTMLButtonElement;
    let panelEl!: HTMLDivElement;

    onMount(() => {
        const onDoc = (e: MouseEvent) => {
            if (!open()) return;
            const t = e.target as Node;
            if (buttonEl?.contains(t) || panelEl?.contains(t)) return;
            setOpen(false);
            setPos(null);
        };
        document.addEventListener("mousedown", onDoc);
        onCleanup(() => document.removeEventListener("mousedown", onDoc));
    });

    createEffect(() => {
        if (!open()) {
            setPos(null);
            return;
        }

        let stopAutoUpdate: (() => void) | undefined;
        let cancelled = false;
        let rafOuter = 0;
        let rafInner = 0;

        const start = () => {
            const reference = buttonEl;
            const floating = panelEl;
            if (!reference || !floating || cancelled) return;

            async function updatePosition() {
                const { x, y } = await computePosition(reference, floating, {
                    placement: "bottom-start",
                    strategy: "fixed",
                    middleware: [
                        offset(6),
                        flip({
                            padding: 8,
                            fallbackPlacements: [
                                "top-start",
                                "bottom-end",
                                "top-end",
                                "left-start",
                                "right-start",
                            ],
                        }),
                        shift({
                            padding: 8,
                            crossAxis: true,
                        }),
                    ],
                });
                if (!cancelled) {
                    setPos({ x, y });
                }
            }

            void updatePosition();
            stopAutoUpdate = autoUpdate(reference, floating, () => {
                void updatePosition();
            });
        };

        rafOuter = requestAnimationFrame(() => {
            rafInner = requestAnimationFrame(start);
        });

        onCleanup(() => {
            cancelled = true;
            cancelAnimationFrame(rafOuter);
            cancelAnimationFrame(rafInner);
            stopAutoUpdate?.();
            setPos(null);
        });
    });

    const or = () => props.msg.metadata?.openrouter;
    const cur = () => props.msg.metadata?.cursor;
    const cl = () => props.msg.metadata?.claude;

    const showOr = () => hasOpenRouterMeta(or());
    const showCur = () => hasCursorMeta(cur());
    const showCl = () => props.msg.chat_provider === "claude";

    const sectionCount = () =>
        (showOr() ? 1 : 0) + (showCur() ? 1 : 0) + (showCl() ? 1 : 0);

    return (
        <Show when={assistantMessageHasMetadata(props.msg)}>
            <div class="inline-flex shrink-0">
                <button
                    type="button"
                    ref={(el) => {
                        buttonEl = el;
                    }}
                    class="rounded-md p-1 text-slate-600 transition-all duration-150 hover:bg-slate-800/50 hover:text-slate-300"
                    aria-label="Message details"
                    aria-expanded={open()}
                    onClick={() => {
                        if (open()) {
                            setOpen(false);
                            setPos(null);
                        } else {
                            setOpen(true);
                        }
                    }}
                >
                    <Info
                        class="size-3.5"
                        stroke-width={2}
                        aria-hidden
                    />
                </button>
                <Show when={open() && sectionCount() > 0}>
                    <Portal mount={document.body}>
                        <div
                            ref={(el) => {
                                panelEl = el;
                            }}
                            class="fixed z-100 w-[min(17rem,calc(100vw-1rem))] animate-scale-in rounded-lg border border-slate-800/50 bg-slate-950 shadow-xl shadow-black/30 backdrop-blur-sm"
                            style={{
                                left:
                                    pos() != null ? `${pos()!.x}px` : "-9999px",
                                top: pos() != null ? `${pos()!.y}px` : "0px",
                                visibility:
                                    pos() != null ? "visible" : "hidden",
                            }}
                            role="dialog"
                            aria-label="Message usage details"
                        >
                            <div class="flex flex-col gap-3 p-3">
                                <Show when={showOr()}>
                                    <OpenRouterSection m={or()!} />
                                </Show>
                                <Show when={showOr() && (showCur() || showCl())}>
                                    <SectionDivider />
                                </Show>
                                <Show when={showCur()}>
                                    <CursorSection m={cur()!} />
                                </Show>
                                <Show when={showCur() && showCl()}>
                                    <SectionDivider />
                                </Show>
                                <Show when={showCl()}>
                                    <ClaudeSection m={cl()} chatProvider={props.msg.chat_provider ?? ""} />
                                </Show>
                            </div>
                        </div>
                    </Portal>
                </Show>
            </div>
        </Show>
    );
};
