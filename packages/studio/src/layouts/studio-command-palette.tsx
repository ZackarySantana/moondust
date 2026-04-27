import { useLocation, useNavigate } from "@solidjs/router";
import { CommandPalette, type CommandPaletteItem } from "@moondust/components";
import FolderPlus from "lucide-solid/icons/folder-plus";
import Plus from "lucide-solid/icons/plus";
import SlidersHorizontal from "lucide-solid/icons/sliders-horizontal";
import {
    createEffect,
    createMemo,
    createSignal,
    type Component,
} from "solid-js";
import { useQueryClient } from "@tanstack/solid-query";
import { useToast } from "@/lib/toast";
import { useUIState } from "@/lib/ui-state";
import {
    createThreadInWorkspace,
    paths,
    sortWorkspacesByLatestThread,
    useThreadsQuery,
    useWorkspacesQuery,
} from "@/lib/workspace";

function errMsg(e: unknown): string {
    if (e instanceof Error) return e.message;
    return String(e);
}

const STUDIO_COMMAND_ITEMS: readonly CommandPaletteItem[] = [
    {
        id: "new-workspace",
        label: "New workspace",
        description: "Open a folder as a workspace",
        keywords: ["open", "folder", "add"],
        icon: FolderPlus,
    },
    {
        id: "new-thread",
        label: "New thread",
        description:
            "In the current workspace, or your only workspace from the hub",
        keywords: ["create", "chat", "conversation"],
        icon: Plus,
    },
    {
        id: "global-settings",
        label: "Go to global settings",
        description: "Appearance, keys, and defaults",
        keywords: ["preferences", "configuration", "general"],
        icon: SlidersHorizontal,
    },
];

/**
 * Hub-style thread target: use workspace from the URL, or the sole workspace
 * on `/`, or prompt to pick a workspace (matches the Hub quick create card).
 */
function resolveThreadWorkspaceId(
    pathname: string,
    sortedWorkspaces: { ID: string }[],
): { workspaceId: string } | { error: { title: string; body: string } } {
    const m = pathname.match(/^\/w\/([^/]+)/);
    const fromUrl = m?.[1];
    if (fromUrl) {
        return { workspaceId: fromUrl };
    }
    if (sortedWorkspaces.length === 0) {
        return {
            error: {
                title: "No workspaces yet",
                body: "Add a workspace first, then create a thread.",
            },
        };
    }
    if (sortedWorkspaces.length === 1) {
        return { workspaceId: sortedWorkspaces[0]!.ID };
    }
    return {
        error: {
            title: "Pick a workspace",
            body: "Open a workspace, then create a thread there.",
        },
    };
}

/**
 * Wires the shared `CommandPalette` to studio navigation: new workspace, new
 * thread, and global settings. Mounted once under {@linkcode ProvidersLayout}.
 */
export const StudioCommandPalette: Component = () => {
    const ui = useUIState();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const toast = useToast();

    const workspacesQuery = useWorkspacesQuery();
    const threadsQuery = useThreadsQuery();

    const [query, setQuery] = createSignal("");

    const sortedWorkspaces = createMemo(() =>
        sortWorkspacesByLatestThread(
            workspacesQuery.data ?? [],
            threadsQuery.data ?? [],
        ),
    );

    createEffect(() => {
        if (ui.commandPaletteOpen()) {
            setQuery("");
        }
    });

    async function onSelect(item: CommandPaletteItem) {
        ui.closeCommandPalette();
        if (item.id === "new-workspace") {
            ui.openNewWorkspaceDialog();
            return;
        }
        if (item.id === "global-settings") {
            navigate(paths.globalSettings());
            return;
        }
        if (item.id === "new-thread") {
            const res = resolveThreadWorkspaceId(
                location.pathname,
                sortedWorkspaces(),
            );
            if ("error" in res) {
                toast.showToast({
                    title: res.error.title,
                    body: res.error.body,
                });
                return;
            }
            try {
                await createThreadInWorkspace(
                    queryClient,
                    navigate,
                    res.workspaceId,
                );
            } catch (e) {
                toast.showToast({
                    title: "Could not create thread",
                    body: errMsg(e),
                });
            }
        }
    }

    return (
        <CommandPalette
            open={ui.commandPaletteOpen()}
            onClose={ui.closeCommandPalette}
            query={query()}
            onQueryChange={setQuery}
            title="Commands"
            items={STUDIO_COMMAND_ITEMS}
            onSelect={onSelect}
            idPrefix="studio"
        />
    );
};
