import {
    createEffect,
    createSignal,
    Show,
    splitProps,
    type Component,
    type JSX,
} from "solid-js";
import { cn } from "../utils";

export type ChatComposerStreamState =
    | "idle"
    | "thinking"
    | "responding"
    | "tool";

export interface ChatComposerProps extends Omit<
    JSX.HTMLAttributes<HTMLFormElement>,
    "onSubmit"
> {
    value: string;
    onValueChange: (next: string) => void;
    /** Submit the message. Receives the trimmed value. */
    onSubmit: (value: string) => void;
    /** Cancel the in-flight stream (called on Esc when streaming). */
    onCancelStream?: () => void;
    /** Stream state. Drives the cancel affordance and disabled state. */
    streamState?: ChatComposerStreamState;
    /** Placeholder text. */
    placeholder?: string;
    /** Whether sending is disabled (e.g. no agent selected). */
    disabled?: boolean;
    /**
     * Slot for the agent chip / model picker, rendered top-left of the
     * composer. Keep it short — one or two chips.
     */
    leadingControls?: JSX.Element;
    /**
     * Slot for trailing controls (slash command picker, attachment, etc.)
     * rendered above the textarea, far right.
     */
    trailingControls?: JSX.Element;
    /**
     * Optional helper text rendered under the textarea (e.g. "↵ to send,
     * ⇧↵ for newline").
     */
    hint?: JSX.Element;
    /** When true, the form auto-grows up to roughly 40% of pane height. */
    autoGrow?: boolean;
    /** Forwarded ref to the underlying textarea. */
    textareaRef?: (el: HTMLTextAreaElement) => void;
}

const MAX_AUTOGROW_PX = 320;

/**
 * Bottom-anchored composer used at the foot of any view. Multi-line with
 * autogrow, slash-command friendly, keyboard-first:
 *   ↵        — send
 *   ⇧↵       — newline
 *   Esc      — cancel stream (when streaming)
 *
 * The component is purely presentational: state lives with the parent so
 * the same composer can serve every view in a thread.
 */
export const ChatComposer: Component<ChatComposerProps> = (props) => {
    const [local, rest] = splitProps(props, [
        "class",
        "value",
        "onValueChange",
        "onSubmit",
        "onCancelStream",
        "streamState",
        "placeholder",
        "disabled",
        "leadingControls",
        "trailingControls",
        "hint",
        "autoGrow",
        "textareaRef",
    ]);

    const streaming = () => {
        const s = local.streamState ?? "idle";
        return s !== "idle";
    };

    const [textareaEl, setTextareaEl] = createSignal<HTMLTextAreaElement>();

    const autoGrow = () => local.autoGrow ?? true;

    function resize() {
        const el = textareaEl();
        if (!el || !autoGrow()) return;
        el.style.height = "0px";
        const next = Math.min(el.scrollHeight, MAX_AUTOGROW_PX);
        el.style.height = `${next}px`;
    }

    createEffect(() => {
        local.value;
        queueMicrotask(resize);
    });

    function submit() {
        const trimmed = local.value.trim();
        if (!trimmed || local.disabled) return;
        local.onSubmit(trimmed);
    }

    function onKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            submit();
            return;
        }
        if (e.key === "Escape" && streaming()) {
            e.preventDefault();
            local.onCancelStream?.();
        }
    }

    return (
        <form
            class={cn(
                "flex w-full flex-col border-t border-void-700 bg-void-900",
                local.class,
            )}
            onSubmit={(e) => {
                e.preventDefault();
                submit();
            }}
            data-slot="chat-composer"
            {...rest}
        >
            <Show when={local.leadingControls || local.trailingControls}>
                <div class="flex items-center justify-between gap-2 px-3 pt-2">
                    <div class="flex min-w-0 items-center gap-1.5">
                        {local.leadingControls}
                    </div>
                    <div class="flex shrink-0 items-center gap-1">
                        {local.trailingControls}
                    </div>
                </div>
            </Show>

            <textarea
                ref={(el) => {
                    setTextareaEl(el);
                    local.textareaRef?.(el);
                }}
                value={local.value}
                onInput={(e) => {
                    local.onValueChange(e.currentTarget.value);
                }}
                onKeyDown={onKeyDown}
                placeholder={
                    local.placeholder ?? "Ask the agent — ↵ to send, ⇧↵ newline"
                }
                rows={1}
                class={cn(
                    "block w-full resize-none border-0 bg-transparent px-3 py-2.5 text-[13px] leading-relaxed text-void-100 placeholder:text-void-500 focus:outline-none",
                    "scrollbar-thin",
                )}
                data-slot="chat-composer-input"
            />

            <Show when={local.hint || streaming()}>
                <div class="flex items-center justify-between gap-3 border-t border-void-800/60 px-3 py-1.5 text-[11px] text-void-500">
                    <span class="min-w-0 flex-1 truncate">{local.hint}</span>
                    <Show when={streaming()}>
                        <button
                            type="button"
                            class="cursor-pointer text-void-300 hover:text-flare-300"
                            onClick={() => local.onCancelStream?.()}
                        >
                            Cancel
                        </button>
                    </Show>
                </div>
            </Show>
        </form>
    );
};
