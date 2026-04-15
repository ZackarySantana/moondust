import Brain from "lucide-solid/icons/brain";
import Eye from "lucide-solid/icons/eye";
import FileText from "lucide-solid/icons/file-text";
import Info from "lucide-solid/icons/info";
import Sparkles from "lucide-solid/icons/sparkles";
import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import type { ModelChoice } from "@/lib/chat-provider";
import {
    isFlagshipModel,
    orgBadgeAbbr,
    orgBadgeClass,
    orgTitle,
    pricingTierClass,
    providerSlug,
    type ModelPickerCategory,
} from "@/lib/model-picker-categories";

/** Row min height so ~5 rows fill the list viewport. */
export const MODEL_ROW_MIN_CLASS = "min-h-[3.5rem]";
/** Scroll region below the search bar; fills remaining height inside {@link MODEL_PANEL_HEIGHT_CLASS}. */
export const MODEL_LIST_SCROLL_CLASS =
    "min-h-0 flex-1 overflow-y-auto overscroll-contain";
/** Fixed panel height: search row + flex-growing list (no empty band at the bottom). */
export const MODEL_PANEL_HEIGHT_CLASS = "h-[28rem]";

export const OrgBadge: Component<{ slug: string; compact?: boolean }> = (
    props,
) => {
    const abbr = () => orgBadgeAbbr(props.slug);
    const isCompact = () => props.compact ?? false;
    return (
        <div
            class={`flex shrink-0 items-center justify-center rounded-md font-semibold select-none ${orgBadgeClass(props.slug)} ${isCompact() ? "size-6 text-[8px]" : "size-7 text-[9px]"}`}
            title={orgTitle(props.slug)}
        >
            {abbr()}
        </div>
    );
};

const capabilityPill =
    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[9px] leading-tight";

export const ModelRowButton: Component<{
    m: ModelChoice;
    selected: boolean;
    onPick: () => void;
    onInfoHover: () => void;
    onInfoLeave: () => void;
    /** When false, hides the details control (e.g. Cursor models have no detail pane). */
    showInfoButton?: boolean;
}> = (props) => {
    const slugStr = () => props.m.provider ?? providerSlug(props.m.id);
    const flagship = () => isFlagshipModel(props.m.id);
    const tierClass = () => pricingTierClass(props.m.pricing_tier);

    return (
        <div
            role="option"
            aria-selected={props.selected}
            class={`flex border-t border-slate-800/20 first:border-t-0 ${MODEL_ROW_MIN_CLASS} ${props.selected ? "bg-slate-800/45" : ""} ${flagship() ? "border-l-2 border-l-amber-500/40" : ""}`}
        >
            <button
                type="button"
                class={`flex min-w-0 flex-1 cursor-pointer gap-2.5 px-2.5 py-2 text-left transition-colors ${props.selected ? "" : "hover:bg-slate-800/30"}`}
                onClick={props.onPick}
            >
                <OrgBadge slug={slugStr()} />
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5">
                        <span class="text-[12px] font-medium text-slate-100">
                            {props.m.label}
                        </span>
                        <Show when={flagship()}>
                            <Sparkles
                                class="size-3 shrink-0 text-amber-400/80"
                                stroke-width={2}
                                aria-hidden
                            />
                        </Show>
                        <Show when={props.m.pricing_tier}>
                            <span
                                class={`ml-auto shrink-0 font-mono text-[10px] font-semibold ${tierClass()}`}
                            >
                                {props.m.pricing_tier}
                            </span>
                        </Show>
                    </div>
                    <p class="mt-0.5 truncate text-[10px] leading-snug text-slate-500">
                        {props.m.description ?? "TBA"}
                    </p>
                    <div class="mt-1 flex flex-wrap gap-1">
                        <Show when={props.m.vision}>
                            <span
                                class={`${capabilityPill} bg-sky-900/25 text-sky-400/80`}
                            >
                                <Eye
                                    class="size-2.5"
                                    stroke-width={2.5}
                                    aria-hidden
                                />
                                Vision
                            </span>
                        </Show>
                        <Show when={props.m.reasoning}>
                            <span
                                class={`${capabilityPill} bg-violet-900/25 text-violet-400/80`}
                            >
                                <Brain
                                    class="size-2.5"
                                    stroke-width={2.5}
                                    aria-hidden
                                />
                                Reasoning
                            </span>
                        </Show>
                        <Show when={props.m.long_context}>
                            <span
                                class={`${capabilityPill} bg-emerald-900/25 text-emerald-400/80`}
                            >
                                <FileText
                                    class="size-2.5"
                                    stroke-width={2.5}
                                    aria-hidden
                                />
                                Long ctx
                            </span>
                        </Show>
                    </div>
                </div>
            </button>
            <Show when={props.showInfoButton !== false}>
                <div
                    class="group/info flex shrink-0 cursor-pointer items-start px-1.5 pt-2.5"
                    onMouseEnter={() => props.onInfoHover()}
                    onMouseLeave={() => props.onInfoLeave()}
                >
                    <div class="flex size-6 items-center justify-center rounded-md text-slate-600 transition-colors group-hover/info:bg-slate-800/50 group-hover/info:text-slate-300">
                        <Info
                            class="size-3.5"
                            stroke-width={2}
                            aria-hidden
                        />
                    </div>
                </div>
            </Show>
        </div>
    );
};

const sectionHeaderClass =
    "border-t border-slate-800/30 px-2.5 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500";

export const CategorizedModelList: Component<{
    categories: readonly ModelPickerCategory[];
    selectedId: string;
    onPick: (id: string) => void;
    onInfoHover: (m: ModelChoice) => void;
    onInfoLeave: () => void;
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
                                onInfoHover={() => props.onInfoHover(m)}
                                onInfoLeave={() => props.onInfoLeave()}
                                showInfoButton={props.showInfoButton}
                            />
                        )}
                    </For>
                </>
            )}
        </For>
    );
};
