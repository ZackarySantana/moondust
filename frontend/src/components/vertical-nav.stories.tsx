import {
    MemoryRouter,
    Route,
    createMemoryHistory,
} from "@solidjs/router";
import Bot from "lucide-solid/icons/bot";
import GitBranch from "lucide-solid/icons/git-branch";
import Settings from "lucide-solid/icons/settings";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import type { VerticalNavItem } from "./vertical-nav";
import { VerticalNav } from "./vertical-nav";

const BASE = "/project/demo/settings";

const SECTIONS: VerticalNavItem[] = [
    { id: "general", label: "General", icon: Settings },
    { id: "git", label: "Git", icon: GitBranch },
    { id: "agent", label: "Agent", icon: Bot },
];

const SECTIONS_NO_ICONS: VerticalNavItem[] = [
    { id: "general", label: "General" },
    { id: "git", label: "Git" },
];

function memoryAt(path: string) {
    const h = createMemoryHistory();
    h.set({ value: path, replace: true, scroll: false });
    return h;
}

/**
 * `<A>` from `@solidjs/router` requires `RouterContext` from a matched `Route` outlet.
 * `MemoryRouter` alone does not render direct children; they must be a `Route` `component`.
 * Do not set `meta.component` — Autodocs would render `VerticalNav` without a router.
 */
const meta = {
    title: "Layout/VerticalNav",
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const GeneralActive: Story = {
    render: () => (
        <MemoryRouter history={memoryAt(`${BASE}/general`)}>
            <Route
                path="/project/demo/settings/general"
                component={() => (
                    <VerticalNav
                        items={SECTIONS}
                        baseHref={BASE}
                        activeId="general"
                        navLabel="Project settings"
                    />
                )}
            />
        </MemoryRouter>
    ),
};

export const GitActive: Story = {
    render: () => (
        <MemoryRouter history={memoryAt(`${BASE}/git`)}>
            <Route
                path="/project/demo/settings/git"
                component={() => (
                    <VerticalNav
                        items={SECTIONS}
                        baseHref={BASE}
                        activeId="git"
                        navLabel="Project settings"
                    />
                )}
            />
        </MemoryRouter>
    ),
};

export const TextOnly: Story = {
    render: () => (
        <MemoryRouter history={memoryAt(`${BASE}/git`)}>
            <Route
                path="/project/demo/settings/git"
                component={() => (
                    <VerticalNav
                        items={SECTIONS_NO_ICONS}
                        baseHref={BASE}
                        activeId="git"
                        navLabel="Sections"
                    />
                )}
            />
        </MemoryRouter>
    ),
};
