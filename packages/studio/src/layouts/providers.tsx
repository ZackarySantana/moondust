import type { RouteSectionProps } from "@solidjs/router";
import type { Component } from "solid-js";
import { ToastProvider } from "@/lib/toast";
import { ShortcutProvider } from "@/lib/shortcuts";
import { UIStateProvider } from "@/lib/ui-state";
import { AppShell } from "./app-shell";
import { NewWorkspaceDialog } from "./new-workspace-dialog";

/**
 * Mounts the studio shell once per session. Order matters:
 *   - Toasts wrap everything so providers below can `useToast()`.
 *   - UI state holds rail visibility / active view, consumed by both the
 *     shell chrome and individual pages.
 *   - Shortcuts go inside UIState so handlers can read/write panel state
 *     when reacting to ⌘B / ⌘` etc.
 */
export const ProvidersLayout: Component<RouteSectionProps> = (props) => (
    <ToastProvider>
        <UIStateProvider>
            <ShortcutProvider>
                <AppShell {...props} />
                <NewWorkspaceDialog />
            </ShortcutProvider>
        </UIStateProvider>
    </ToastProvider>
);
