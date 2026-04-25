import RefreshCcw from "lucide-solid/icons/refresh-ccw";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { CollapsibleSection } from "./collapsible-section";

const meta = {
    title: "Review/CollapsibleSection",
    component: CollapsibleSection,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof CollapsibleSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Emerald: Story = {
    args: {
        title: "Staged",
        count: 3,
        tone: "emerald",
        children: (
            <ul class="space-y-1 text-[11px] text-slate-400">
                <li>app.go</li>
                <li>main.go</li>
                <li>README.md</li>
            </ul>
        ),
    },
};

export const Amber: Story = {
    args: {
        title: "Unstaged",
        count: 5,
        tone: "amber",
        children: (
            <ul class="space-y-1 text-[11px] text-slate-400">
                <li>internal/db.go</li>
                <li>internal/server.go</li>
                <li>web/index.tsx</li>
                <li>web/layout.tsx</li>
                <li>web/styles.css</li>
            </ul>
        ),
    },
};

export const Sky: Story = {
    args: {
        title: "Untracked",
        count: 2,
        tone: "sky",
        children: (
            <ul class="space-y-1 text-[11px] text-slate-400">
                <li>NEW-FILE.md</li>
                <li>scripts/dev.sh</li>
            </ul>
        ),
    },
};

export const Violet: Story = {
    args: {
        title: "Stash",
        count: 1,
        tone: "violet",
        children: (
            <p class="text-[11px] text-slate-400">
                stash@{0}: WIP on main: refactor parser
            </p>
        ),
    },
};

export const SlateEmpty: Story = {
    args: {
        title: "Conflicts",
        count: 0,
        tone: "slate",
        children: (
            <p class="text-[11px] text-slate-500">No conflicts. You're clear.</p>
        ),
    },
};

export const WithTrailing: Story = {
    args: {
        title: "Recent commits",
        count: 12,
        tone: "violet",
        trailing: (
            <button
                type="button"
                class="cursor-pointer rounded p-1 text-slate-500 transition-colors hover:bg-slate-800/40 hover:text-slate-200"
                aria-label="Refresh"
            >
                <RefreshCcw
                    class="size-3"
                    stroke-width={2}
                    aria-hidden
                />
            </button>
        ),
        children: (
            <p class="text-[11px] text-slate-400">12 commits in this branch.</p>
        ),
    },
};

export const ClosedByDefault: Story = {
    args: {
        title: "Verbose",
        count: 4,
        tone: "slate",
        defaultOpen: false,
        children: (
            <p class="text-[11px] text-slate-400">Open me.</p>
        ),
    },
};
