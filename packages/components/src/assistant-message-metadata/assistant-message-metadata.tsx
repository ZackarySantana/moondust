import Info from "lucide-solid/icons/info";
import type { Component } from "solid-js";
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
}

export interface MetadataRow {
    label: string;
    value: string;
}

export interface MetadataHero {
    /** Small uppercase label, e.g. "Total cost". */
    label: string;
    /** Big mono value, e.g. "$0.0124". */
    value: string;
}

export interface MetadataSection {
    /** Primary section title, typically the provider name. */
    heading: string;
    /** Optional secondary identifier, typically the model id. Rendered in mono. */
    subheading?: string;
    /** Optional hero stat shown at the top of the section in starlight mono. */
    hero?: MetadataHero;
    /** Optional token counts shown in a 1-4 column strip. */
    pills?: readonly MetadataPill[];
    /** Optional key/value rows rendered as a definition list. */
    rows?: readonly MetadataRow[];
    /** Optional provider request id rendered in a monospaced selectable block. */
    requestId?: string;
    /** Optional small footnote at the bottom of the section. */
    footnote?: string;
}

export interface AssistantMessageMetadataButtonProps {
    sections: readonly MetadataSection[];
    /** Optional inline text rendered next to the trigger icon (e.g. total cost). */
    summary?: string;
    /** Override the trigger's aria-label. */
    label?: string;
    class?: string;
}

const SectionView: Component<{ section: MetadataSection }> = (props) => {
    const pillCount = () => props.section.pills?.length ?? 0;
    return (
        <div class="flex flex-col">
            <Show
                when={props.section.hero}
                fallback={
                    <header class="px-3.5 py-3">
                        <p class="text-[13px] font-semibold text-void-50">
                            {props.section.heading}
                        </p>
                        <Show when={props.section.subheading}>
                            <code class="mt-0.5 block font-mono text-[11px] text-nebula-300">
                                {props.section.subheading}
                            </code>
                        </Show>
                    </header>
                }
            >
                {(hero) => (
                    <header class="bg-void-850 px-3.5 py-2.5">
                        <p class="text-[10px] font-medium uppercase tracking-[0.14em] text-void-400">
                            {hero().label}
                        </p>
                        <p class="mt-0.5 font-mono text-2xl font-semibold tabular-nums leading-none text-starlight-300">
                            {hero().value}
                        </p>
                        <p class="mt-2 flex flex-wrap items-center gap-x-1.5 text-[11px] text-void-400">
                            <span>{props.section.heading}</span>
                            <Show when={props.section.subheading}>
                                <span class="text-void-600">·</span>
                                <code class="font-mono text-nebula-300">
                                    {props.section.subheading}
                                </code>
                            </Show>
                        </p>
                    </header>
                )}
            </Show>

            <Show when={pillCount() > 0}>
                <div
                    class="grid gap-px border-t border-void-700 bg-void-700"
                    style={{
                        "grid-template-columns": `repeat(${Math.min(
                            pillCount(),
                            4,
                        )}, minmax(0, 1fr))`,
                    }}
                >
                    <For each={[...(props.section.pills ?? [])]}>
                        {(p) => (
                            <div class="flex min-w-0 flex-col gap-0.5 overflow-hidden bg-void-900 px-2 py-2">
                                <span class="text-[10px] uppercase tracking-[0.1em] text-void-400">
                                    {p.label}
                                </span>
                                <span
                                    class="truncate font-mono text-[12px] font-medium tabular-nums text-void-100"
                                    title={p.value}
                                >
                                    {p.value}
                                </span>
                            </div>
                        )}
                    </For>
                </div>
            </Show>

            <Show when={props.section.rows && props.section.rows.length > 0}>
                <dl class="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 border-t border-void-700 px-3.5 py-3 text-[12px]">
                    <For each={[...(props.section.rows ?? [])]}>
                        {(r) => (
                            <>
                                <dt class="text-void-400">{r.label}</dt>
                                <dd class="font-mono tabular-nums text-void-100">
                                    {r.value}
                                </dd>
                            </>
                        )}
                    </For>
                </dl>
            </Show>

            <Show when={props.section.requestId}>
                <div class="border-t border-void-700 px-3.5 py-2.5">
                    <p class="text-[10px] uppercase tracking-[0.12em] text-void-400">
                        Request ID
                    </p>
                    <p class="mt-0.5 break-all font-mono text-[11px] text-void-200 select-all">
                        {props.section.requestId}
                    </p>
                </div>
            </Show>

            <Show when={props.section.footnote}>
                <p class="border-t border-void-700 px-3.5 py-2 text-[11px] leading-snug text-void-400">
                    {props.section.footnote}
                </p>
            </Show>
        </div>
    );
};

export interface MetadataPopoverPanelProps {
    sections: readonly MetadataSection[];
    class?: string;
}

/**
 * The content of the metadata popover, rendered without the trigger button.
 * Useful for stories, embedded panels, or any context where the popover
 * affordance is not needed.
 */
export const MetadataPopoverPanel: Component<MetadataPopoverPanelProps> = (
    props,
) => (
    <div
        class={`rounded-none border border-void-700 bg-void-900 ${props.class ?? ""}`}
        role="group"
        aria-label="Message usage details"
    >
        <For each={[...props.sections]}>
            {(section, i) => (
                <>
                    <Show when={i() > 0}>
                        <div
                            class="border-t-2 border-void-700"
                            aria-hidden
                        />
                    </Show>
                    <SectionView section={section} />
                </>
            )}
        </For>
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
                    class="inline-flex cursor-pointer items-center gap-1.5 rounded-none px-1.5 py-1 text-void-500 transition-colors duration-100 hover:bg-void-800/60 hover:text-void-100"
                    aria-label={props.label ?? "Message details"}
                    aria-expanded={open()}
                    onClick={() => setOpen((v) => !v)}
                >
                    <Info
                        class="size-3.5 shrink-0"
                        stroke-width={2}
                        aria-hidden
                    />
                    <Show when={props.summary}>
                        <span class="font-mono text-[11px] font-medium tabular-nums text-void-300">
                            {props.summary}
                        </span>
                    </Show>
                </button>
                <Show when={open()}>
                    <div
                        ref={(el) => {
                            panelEl = el;
                        }}
                        class="absolute right-0 top-full z-50 mt-1.5 w-72 shadow-2xl shadow-black/60"
                        role="dialog"
                        aria-label="Message usage details"
                    >
                        <MetadataPopoverPanel sections={props.sections} />
                    </div>
                </Show>
            </div>
        </Show>
    );
};
