import { ChatComposer, Chip, KbdHint } from "@moondust/components";
import { createSignal, onCleanup, Show, type Component } from "solid-js";
import { useShortcuts } from "@/lib/shortcuts";
import { useToast } from "@/lib/toast";

export interface ThreadComposerProps {
    /** Title of the thread the composer is bound to (used in placeholder copy). */
    threadTitle: string;
    /** Chip label for the current agent (composer left). */
    activeAgent: string;
    /** Chip label for the current model. */
    activeModel: string;
    /**
     * When true, render in a single-line "ask the agent…" mode (used while a
     * non-chat view is active, so the composer remains accessible without
     * dominating the layout).
     */
    collapsed?: boolean;
}

/**
 * Wires `ChatComposer` (presentational) to thread-scoped runtime state. Owns
 * the input string locally for now — once chat streaming lands, this lifts
 * to a thread context so view switches don't reset the draft.
 */
export const ThreadComposer: Component<ThreadComposerProps> = (props) => {
    const [value, setValue] = createSignal("");
    const { onAction, formatCaps } = useShortcuts();
    const toast = useToast();

    let textareaRef: HTMLTextAreaElement | undefined;
    onCleanup(
        onAction("focus_composer", () => {
            const el =
                textareaRef ??
                (document.querySelector(
                    "[data-slot='chat-composer-input']",
                ) as HTMLTextAreaElement | null);
            el?.focus();
        }),
    );

    function handleSubmit(text: string) {
        toast.showToast({
            title: "Stub composer",
            body: `Would send to "${props.threadTitle}": ${text.slice(0, 80)}${
                text.length > 80 ? "…" : ""
            }`,
        });
        setValue("");
    }

    return (
        <ChatComposer
            value={value()}
            onValueChange={setValue}
            onSubmit={handleSubmit}
            textareaRef={(el) => {
                textareaRef = el;
            }}
            placeholder={
                props.collapsed
                    ? `Ask ${props.activeAgent} about this view…`
                    : `Message ${props.threadTitle}…`
            }
            leadingControls={
                <Show when={!props.collapsed}>
                    <Chip
                        tone="starlight"
                        size="sm"
                    >
                        {props.activeAgent}
                    </Chip>
                    <Chip
                        tone="outline"
                        size="sm"
                    >
                        {props.activeModel}
                    </Chip>
                </Show>
            }
            hint={
                <Show when={!props.collapsed}>
                    <span class="inline-flex items-center gap-1.5">
                        <KbdHint combo={["↵"]} /> send
                        <span class="opacity-40">·</span>
                        <KbdHint combo={["⇧", "↵"]} /> newline
                        <span class="opacity-40">·</span>
                        <KbdHint combo={formatCaps("focus_composer")} /> focus
                    </span>
                </Show>
            }
            autoGrow={!props.collapsed}
        />
    );
};
