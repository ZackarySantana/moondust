import { createSignal, type JSX } from "solid-js";
import Bell from "lucide-solid/icons/bell";
import Bot from "lucide-solid/icons/bot";
import Folder from "lucide-solid/icons/folder";
import GitBranch from "lucide-solid/icons/git-branch";
import Info from "lucide-solid/icons/info";
import Keyboard from "lucide-solid/icons/keyboard";
import Settings from "lucide-solid/icons/settings";
import Wrench from "lucide-solid/icons/wrench";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import type { VerticalNavItem } from "./vertical-nav";
import { VerticalNav } from "./vertical-nav";

const PROJECT_SECTIONS: VerticalNavItem[] = [
    { id: "general", label: "General", icon: Settings },
    { id: "git", label: "Git", icon: GitBranch },
    { id: "agent", label: "Agent", icon: Bot },
    { id: "environment", label: "Environment", icon: Wrench },
];

const APP_SECTIONS: VerticalNavItem[] = [
    { id: "projects", label: "Projects", icon: Folder },
    { id: "providers", label: "Providers", icon: Bot },
    { id: "git", label: "Git", icon: GitBranch },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
    { id: "about", label: "About", icon: Info },
];

const TEXT_ONLY_SECTIONS: VerticalNavItem[] = [
    { id: "general", label: "General" },
    { id: "git", label: "Git" },
    { id: "agent", label: "Agent" },
];

const meta = {
    title: "Layout/VerticalNav",
    component: VerticalNav,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof VerticalNav>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = (props: { children: JSX.Element; label: string }) => (
    <div class="min-h-screen bg-void-950 p-10">
        <div class="mx-auto max-w-3xl">
            <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                {props.label}
            </p>
            <div class="border border-void-700 bg-void-900 p-4">
                {props.children}
            </div>
        </div>
    </div>
);

export const ProjectSettings: Story = {
    render: () => (
        <Frame label="project / settings">
            <VerticalNav
                items={PROJECT_SECTIONS}
                baseHref="/project/demo/settings"
                activeId="general"
                navLabel="Project settings"
            />
        </Frame>
    ),
};

export const AppSettings: Story = {
    render: () => (
        <Frame label="app / settings">
            <VerticalNav
                items={APP_SECTIONS}
                baseHref="/settings"
                activeId="providers"
                navLabel="Settings"
            />
        </Frame>
    ),
};

export const TextOnly: Story = {
    render: () => (
        <Frame label="text only">
            <VerticalNav
                items={TEXT_ONLY_SECTIONS}
                baseHref="/settings"
                activeId="git"
                navLabel="Sections"
            />
        </Frame>
    ),
};

export const Empty: Story = {
    render: () => (
        <Frame label="empty">
            <VerticalNav
                items={[]}
                baseHref="/settings"
                activeId=""
                navLabel="Empty nav"
            />
        </Frame>
    ),
};

export const InteractiveRouter: Story = {
    parameters: { layout: "padded" },
    render: () => {
        const [active, setActive] = createSignal("general");
        return (
            <Frame label="renderLink with onClick">
                <VerticalNav
                    items={PROJECT_SECTIONS}
                    baseHref="/project/demo/settings"
                    activeId={active()}
                    navLabel="Project settings"
                    renderLink={(p) => {
                        const id = p.href.split("/").pop()!;
                        return (
                            <button
                                type="button"
                                class={p.class}
                                onClick={() => setActive(id)}
                            >
                                {p.children}
                            </button>
                        );
                    }}
                />
            </Frame>
        );
    },
};

export const InContext: Story = {
    parameters: { layout: "fullscreen" },
    render: () => {
        const [active, setActive] = createSignal("agent");
        return (
            <div class="min-h-screen bg-void-950 p-10">
                <div class="mx-auto max-w-5xl border border-void-700 bg-void-900">
                    <header class="flex items-center justify-between border-b border-void-700 bg-void-850 px-5 py-3">
                        <div class="flex items-baseline gap-3">
                            <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-starlight-400">
                                project
                            </span>
                            <span class="text-sm font-medium text-void-100">
                                moondust-companion
                            </span>
                            <code class="text-[12px] text-void-400">
                                ~/code/moondust-companion
                            </code>
                        </div>
                        <span class="text-xs text-void-400">Settings</span>
                    </header>

                    <div class="grid grid-cols-[200px_1fr]">
                        <aside class="border-r border-void-700 bg-void-900 p-3">
                            <p class="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                                Sections
                            </p>
                            <VerticalNav
                                items={PROJECT_SECTIONS}
                                baseHref="/project/demo/settings"
                                activeId={active()}
                                navLabel="Project settings"
                                renderLink={(p) => {
                                    const id = p.href.split("/").pop()!;
                                    return (
                                        <button
                                            type="button"
                                            class={p.class}
                                            onClick={() => setActive(id)}
                                        >
                                            {p.children}
                                        </button>
                                    );
                                }}
                            />
                        </aside>
                        <main class="p-6">
                            <h2 class="text-xl font-semibold tracking-tight text-void-50">
                                {SECTION_LABEL[active()] ?? "General"}
                            </h2>
                            <p class="mt-2 text-sm text-void-400">
                                Active section is{" "}
                                <code class="text-[12px] text-nebula-300">
                                    {active()}
                                </code>
                                . The vertical nav signals state with a
                                starlight border on the left and a brighter
                                surface tone.
                            </p>
                        </main>
                    </div>
                </div>
            </div>
        );
    },
};

const SECTION_LABEL: Record<string, string> = {
    general: "General",
    git: "Git",
    agent: "Agent",
    environment: "Environment",
};
