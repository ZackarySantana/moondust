import { useLocation } from "@solidjs/router";
import type { Accessor, ParentComponent } from "solid-js";
import { createContext, createMemo, useContext } from "solid-js";

/** Thread id from `/project/:projectId/thread/:threadId` (chat or `/settings/...` under that thread). */
export function parseThreadIdFromThreadRoutePath(path: string): string | null {
    const m = path.trim().match(/^\/project\/[^/]+\/thread\/([^/]+)/);
    return m?.[1] ?? null;
}

const CurrentThreadContext = createContext<Accessor<string | null>>();

export const CurrentThreadProvider: ParentComponent = (props) => {
    const location = useLocation();
    const currentThreadId = createMemo(() =>
        parseThreadIdFromThreadRoutePath(location.pathname),
    );
    return (
        <CurrentThreadContext.Provider value={currentThreadId}>
            {props.children}
        </CurrentThreadContext.Provider>
    );
};

/** Active thread id from the current route, or null when not on a thread URL. */
export function useCurrentThreadId(): Accessor<string | null> {
    const ctx = useContext(CurrentThreadContext);
    return ctx ?? (() => null);
}
