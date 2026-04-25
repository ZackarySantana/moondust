import {
    Show,
    createEffect,
    createSignal,
    splitProps,
    type Component,
    type JSX,
} from "solid-js";
import { cn } from "../utils";

export type InlineEditableSize = "sm" | "default" | "lg";

export interface InlineEditableTextProps
    extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
    value: string;
    onCommit: (next: string) => void;
    /** Disable editing entirely. The value renders as static text. */
    disabled?: boolean;
    placeholder?: string;
    /** Accessible label for the input when in edit mode. */
    "aria-label"?: string;
    /** Allow line breaks. Submits on `Cmd/Ctrl+Enter` instead of `Enter`. */
    multiline?: boolean;
    /** Maximum length forwarded to the input. */
    maxLength?: number;
    size?: InlineEditableSize;
    /**
     * If true, the field auto-enters edit mode on mount. Useful for newly
     * created entities ("Untitled" → cursor in the field, ready to type).
     */
    autoEdit?: boolean;
    /**
     * Custom validation. Return a string to reject the commit; the input
     * stays in edit mode and the message is set as `aria-invalid` description.
     */
    validate?: (next: string) => string | null | undefined;
}

const sizeStyles: Record<InlineEditableSize, string> = {
    sm: "text-[12px] h-5",
    default: "text-[13px] h-6",
    lg: "text-[15px] h-7",
};

/**
 * Click-to-edit text field. Enter commits, Escape cancels. The static view
 * matches the input height/font so layout doesn't shift between modes.
 *
 * Use for thread titles, project names, and other human-friendly identifiers
 * that benefit from in-place editing.
 */
export const InlineEditableText: Component<InlineEditableTextProps> = (
    props,
) => {
    const [local, rest] = splitProps(props, [
        "class",
        "value",
        "onCommit",
        "disabled",
        "placeholder",
        "aria-label",
        "multiline",
        "maxLength",
        "size",
        "autoEdit",
        "validate",
    ]);

    const size = () => local.size ?? "default";
    const [editing, setEditing] = createSignal(local.autoEdit ?? false);
    const [draft, setDraft] = createSignal(local.value);
    const [error, setError] = createSignal<string | null>(null);

    let inputEl: HTMLInputElement | HTMLTextAreaElement | undefined;

    const startEdit = () => {
        if (local.disabled) return;
        setDraft(local.value);
        setError(null);
        setEditing(true);
    };

    const cancel = () => {
        setError(null);
        setEditing(false);
    };

    const commit = () => {
        const next = draft().trim();
        if (next === local.value) {
            setEditing(false);
            return;
        }
        if (local.validate) {
            const msg = local.validate(next);
            if (msg) {
                setError(msg);
                return;
            }
        }
        local.onCommit(next);
        setEditing(false);
    };

    createEffect(() => {
        if (editing() && inputEl) {
            inputEl.focus();
            inputEl.select();
        }
    });

    createEffect(() => {
        if (!editing()) {
            setDraft(local.value);
        }
    });

    const baseInputClass = cn(
        "w-full min-w-0 rounded-none border border-starlight-400/40 bg-void-950 px-1.5 font-sans text-void-50 outline-none focus-visible:border-starlight-300/70 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-starlight-400/50",
        local.multiline ? "h-auto py-1" : sizeStyles[size()],
    );

    return (
        <div
            class={cn("inline-flex min-w-0 items-center", local.class)}
            {...rest}
        >
            <Show
                when={editing() && !local.disabled}
                fallback={
                    <button
                        type="button"
                        class={cn(
                            "inline-flex w-full min-w-0 cursor-text items-center truncate rounded-none border border-transparent px-1.5 text-left font-sans text-void-50 transition-colors hover:border-void-700 hover:bg-void-800/40 focus-visible:border-void-600 focus-visible:bg-void-800/40 focus-visible:outline-none disabled:cursor-default disabled:hover:border-transparent disabled:hover:bg-transparent",
                            sizeStyles[size()],
                        )}
                        disabled={local.disabled}
                        onClick={() => startEdit()}
                        onFocus={(e) => {
                            if (
                                e.relatedTarget &&
                                (e.relatedTarget as HTMLElement).closest?.(
                                    "[data-inline-editable-trigger]",
                                )
                            ) {
                                return;
                            }
                        }}
                        aria-label={local["aria-label"]}
                    >
                        <Show
                            when={local.value}
                            fallback={
                                <span class="text-void-500">
                                    {local.placeholder ?? "Untitled"}
                                </span>
                            }
                        >
                            <span class="truncate">{local.value}</span>
                        </Show>
                    </button>
                }
            >
                <Show
                    when={local.multiline}
                    fallback={
                        <input
                            ref={(el) => {
                                inputEl = el;
                            }}
                            type="text"
                            class={baseInputClass}
                            value={draft()}
                            placeholder={local.placeholder}
                            maxLength={local.maxLength}
                            aria-label={local["aria-label"]}
                            aria-invalid={error() ? true : undefined}
                            onInput={(e) =>
                                setDraft(
                                    (e.currentTarget as HTMLInputElement).value,
                                )
                            }
                            onBlur={() => commit()}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    commit();
                                } else if (e.key === "Escape") {
                                    e.preventDefault();
                                    cancel();
                                }
                            }}
                        />
                    }
                >
                    <textarea
                        ref={(el) => {
                            inputEl = el;
                        }}
                        class={baseInputClass}
                        rows={2}
                        value={draft()}
                        placeholder={local.placeholder}
                        maxLength={local.maxLength}
                        aria-label={local["aria-label"]}
                        aria-invalid={error() ? true : undefined}
                        onInput={(e) =>
                            setDraft(
                                (e.currentTarget as HTMLTextAreaElement).value,
                            )
                        }
                        onBlur={() => commit()}
                        onKeyDown={(e) => {
                            if (
                                e.key === "Enter" &&
                                (e.metaKey || e.ctrlKey)
                            ) {
                                e.preventDefault();
                                commit();
                            } else if (e.key === "Escape") {
                                e.preventDefault();
                                cancel();
                            }
                        }}
                    />
                </Show>
            </Show>
            <Show when={editing() && error()}>
                <span class="ml-2 text-[11px] text-flare-300">{error()}</span>
            </Show>
        </div>
    );
};
