import Brain from "lucide-solid/icons/brain";
import Eye from "lucide-solid/icons/eye";
import FileText from "lucide-solid/icons/file-text";
import Info from "lucide-solid/icons/info";
import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import type { ModelChoice } from "@/lib/chat-provider";
import {
    orgBadgeClass,
    orgTitle,
    providerSlug,
    type ModelPickerCategory,
} from "@/lib/model-picker-categories";

/** Row min height so ~5 rows fill the list viewport. */
export const MODEL_ROW_MIN_CLASS = "min-h-[3.75rem]";
/** Scroll region below the search bar; fills remaining height inside {@link MODEL_PANEL_HEIGHT_CLASS}. */
export const MODEL_LIST_SCROLL_CLASS =
    "min-h-0 flex-1 overflow-y-auto overscroll-contain";
/** Fixed panel height: search row + flex-growing list (no empty band at the bottom). */
export const MODEL_PANEL_HEIGHT_CLASS = "h-[28rem]";

export const OrgBadge: Component<{ slug: string }> = (props) => {
    const letter = () => (props.slug[0] ?? "?").toUpperCase();
    return (
        <div
            class={`flex size-7 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold ${orgBadgeClass(props.slug)}`}
            title={orgTitle(props.slug)}
        >
            {letter()}
        </div>
    );
};

export const ModelRowButton: Component<{
    m: ModelChoice;
    selected: boolean;
    onPick: () => void;
    onInfo: () => void;
    /** When false, hides the details control (e.g. Cursor models have no detail pane). */
    showInfoButton?: boolean;
}> = (props) => {
    const slugStr = () => props.m.provider ?? providerSlug(props.m.id);
    return (
        <div
            role="option"
            aria-selected={props.selected}
            class={`flex border-t border-slate-800/30 first:border-t-0 ${MODEL_ROW_MIN_CLASS} ${props.selected ? "bg-slate-800/45" : ""}`}
        >
            <button
                type="button"
                class={`flex min-w-0 flex-1 cursor-pointer gap-2 px-2 py-2 text-left transition-colors ${props.selected ? "" : "hover:bg-slate-800/30"}`}
                onClick={props.onPick}
            >
                <OrgBadge slug={slugStr()} />
                <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span class="text-[12px] font-medium text-slate-100">
                            {props.m.label}
                        </span>
                        <span class="font-mono text-[10px] text-emerald-500/85">
                            {props.m.pricing_tier ?? "—"}
                        </span>
                    </div>
                    <p class="mt-0.5 truncate text-[10px] leading-snug text-slate-500">
                        {props.m.description ?? "TBA"}
                    </p>
                </div>
                <div class="flex shrink-0 items-center gap-0.5 self-start pt-0.5">
                    <Show when={props.m.vision}>
                        <span
                            title="Vision"
                            class="text-slate-500"
                        >
                            <Eye
                                class="size-3.5"
                                stroke-width={2}
                                aria-hidden
                            />
                        </span>
                    </Show>
                    <Show when={props.m.reasoning}>
                        <span
                            title="Reasoning"
                            class="text-slate-500"
                        >
                            <Brain
                                class="size-3.5"
                                stroke-width={2}
                                aria-hidden
                            />
                        </span>
                    </Show>
                    <Show when={props.m.long_context}>
                        <span
                            title="Large context"
                            class="text-slate-500"
                        >
                            <FileText
                                class="size-3.5"
                                stroke-width={2}
                                aria-hidden
                            />
                        </span>
                    </Show>
                </div>
            </button>
            <Show when={props.showInfoButton !== false}>
                <button
                    type="button"
                    class="shrink-0 cursor-pointer px-2 py-2 text-slate-500 transition-colors hover:bg-slate-800/40 hover:text-slate-300"
                    title="Model details"
                    aria-label="Model details"
                    onClick={(e) => {
                        e.stopPropagation();
                        props.onInfo();
                    }}
                >
                    <Info
                        class="size-4"
                        stroke-width={2}
                        aria-hidden
                    />
                </button>
            </Show>
        </div>
    );
};

const sectionHeaderClass =
    "border-t border-slate-800/30 px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500";

export const CategorizedModelList: Component<{
    categories: readonly ModelPickerCategory[];
    selectedId: string;
    onPick: (id: string) => void;
    onInfo: (m: ModelChoice) => void;
    showSectionHeaders: boolean;
    showInfoButton?: boolean;
}> = (props) => {
    return (
        <For each={[...props.categories]}>
            {(cat) => (
                <>
                    <Show
                        when={
                            props.showSectionHeaders && cat.label.trim() !== ""
                        }
                    >
                        <p class={sectionHeaderClass}>{cat.label}</p>
                    </Show>
                    <For each={[...cat.models]}>
                        {(m) => (
                            <ModelRowButton
                                m={m}
                                selected={props.selectedId === m.id}
                                onPick={() => props.onPick(m.id)}
                                onInfo={() => props.onInfo(m)}
                                showInfoButton={props.showInfoButton}
                            />
                        )}
                    </For>
                </>
            )}
        </For>
    );
};
