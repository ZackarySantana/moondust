import Check from "lucide-solid/icons/check";
import Copy from "lucide-solid/icons/copy";
import type { Component, JSX, ParentComponent } from "solid-js";
import { createSignal, Show } from "solid-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface FieldRowProps {
    id: string;
    label: string;
    value: string;
    placeholder?: string;
    disabled?: boolean;
    description?: string;
    onInput?: JSX.EventHandler<HTMLInputElement, InputEvent>;
}

export const FieldRow: Component<FieldRowProps> = (props) => (
    <div class="grid grid-cols-[11rem_1fr] items-start gap-4">
        <Label
            for={props.id}
            class="mb-0 pt-2 text-right text-[13px] text-slate-400"
        >
            {props.label}
        </Label>
        <div class="space-y-1">
            <Input
                id={props.id}
                value={props.value}
                placeholder={props.placeholder}
                disabled={props.disabled}
                onInput={props.onInput}
                readOnly={!props.onInput}
            />
            {props.description && (
                <p class="text-xs text-slate-600">{props.description}</p>
            )}
        </div>
    </div>
);

export interface SectionProps {
    title: string;
    description?: string;
}

export const Section: ParentComponent<SectionProps> = (props) => (
    <section class="space-y-5">
        <div>
            <h2 class="text-sm font-medium text-slate-200">{props.title}</h2>
            {props.description && (
                <p class="mt-0.5 text-xs text-slate-600">{props.description}</p>
            )}
        </div>
        <div class="space-y-4">{props.children}</div>
    </section>
);

export interface CopyableReadonlyFieldProps {
    label: string;
    value: string;
    description?: string;
    copyAriaLabel: string;
}

export const CopyableReadonlyField: Component<CopyableReadonlyFieldProps> = (
    props,
) => {
    const [copied, setCopied] = createSignal(false);

    async function copy() {
        try {
            await navigator.clipboard.writeText(props.value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard not available */
        }
    }

    return (
        <div class="grid grid-cols-[11rem_1fr] items-start gap-4">
            <Label class="mb-0 pt-2 text-right text-[13px] text-slate-400">
                {props.label}
            </Label>
            <div class="space-y-1">
                <div class="flex items-center gap-2">
                    <code class="flex h-9 min-w-0 flex-1 items-center rounded-lg border border-slate-800/40 bg-slate-950/30 px-3 font-mono text-xs text-slate-500 select-all">
                        {props.value}
                    </code>
                    <button
                        type="button"
                        class="shrink-0 cursor-pointer rounded-lg border border-slate-800/40 p-2 text-slate-500 transition-colors duration-100 hover:bg-slate-800/40 hover:text-slate-300"
                        aria-label={props.copyAriaLabel}
                        onClick={() => void copy()}
                    >
                        <Show
                            when={!copied()}
                            fallback={
                                <Check
                                    class="size-3.5 text-emerald-500"
                                    stroke-width={2}
                                    aria-hidden
                                />
                            }
                        >
                            <Copy
                                class="size-3.5"
                                stroke-width={2}
                                aria-hidden
                            />
                        </Show>
                    </button>
                </div>
                {props.description && (
                    <p class="text-xs text-slate-600">{props.description}</p>
                )}
            </div>
        </div>
    );
};
