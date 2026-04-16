import {
    autoUpdate,
    computePosition,
    flip,
    offset,
    shift,
} from "@floating-ui/dom";
import Info from "lucide-solid/icons/info";
import type { Component } from "solid-js";
import { createEffect, createSignal, onCleanup, onMount, Show } from "solid-js";
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

/** Format a delta in plan-usage percentage points (same units as Cursor /usage). */
const formatPercentPointsDelta = (n: number) => {
    const sign = n > 0 ? "+" : "";
    return `${sign}${n.toFixed(2)} pp`;
};

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
                        offset(4),
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

        // Portal + first paint: ensure the floating node has layout before measuring.
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

    return (
        <Show when={assistantMessageHasMetadata(props.msg)}>
            <div class="inline-flex shrink-0">
                <button
                    type="button"
                    ref={(el) => {
                        buttonEl = el;
                    }}
                    class="rounded p-0.5 text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-300"
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
                <Show
                    when={
                        open() &&
                        (or() ||
                            cur() ||
                            cl() ||
                            props.msg.chat_provider === "claude")
                    }
                >
                    <Portal mount={document.body}>
                        <div
                            ref={(el) => {
                                panelEl = el;
                            }}
                            class="fixed z-100 max-w-[min(18rem,calc(100vw-1rem))] rounded-md border border-slate-800/60 bg-slate-950/98 px-3 py-2 text-[11px] text-slate-300 shadow-lg backdrop-blur-sm"
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
                            <Show when={or()}>
                                <p class="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                                    OpenRouter
                                </p>
                                <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[10px]">
                                    <Show when={or()!.prompt_tokens != null}>
                                        <dt class="text-slate-500">
                                            Prompt tokens
                                        </dt>
                                        <dd class="font-mono text-slate-200">
                                            {formatInt(or()!.prompt_tokens!)}
                                        </dd>
                                    </Show>
                                    <Show
                                        when={or()!.completion_tokens != null}
                                    >
                                        <dt class="text-slate-500">
                                            Completion tokens
                                        </dt>
                                        <dd class="font-mono text-slate-200">
                                            {formatInt(
                                                or()!.completion_tokens!,
                                            )}
                                        </dd>
                                    </Show>
                                    <Show when={or()!.total_tokens != null}>
                                        <dt class="text-slate-500">
                                            Total tokens
                                        </dt>
                                        <dd class="font-mono text-slate-200">
                                            {formatInt(or()!.total_tokens!)}
                                        </dd>
                                    </Show>
                                    <Show when={or()!.cost_usd != null}>
                                        <dt class="text-slate-500">Cost</dt>
                                        <dd class="font-mono text-emerald-400/90">
                                            {formatUsd(or()!.cost_usd!)}
                                        </dd>
                                    </Show>
                                    <Show
                                        when={
                                            openRouterSegmentToolCount(or()!) >
                                            0
                                        }
                                    >
                                        <dt class="text-slate-500">
                                            Tool calls
                                        </dt>
                                        <dd class="font-mono text-slate-200">
                                            {formatInt(
                                                openRouterSegmentToolCount(
                                                    or()!,
                                                ),
                                            )}
                                        </dd>
                                    </Show>
                                </dl>
                            </Show>
                            <Show
                                when={
                                    or() &&
                                    (cur() ||
                                        cl() ||
                                        props.msg.chat_provider === "claude")
                                }
                            >
                                <div
                                    class="my-2 border-t border-slate-800/60"
                                    aria-hidden
                                />
                            </Show>
                            <Show when={cur()}>
                                <p class="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                                    Cursor
                                </p>
                                <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[10px]">
                                    <Show when={cur()!.input_tokens != null}>
                                        <dt class="text-slate-500">
                                            Input tokens
                                        </dt>
                                        <dd class="font-mono text-slate-200">
                                            {formatInt(cur()!.input_tokens!)}
                                        </dd>
                                    </Show>
                                    <Show when={cur()!.output_tokens != null}>
                                        <dt class="text-slate-500">
                                            Output tokens
                                        </dt>
                                        <dd class="font-mono text-slate-200">
                                            {formatInt(cur()!.output_tokens!)}
                                        </dd>
                                    </Show>
                                    <Show
                                        when={cur()!.cache_read_tokens != null}
                                    >
                                        <dt class="text-slate-500">
                                            Cache read
                                        </dt>
                                        <dd class="font-mono text-slate-200">
                                            {formatInt(
                                                cur()!.cache_read_tokens!,
                                            )}
                                        </dd>
                                    </Show>
                                    <Show
                                        when={cur()!.cache_write_tokens != null}
                                    >
                                        <dt class="text-slate-500">
                                            Cache write
                                        </dt>
                                        <dd class="font-mono text-slate-200">
                                            {formatInt(
                                                cur()!.cache_write_tokens!,
                                            )}
                                        </dd>
                                    </Show>
                                    <Show
                                        when={
                                            cur()!.plan_auto_percent_delta !=
                                            null
                                        }
                                    >
                                        <dt class="text-slate-500">Auto Δ</dt>
                                        <dd class="font-mono text-slate-200">
                                            {formatPercentPointsDelta(
                                                cur()!.plan_auto_percent_delta!,
                                            )}
                                        </dd>
                                    </Show>
                                    <Show
                                        when={
                                            cur()!.plan_api_percent_delta !=
                                            null
                                        }
                                    >
                                        <dt class="text-slate-500">API Δ</dt>
                                        <dd class="font-mono text-slate-200">
                                            {formatPercentPointsDelta(
                                                cur()!.plan_api_percent_delta!,
                                            )}
                                        </dd>
                                    </Show>
                                    <Show
                                        when={
                                            cur()!.request_id != null &&
                                            cur()!.request_id !== ""
                                        }
                                    >
                                        <dt class="text-slate-500">Request</dt>
                                        <dd class="break-all font-mono text-[10px] text-slate-400">
                                            {cur()!.request_id}
                                        </dd>
                                    </Show>
                                    <Show
                                        when={
                                            (cur()!.tool_calls?.length ?? 0) > 0
                                        }
                                    >
                                        <dt class="text-slate-500">
                                            Tool calls
                                        </dt>
                                        <dd class="font-mono text-slate-200">
                                            {formatInt(
                                                cur()!.tool_calls!.length,
                                            )}
                                        </dd>
                                    </Show>
                                </dl>
                                <p class="mt-2 text-[9px] leading-snug text-slate-600">
                                    Auto/API deltas are the change in plan usage
                                    percentages around this request (same
                                    buckets as Settings → Cursor). Other Cursor
                                    activity can affect them.
                                </p>
                            </Show>
                            <Show
                                when={
                                    (cur() || or()) &&
                                    props.msg.chat_provider === "claude"
                                }
                            >
                                <div
                                    class="my-2 border-t border-slate-800/60"
                                    aria-hidden
                                />
                            </Show>
                            <Show when={props.msg.chat_provider === "claude"}>
                                <p class="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                                    Claude Code
                                </p>
                                <Show
                                    when={hasClaudeMeta(
                                        props.msg.metadata?.claude,
                                    )}
                                >
                                    <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[10px]">
                                        <Show when={cl()!.input_tokens != null}>
                                            <dt class="text-slate-500">
                                                Input tokens
                                            </dt>
                                            <dd class="font-mono text-slate-200">
                                                {formatInt(cl()!.input_tokens!)}
                                            </dd>
                                        </Show>
                                        <Show
                                            when={cl()!.output_tokens != null}
                                        >
                                            <dt class="text-slate-500">
                                                Output tokens
                                            </dt>
                                            <dd class="font-mono text-slate-200">
                                                {formatInt(
                                                    cl()!.output_tokens!,
                                                )}
                                            </dd>
                                        </Show>
                                        <Show
                                            when={
                                                cl()!.cache_read_tokens != null
                                            }
                                        >
                                            <dt class="text-slate-500">
                                                Cache read
                                            </dt>
                                            <dd class="font-mono text-slate-200">
                                                {formatInt(
                                                    cl()!.cache_read_tokens!,
                                                )}
                                            </dd>
                                        </Show>
                                        <Show
                                            when={
                                                cl()!.cache_write_tokens != null
                                            }
                                        >
                                            <dt class="text-slate-500">
                                                Cache write
                                            </dt>
                                            <dd class="font-mono text-slate-200">
                                                {formatInt(
                                                    cl()!.cache_write_tokens!,
                                                )}
                                            </dd>
                                        </Show>
                                        <Show
                                            when={
                                                cl()!.request_id != null &&
                                                cl()!.request_id !== ""
                                            }
                                        >
                                            <dt class="text-slate-500">
                                                Request
                                            </dt>
                                            <dd class="break-all font-mono text-[10px] text-slate-400">
                                                {cl()!.request_id}
                                            </dd>
                                        </Show>
                                        <Show
                                            when={
                                                (cl()!.tool_calls?.length ??
                                                    0) > 0
                                            }
                                        >
                                            <dt class="text-slate-500">
                                                Tool calls
                                            </dt>
                                            <dd class="font-mono text-slate-200">
                                                {formatInt(
                                                    cl()!.tool_calls!.length,
                                                )}
                                            </dd>
                                        </Show>
                                    </dl>
                                </Show>
                                <Show
                                    when={
                                        !hasClaudeMeta(
                                            props.msg.metadata?.claude,
                                        )
                                    }
                                >
                                    <p class="text-[10px] leading-snug text-slate-500">
                                        No usage details were stored for this
                                        reply.
                                    </p>
                                </Show>
                            </Show>
                        </div>
                    </Portal>
                </Show>
            </div>
        </Show>
    );
};
