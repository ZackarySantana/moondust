import Check from "lucide-solid/icons/check";
import Loader2 from "lucide-solid/icons/loader-2";
import type { Component } from "solid-js";
import { createEffect, createSignal, on, Show } from "solid-js";
import { Button } from "../button/button";

export interface SaveButtonProps {
    dirty: boolean;
    isPending: boolean;
    onClick: () => void;
    disabled?: boolean;
    /** Override the default "Save" label. */
    label?: string;
    /** Override the saved confirmation label. */
    savedLabel?: string;
    /** Override the in-progress label. */
    pendingLabel?: string;
}

export const SaveButton: Component<SaveButtonProps> = (props) => {
    const [saved, setSaved] = createSignal(false);

    createEffect(
        on(
            () => props.isPending,
            (pending, prev) => {
                if (prev && !pending) {
                    setSaved(true);
                }
            },
        ),
    );

    createEffect(
        on(saved, (v) => {
            if (!v) return;
            const t = setTimeout(() => setSaved(false), 2000);
            return () => clearTimeout(t);
        }),
    );

    createEffect(
        on(
            () => props.dirty,
            (d) => {
                if (d) setSaved(false);
            },
        ),
    );

    return (
        <Button
            onClick={props.onClick}
            disabled={
                (!props.dirty && !saved()) || props.isPending || props.disabled
            }
            class="min-w-24"
        >
            <Show
                when={!props.isPending}
                fallback={
                    <>
                        <Loader2
                            class="size-4 animate-spin"
                            stroke-width={2}
                            aria-hidden
                        />
                        {props.pendingLabel ?? "Saving…"}
                    </>
                }
            >
                <Show
                    when={!saved()}
                    fallback={
                        <>
                            <Check
                                class="size-4 text-emerald-400"
                                stroke-width={2}
                                aria-hidden
                            />
                            {props.savedLabel ?? "Saved"}
                        </>
                    }
                >
                    {props.label ?? "Save"}
                </Show>
            </Show>
        </Button>
    );
};
