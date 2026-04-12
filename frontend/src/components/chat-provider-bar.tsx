import { A } from "@solidjs/router";
import Bot from "lucide-solid/icons/bot";
import ChevronDown from "lucide-solid/icons/chevron-down";
import type { Component } from "solid-js";
import {
    createMemo,
    createSignal,
    For,
    onCleanup,
    onMount,
    Show,
} from "solid-js";
import {
    CHAT_PROVIDERS,
    OPENROUTER_CHAT_MODELS,
    type ChatProviderId,
} from "@/lib/chat-provider";

const triggerClass =
    "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300 disabled:pointer-events-none disabled:opacity-40";

const menuClass =
    "absolute left-0 top-full z-50 mt-0.5 min-w-[10rem] rounded-md border border-slate-800/60 bg-slate-950/95 py-0.5 shadow-lg backdrop-blur-sm";

const menuItemClass =
    "flex w-full cursor-pointer items-center px-2 py-1 text-left text-[11px] text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-200";

export const ChatProviderBar: Component<{
    provider: ChatProviderId;
    onProviderChange: (id: ChatProviderId) => void;
    model: string;
    onModelChange: (modelId: string) => void;
    showOpenRouterKeyHint: boolean;
    providerDisabled?: boolean;
    modelDisabled?: boolean;
}> = (props) => {
    const [open, setOpen] = createSignal<"provider" | "model" | null>(null);

    let rootEl!: HTMLDivElement;

    function close() {
        setOpen(null);
    }

    onMount(() => {
        const onDoc = (e: MouseEvent) => {
            if (open() === null) return;
            const t = e.target as Node;
            if (rootEl?.contains(t)) return;
            close();
        };
        document.addEventListener("mousedown", onDoc);
        onCleanup(() => document.removeEventListener("mousedown", onDoc));
    });

    const modelOptions = createMemo(() => {
        const cur = props.model.trim();
        const known = [...OPENROUTER_CHAT_MODELS];
        if (cur && !known.some((m) => m.id === cur)) {
            return [{ id: cur, label: cur }, ...known];
        }
        return known;
    });

    /** Chip shows the friendly model name when set; "Model" when unset (matches original idle copy). */
    const modelChipLabel = createMemo(() => {
        const cur = props.model.trim();
        if (!cur) return "Model";
        const row = modelOptions().find((m) => m.id === cur);
        return row?.label ?? cur;
    });

    return (
        <div
            ref={rootEl}
            class="flex min-w-0 flex-1 flex-col gap-1.5"
        >
            <div class="flex flex-wrap items-center gap-1">
                {/* Same minimal chip style as the original Model control */}
                <div class="relative shrink-0">
                    <button
                        type="button"
                        class={triggerClass}
                        disabled={props.providerDisabled}
                        aria-expanded={open() === "provider"}
                        aria-haspopup="listbox"
                        onClick={() =>
                            setOpen((v) =>
                                v === "provider" ? null : "provider",
                            )
                        }
                    >
                        OpenRouter
                        <ChevronDown
                            class="size-3 shrink-0 text-slate-600"
                            stroke-width={2}
                            aria-hidden
                        />
                    </button>
                    <Show when={open() === "provider"}>
                        <ul
                            class={menuClass}
                            role="listbox"
                            aria-label="Provider"
                        >
                            <For each={[...CHAT_PROVIDERS]}>
                                {(p) => (
                                    <li role="presentation">
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={
                                                props.provider === p.id
                                            }
                                            class={`${menuItemClass} ${props.provider === p.id ? "bg-slate-800/40 text-slate-200" : ""}`}
                                            onClick={() => {
                                                props.onProviderChange(p.id);
                                                close();
                                            }}
                                        >
                                            {p.label}
                                        </button>
                                    </li>
                                )}
                            </For>
                        </ul>
                    </Show>
                </div>

                <div class="relative shrink-0">
                    <button
                        type="button"
                        class={triggerClass}
                        disabled={props.modelDisabled}
                        aria-expanded={open() === "model"}
                        aria-haspopup="listbox"
                        onClick={() =>
                            setOpen((v) => (v === "model" ? null : "model"))
                        }
                    >
                        <Bot
                            class="size-3 shrink-0"
                            stroke-width={2}
                            aria-hidden
                        />
                        <span
                            class="max-w-[11rem] truncate"
                            title={
                                props.model.trim()
                                    ? props.model.trim()
                                    : undefined
                            }
                        >
                            {modelChipLabel()}
                        </span>
                        <ChevronDown
                            class="size-3 shrink-0 text-slate-600"
                            stroke-width={2}
                            aria-hidden
                        />
                    </button>
                    <Show when={open() === "model"}>
                        <ul
                            class={`${menuClass} max-h-56 overflow-y-auto`}
                            role="listbox"
                            aria-label="Model"
                        >
                            <li role="presentation">
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={props.model === ""}
                                    class={`${menuItemClass} ${props.model === "" ? "bg-slate-800/40 text-slate-200" : ""}`}
                                    onClick={() => {
                                        props.onModelChange("");
                                        close();
                                    }}
                                >
                                    Choose model…
                                </button>
                            </li>
                            <For each={modelOptions()}>
                                {(m) => (
                                    <li role="presentation">
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={props.model === m.id}
                                            class={`${menuItemClass} ${props.model === m.id ? "bg-slate-800/40 text-slate-200" : ""}`}
                                            onClick={() => {
                                                props.onModelChange(m.id);
                                                close();
                                            }}
                                        >
                                            {m.label}
                                        </button>
                                    </li>
                                )}
                            </For>
                        </ul>
                    </Show>
                </div>
            </div>
            <Show when={props.showOpenRouterKeyHint}>
                <p class="text-[11px] text-amber-500/90">
                    Add an OpenRouter API key in{" "}
                    <A
                        href="/settings/providers"
                        class="underline-offset-2 hover:text-amber-400 hover:underline"
                    >
                        Settings → Providers
                    </A>{" "}
                    to use this provider.
                </p>
            </Show>
        </div>
    );
};
