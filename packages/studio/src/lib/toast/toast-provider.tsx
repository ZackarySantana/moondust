import type { NotificationToastItem } from "@moondust/components";
import { NotificationToastViewport } from "@moondust/components";
import { useNavigate } from "@solidjs/router";
import {
    createContext,
    createSignal,
    type Accessor,
    type ParentComponent,
    useContext,
} from "solid-js";

type ShowToastInput = Omit<NotificationToastItem, "id"> & { id?: number };

export type ToastContextValue = {
    /** Stacked toasts, reactive. */
    toasts: Accessor<readonly NotificationToastItem[]>;
    /** Add a toast. Returns the toast `id` (auto-generated if omitted). */
    showToast: (input: ShowToastInput) => number;
    /** Remove a toast by id. */
    dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue>();

let nextToastId = 1;

/**
 * In-app notification stack + imperative API. Must render under the router
 * (uses `useNavigate` for deep links).
 */
export const ToastProvider: ParentComponent = (props) => {
    const [toasts, setToasts] = createSignal<NotificationToastItem[]>([]);
    const navigate = useNavigate();

    const showToast: ToastContextValue["showToast"] = (input) => {
        const id = input.id ?? nextToastId++;
        setToasts((list) => [...list, { ...input, id } as NotificationToastItem]);
        return id;
    };

    const dismissToast: ToastContextValue["dismissToast"] = (toastId) => {
        setToasts((list) => list.filter((t) => t.id !== toastId));
    };

    const value: ToastContextValue = {
        toasts,
        showToast,
        dismissToast,
    };

    return (
        <ToastContext.Provider value={value}>
            {props.children}
            <NotificationToastViewport
                toasts={toasts()}
                onDismiss={dismissToast}
                onNavigate={(_id, path) => {
                    navigate(path);
                }}
            />
        </ToastContext.Provider>
    );
};

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (ctx == null) {
        throw new Error("useToast must be used under ToastProvider");
    }
    return ctx;
}
