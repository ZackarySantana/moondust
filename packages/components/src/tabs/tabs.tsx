import {
    createContext,
    createMemo,
    createSignal,
    createUniqueId,
    onCleanup,
    onMount,
    Show,
    splitProps,
    useContext,
    type Accessor,
    type Component,
    type JSX,
} from "solid-js";
import { cn } from "../utils";

export type TabsVariant = "underline" | "segmented";
export type TabsSize = "sm" | "default";

interface TabRegistration {
    value: string;
    el: HTMLButtonElement;
}

interface TabsContextValue {
    rootId: string;
    value: Accessor<string>;
    setValue: (next: string) => void;
    variant: Accessor<TabsVariant>;
    size: Accessor<TabsSize>;
    register: (reg: TabRegistration) => void;
    unregister: (value: string) => void;
    moveFocus: (
        currentValue: string,
        dir: "next" | "prev" | "first" | "last",
    ) => void;
}

const TabsContext = createContext<TabsContextValue>();

function useTabsContext(component: string): TabsContextValue {
    const ctx = useContext(TabsContext);
    if (!ctx) {
        throw new Error(
            `<${component}> must be rendered inside <Tabs>. ` +
                "Make sure each Tabs.Trigger and Tabs.Content lives inside the same <Tabs> root.",
        );
    }
    return ctx;
}

export interface TabsRootProps {
    /** Selected tab value. If omitted, the component is uncontrolled. */
    value?: string;
    /** Default selected tab value when uncontrolled. */
    defaultValue?: string;
    /** Notified when the selected tab changes (controlled or uncontrolled). */
    onValueChange?: (value: string) => void;
    /** Visual variant. Defaults to `underline`. */
    variant?: TabsVariant;
    /** Size scale. Defaults to `default`. */
    size?: TabsSize;
    class?: string;
    children: JSX.Element;
}

/**
 * Root of the tabs primitive. Provides the selected value, variant, and a
 * roving-tabindex focus manager to its children. Trigger/list/content are
 * exposed as named exports and as static members on `Tabs`.
 */
export const TabsRoot: Component<TabsRootProps> = (props) => {
    const rootId = createUniqueId();
    const [internal, setInternal] = createSignal(
        props.defaultValue ?? props.value ?? "",
    );

    const value = createMemo(() =>
        props.value !== undefined ? props.value : internal(),
    );

    const setValue = (next: string) => {
        if (props.value === undefined) setInternal(next);
        props.onValueChange?.(next);
    };

    const registry = new Map<string, HTMLButtonElement>();

    const register = (reg: TabRegistration) => {
        registry.set(reg.value, reg.el);
    };

    const unregister = (v: string) => {
        registry.delete(v);
    };

    const moveFocus = (
        currentValue: string,
        dir: "next" | "prev" | "first" | "last",
    ) => {
        const ordered = Array.from(registry.entries());
        if (ordered.length === 0) return;
        const idx = ordered.findIndex(([v]) => v === currentValue);
        let nextIdx = idx;
        if (dir === "next") nextIdx = (idx + 1) % ordered.length;
        if (dir === "prev")
            nextIdx = (idx - 1 + ordered.length) % ordered.length;
        if (dir === "first") nextIdx = 0;
        if (dir === "last") nextIdx = ordered.length - 1;
        const target = ordered[nextIdx];
        if (!target) return;
        target[1].focus();
        setValue(target[0]);
    };

    const ctxValue: TabsContextValue = {
        rootId,
        value,
        setValue,
        variant: () => props.variant ?? "underline",
        size: () => props.size ?? "default",
        register,
        unregister,
        moveFocus,
    };

    return (
        <TabsContext.Provider value={ctxValue}>
            <div class={cn("flex flex-col", props.class)}>{props.children}</div>
        </TabsContext.Provider>
    );
};

export interface TabsListProps extends JSX.HTMLAttributes<HTMLDivElement> {
    /**
     * Accessible name for the tablist. Required so screen readers can
     * announce the tab group.
     */
    "aria-label": string;
}

const listVariantStyles: Record<TabsVariant, string> = {
    underline: "border-b border-void-700 gap-1",
    segmented: "border border-void-700 bg-void-950/40 gap-px",
};

export const TabsList: Component<TabsListProps> = (props) => {
    const ctx = useTabsContext("TabsList");
    const [local, rest] = splitProps(props, ["class", "children"]);
    return (
        <div
            role="tablist"
            class={cn(
                "flex items-stretch",
                listVariantStyles[ctx.variant()],
                local.class,
            )}
            {...rest}
        >
            {local.children}
        </div>
    );
};

export interface TabsTriggerProps extends Omit<
    JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    "value"
> {
    value: string;
}

const triggerSizeStyles: Record<TabsSize, string> = {
    sm: "px-2.5 h-7 text-[11px]",
    default: "px-3.5 h-9 text-[12px]",
};

const triggerVariantStyles: Record<TabsVariant, (active: boolean) => string> = {
    underline: (active) =>
        cn(
            "border-b-2 -mb-px",
            active
                ? "border-starlight-400 text-void-50"
                : "border-transparent text-void-400 hover:text-void-100 hover:border-void-600",
        ),
    segmented: (active) =>
        cn(
            active
                ? "bg-void-800 text-starlight-300"
                : "bg-transparent text-void-400 hover:bg-void-800/60 hover:text-void-200",
        ),
};

export const TabsTrigger: Component<TabsTriggerProps> = (props) => {
    const ctx = useTabsContext("TabsTrigger");
    const [local, rest] = splitProps(props, [
        "class",
        "value",
        "children",
        "disabled",
        "type",
        "onClick",
        "onKeyDown",
    ]);

    let el!: HTMLButtonElement;

    onMount(() => {
        ctx.register({ value: local.value, el });
        onCleanup(() => ctx.unregister(local.value));
    });

    const active = () => ctx.value() === local.value;

    const callUserClick = (
        e: MouseEvent & {
            currentTarget: HTMLButtonElement;
            target: Element;
        },
    ) => {
        const handler = local.onClick;
        if (typeof handler === "function") handler(e);
        else if (Array.isArray(handler)) handler[0](handler[1], e);
    };

    const callUserKeyDown = (
        e: KeyboardEvent & {
            currentTarget: HTMLButtonElement;
            target: Element;
        },
    ) => {
        const handler = local.onKeyDown;
        if (typeof handler === "function") handler(e);
        else if (Array.isArray(handler)) handler[0](handler[1], e);
    };

    return (
        <button
            ref={(node) => {
                el = node;
            }}
            type={local.type ?? "button"}
            role="tab"
            id={`${ctx.rootId}-trigger-${local.value}`}
            aria-controls={`${ctx.rootId}-content-${local.value}`}
            aria-selected={active()}
            tabIndex={active() ? 0 : -1}
            disabled={local.disabled}
            class={cn(
                "inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-none font-medium uppercase tracking-[0.12em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-starlight-400/60 disabled:pointer-events-none disabled:opacity-40",
                triggerSizeStyles[ctx.size()],
                triggerVariantStyles[ctx.variant()](active()),
                local.class,
            )}
            onClick={(e) => {
                ctx.setValue(local.value);
                callUserClick(e);
            }}
            onKeyDown={(e) => {
                switch (e.key) {
                    case "ArrowRight":
                        e.preventDefault();
                        ctx.moveFocus(local.value, "next");
                        break;
                    case "ArrowLeft":
                        e.preventDefault();
                        ctx.moveFocus(local.value, "prev");
                        break;
                    case "Home":
                        e.preventDefault();
                        ctx.moveFocus(local.value, "first");
                        break;
                    case "End":
                        e.preventDefault();
                        ctx.moveFocus(local.value, "last");
                        break;
                }
                callUserKeyDown(e);
            }}
            {...rest}
        >
            {local.children}
        </button>
    );
};

export interface TabsContentProps extends Omit<
    JSX.HTMLAttributes<HTMLDivElement>,
    "value"
> {
    value: string;
    /**
     * Keep the panel mounted (just hidden) when not active. Useful when
     * panel state should survive tab switches. Defaults to `false`.
     */
    keepMounted?: boolean;
}

export const TabsContent: Component<TabsContentProps> = (props) => {
    const ctx = useTabsContext("TabsContent");
    const [local, rest] = splitProps(props, [
        "class",
        "value",
        "children",
        "keepMounted",
    ]);

    const active = () => ctx.value() === local.value;

    return (
        <Show when={active() || local.keepMounted}>
            <div
                role="tabpanel"
                id={`${ctx.rootId}-content-${local.value}`}
                aria-labelledby={`${ctx.rootId}-trigger-${local.value}`}
                hidden={!active()}
                tabIndex={0}
                class={cn(
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-starlight-400/40",
                    local.class,
                )}
                {...rest}
            >
                {local.children}
            </div>
        </Show>
    );
};

/**
 * Convenience namespace export. Use either:
 *   <Tabs value={...}><Tabs.List ...> ... </Tabs.List></Tabs>
 * or named imports:
 *   <TabsRoot ...><TabsList ...> ... </TabsList></TabsRoot>
 */
export const Tabs = Object.assign(TabsRoot, {
    List: TabsList,
    Trigger: TabsTrigger,
    Content: TabsContent,
});
