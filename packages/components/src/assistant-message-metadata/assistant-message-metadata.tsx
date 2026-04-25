import Info from "lucide-solid/icons/info";
import type { Component, JSX } from "solid-js";
import {
    createSignal,
    For,
    onCleanup,
    onMount,
    Show,
} from "solid-js";

export interface MetadataPill {
    label: string;
    value: string;
    /** Tints the value starlight to highlight cost/totals. */
    accent?: boolean;
}

export interface MetadataRow {
    label: string;
    value: string;
}

export interface MetadataSection {
    /** Section title shown as an uppercase heading. */
    heading: string;
    /** Token / cost cards rendered in a 2-column grid. */
    pills?: readonly MetadataPill[];
    /** Single-line label/value rows below the pills. */
    rows?: readonly MetadataRow[];
    /** Optional request id shown in a monospaced block. */
    requestId?: string;
    /** Optional small footnote. */
    footnote?: string;
}

export interface AssistantMessageMetadataButtonProps {
    sections: readonly MetadataSection[];
    /** Override the icon's aria-label. */
    label?: string;
    class?: string;
}

const StatPill: Component<MetadataPill> = (props) => (
    <div class="flex flex-col gap-0.5 rounded-none bg-void-800/60 px-2 py-1.5">
        <span class="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-void-500">
            {props.label}
        </span>
        <span
            class="font-mono text-[11px] font-medium tabular-nums"
            classList={{
                "text-starlight-300": props.accent,
                "text-void-100": !props.accent,
            }}
        >
            {props.value}
        </span>
    </div>
);

const MetaRow: Component<{ label: string; children: JSX.Element }> = (
    props,
) => (
    <div class="flex items-baseline justify-between gap-3">
        <span class="text-[10px] text-void-500">{props.label}</span>
        <span class="font-mono text-[10px] text-void-200 tabular-nums">
            {props.children}
        </span>
    </div>
);

const SectionView: Component<{ section: MetadataSection }> = (props) => (
    <div class="flex flex-col gap-2">
        <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-void-500">
            {props.section.heading}
        </p>
        <Show when={props.section.pills && props.section.pills.length > 0}>
            <div class="grid grid-cols-2 gap-1.5">
                <For each={[...(props.section.pills ?? [])]}>
                    {(p) => (
                        <StatPill
                            label={p.label}
                            value={p.value}
                            accent={p.accent}
                        />
                    )}
                </For>
            </div>
        </Show>
        <Show when={props.section.rows && props.section.rows.length > 0}>
            <div class="flex flex-col gap-1">
                <For each={[...(props.section.rows ?? [])]}>
                    {(r) => <MetaRow label={r.label}>{r.value}</MetaRow>}
                </For>
            </div>
        </Show>
        <Show when={props.section.requestId}>
            <div class="rounded-none bg-void-800/40 px-2 py-1">
                <p class="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-void-500">
                    Request ID
                </p>
                <p class="mt-0.5 break-all font-mono text-[9px] leading-snug text-void-400 select-all">
                    {props.section.requestId}
                </p>
            </div>
        </Show>
        <Show when={props.section.footnote}>
            <p class="text-[9px] leading-snug text-void-500">
                {props.section.footnote}
            </p>
        </Show>
    </div>
);

export const AssistantMessageMetadataButton: Component<
    AssistantMessageMetadataButtonProps
> = (props) => {
    const [open, setOpen] = createSignal(false);

    let buttonEl!: HTMLButtonElement;
    let panelEl!: HTMLDivElement;

    onMount(() => {
        const onDoc = (e: MouseEvent) => {
            if (!open()) return;
            const t = e.target as Node;
            if (buttonEl?.contains(t) || panelEl?.contains(t)) return;
            setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        onCleanup(() => document.removeEventListener("mousedown", onDoc));
    });

    return (
        <Show when={props.sections.length > 0}>
            <div class={`relative inline-flex shrink-0 ${props.class ?? ""}`}>
                <button
                    type="button"
                    ref={(el) => {
                        buttonEl = el;
                    }}
                    class="cursor-pointer rounded-none p-1 text-void-500 transition-colors duration-100 hover:bg-void-800/60 hover:text-void-100"
                    aria-label={props.label ?? "Message details"}
                    aria-expanded={open()}
                    onClick={() => setOpen((v) => !v)}
                >
                    <Info
                        class="size-3.5"
                        stroke-width={2}
                        aria-hidden
                    />
                </button>
                <Show when={open()}>
                    <div
                        ref={(el) => {
                            panelEl = el;
                        }}
                        class="absolute left-0 top-full z-50 mt-1.5 w-[min(17rem,calc(100vw-1rem))] rounded-none border border-void-700 bg-void-900 shadow-2xl shadow-black/50"
                        role="dialog"
                        aria-label="Message usage details"
                    >
                        <div class="flex flex-col gap-3 p-3">
                            <For each={[...props.sections]}>
                                {(section, i) => (
                                    <>
                                        <Show when={i() > 0}>
                                            <div
                                                class="border-t border-void-700"
                                                aria-hidden
                                            />
                                        </Show>
                                        <SectionView section={section} />
                                    </>
                                )}
                            </For>
                        </div>
                    </div>
                </Show>
            </div>
        </Show>
    );
};
