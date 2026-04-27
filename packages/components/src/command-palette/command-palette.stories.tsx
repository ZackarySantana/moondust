import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { fn } from "storybook/test";
import Folder from "lucide-solid/icons/folder";
import Home from "lucide-solid/icons/house";
import MessageSquare from "lucide-solid/icons/message-square";
import Search from "lucide-solid/icons/search";
import Settings from "lucide-solid/icons/settings";
import { createSignal, type Component } from "solid-js";
import { Button } from "../button/button";
import {
    CommandPalette,
    type CommandPaletteItem,
    defaultCommandPaletteFilter,
} from "./command-palette";

const baseItems: CommandPaletteItem[] = [
    {
        id: "hub",
        label: "Go to hub",
        description: "Open the home dashboard",
        keywords: ["home", "index"],
        icon: Home,
    },
    {
        id: "thread",
        label: "New thread",
        description: "Start a thread in the current workspace",
        keywords: ["create"],
        icon: MessageSquare,
    },
    {
        id: "files",
        label: "Open files",
        description: "Browse the worktree in the file explorer",
        keywords: ["explorer", "tree"],
        icon: Folder,
    },
    {
        id: "search",
        label: "Search in repository",
        description: "Text search across the project",
        icon: Search,
    },
    {
        id: "settings",
        label: "Open settings",
        description: "Global application preferences",
        icon: Settings,
    },
];

const manyItems: CommandPaletteItem[] = Array.from({ length: 24 }, (_, i) => ({
    id: `action-${i}`,
    label: `Command ${i + 1}`,
    description: `Description for the ${i + 1}th quick action in the list`,
}));

const meta = {
    title: "UI/CommandPalette",
    parameters: { layout: "fullscreen" },
    tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const CommandPaletteDemo: Component<{
    items: CommandPaletteItem[];
}> = (props) => {
    const [open, setOpen] = createSignal(false);
    const [q, setQ] = createSignal("");
    const onSelectLog = fn();

    return (
        <div>
            <Button
                type="button"
                onClick={() => setOpen(true)}
            >
                Open command palette
            </Button>
            <CommandPalette
                open={open()}
                onClose={() => {
                    setOpen(false);
                    setQ("");
                }}
                query={q()}
                onQueryChange={setQ}
                items={props.items}
                onSelect={(item) => {
                    onSelectLog(item);
                    setOpen(false);
                    setQ("");
                }}
                title="Commands"
                placeholder="Search & run…"
            />
        </div>
    );
};

export const Interactive: Story = {
    render: () => {
        return (
            <div class="min-h-screen bg-void-950 p-8">
                <p class="mb-4 text-[12px] text-void-500">
                    Open the palette and use{" "}
                    <kbd class="rounded border border-void-600 px-1.5 font-mono text-void-300">
                        ↑
                    </kbd>{" "}
                    <kbd class="rounded border border-void-600 px-1.5 font-mono text-void-300">
                        ↓
                    </kbd>{" "}
                    to move,{" "}
                    <kbd class="rounded border border-void-600 px-1.5 font-mono text-void-300">
                        Enter
                    </kbd>{" "}
                    to run,{" "}
                    <kbd class="rounded border border-void-600 px-1.5 font-mono text-void-300">
                        Esc
                    </kbd>{" "}
                    to close.
                </p>
                <CommandPaletteDemo items={baseItems} />
            </div>
        );
    },
};

export const OpenForVisualCheck: Story = {
    name: "Open (static, visual)",
    render: () => {
        const [q, setQ] = createSignal("");
        const onClose = fn();
        const onSelect = fn();
        return (
            <div class="min-h-screen bg-void-950 p-0">
                <CommandPalette
                    open={true}
                    onClose={() => onClose()}
                    query={q()}
                    onQueryChange={setQ}
                    items={baseItems}
                    onSelect={(i) => onSelect(i)}
                    title="Commands"
                    placeholder="Search & run…"
                />
            </div>
        );
    },
};

export const Scrolling: Story = {
    render: () => (
        <div class="min-h-screen bg-void-950 p-8">
            <p class="mb-4 text-[12px] text-void-500">
                Long list; scroll the options while the input stays pinned.
            </p>
            <CommandPaletteDemo items={manyItems} />
        </div>
    ),
};

export const NoItems: Story = {
    render: () => {
        const [open, setOpen] = createSignal(true);
        const [q, setQ] = createSignal("");
        const onSelect = fn();
        return (
            <div class="min-h-screen bg-void-950 p-8">
                <Button
                    type="button"
                    onClick={() => setOpen(true)}
                >
                    Open
                </Button>
                <CommandPalette
                    open={open()}
                    onClose={() => setOpen(false)}
                    query={q()}
                    onQueryChange={setQ}
                    items={[]}
                    onSelect={(item) => onSelect(item)}
                    emptyLabel="No commands are registered yet."
                />
            </div>
        );
    },
};

export const NoMatches: Story = {
    render: () => {
        const [open, setOpen] = createSignal(true);
        const [q, setQ] = createSignal("zzzzzz-not-found");
        const onSelect = fn();
        return (
            <div class="min-h-screen bg-void-950 p-8">
                <Button
                    type="button"
                    onClick={() => setOpen(true)}
                >
                    Open
                </Button>
                <CommandPalette
                    open={open()}
                    onClose={() => setOpen(false)}
                    query={q()}
                    onQueryChange={setQ}
                    items={baseItems}
                    onSelect={(item) => onSelect(item)}
                    noMatchLabel="No commands match that search."
                />
            </div>
        );
    },
};

export const CustomFilter: Story = {
    render: () => {
        const [open, setOpen] = createSignal(true);
        const [q, setQ] = createSignal("thread");
        const onSelect = fn();
        return (
            <div class="min-h-screen bg-void-950 p-8">
                <p class="mb-4 max-w-md text-[12px] text-void-500">
                    This story passes a custom filter: only the first word of
                    the label is matched (see implementation in the story file).
                </p>
                <CommandPalette
                    open={open()}
                    onClose={() => setOpen(false)}
                    query={q()}
                    onQueryChange={setQ}
                    items={baseItems}
                    onSelect={(item) => onSelect(item)}
                    filter={(query, items) => {
                        const t = query.trim().toLowerCase();
                        if (!t) return [...items];
                        return items.filter((item) => {
                            const first =
                                item.label.split(/\s+/, 1)[0]?.toLowerCase() ??
                                "";
                            return first.startsWith(t);
                        });
                    }}
                    title="Custom filter (first word)"
                />
            </div>
        );
    },
};

export const DefaultFilterDemo: Story = {
    name: "defaultCommandPaletteFilter (substrings)",
    render: () => {
        return (
            <div class="min-h-screen space-y-4 bg-void-950 p-8 text-[12px] text-void-400">
                <p>
                    The default filter returns rows where the query appears as a
                    substring in the concatenation of label, description, and
                    keywords. Try <code class="text-void-200">set</code>,{" "}
                    <code class="text-void-200">home</code>, or{" "}
                    <code class="text-void-200">worktree</code>.
                </p>
                <pre class="overflow-x-auto rounded border border-void-700 bg-void-900 p-3 font-mono text-[11px] text-void-300">
                    {`defaultCommandPaletteFilter("set", items)
→ ${defaultCommandPaletteFilter("set", baseItems)
                        .map((i) => i.id)
                        .join(", ")}`}
                </pre>
            </div>
        );
    },
};
