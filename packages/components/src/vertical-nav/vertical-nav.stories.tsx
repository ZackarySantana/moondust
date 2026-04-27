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
import {
    VerticalNav,
    VerticalNavMain,
    VerticalNavRail,
    VerticalNavSplit,
} from "./vertical-nav";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { Separator } from "../separator/separator";
import { Tooltip } from "../tooltip/tooltip";

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

/** Nav + body in one column (no app chrome sidebar). */
export const EmbeddedInPage: Story = {
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-5xl px-8">
                <p class="mb-6 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    settings / in-page rail
                </p>
                <header class="mb-8">
                    <h1 class="text-xl font-semibold text-void-50">Settings</h1>
                    <p class="mt-1 text-[13px] text-void-400">
                        Rail shares the same surface as the content.
                    </p>
                </header>
                <VerticalNavSplit>
                    <VerticalNavRail>
                        <VerticalNav
                            embedded
                            items={PROJECT_SECTIONS}
                            baseHref="/settings"
                            activeId="git"
                            navLabel="Sections"
                        />
                    </VerticalNavRail>
                    <VerticalNavMain>
                        <p class="text-[13px] text-void-300">
                            Main column content (forms, sections, etc.).
                        </p>
                    </VerticalNavMain>
                </VerticalNavSplit>
            </div>
        </div>
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
        const [active, setActive] = createSignal("git");
        return (
            <div class="min-h-screen bg-void-950">
                <div class="mx-auto h-screen max-w-7xl">
                    <div class="grid h-full grid-cols-[60px_220px_1fr] border-x border-void-700 bg-void-900">
                        {/* App rail (level 1) */}
                        <aside class="flex flex-col items-center gap-1 border-r border-void-700 bg-void-950 py-3">
                            <RailIcon
                                tip="Projects"
                                shortcut={["⌘", "1"]}
                                icon={Folder}
                            />
                            <RailIcon
                                tip="Providers"
                                shortcut={["⌘", "2"]}
                                icon={Bot}
                                active
                            />
                            <RailIcon
                                tip="Notifications"
                                shortcut={["⌘", "3"]}
                                icon={Bell}
                                badge="3"
                            />
                            <div class="mt-auto flex flex-col items-center gap-1">
                                <RailIcon
                                    tip="Shortcuts"
                                    shortcut={["⌘", "K"]}
                                    icon={Keyboard}
                                />
                                <RailIcon tip="About" icon={Info} />
                            </div>
                        </aside>

                        {/* Section nav (level 2) */}
                        <aside class="flex flex-col border-r border-void-700 bg-void-900 p-3">
                            <header class="mb-3 flex items-baseline justify-between px-2">
                                <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                                    Project
                                </span>
                                <Badge tone="starlight" size="sm" dot>
                                    Active
                                </Badge>
                            </header>
                            <p class="mb-1 truncate px-2 text-sm font-medium text-void-50">
                                moondust-companion
                            </p>
                            <code class="mb-3 block truncate px-2 font-mono text-[11px] text-void-400">
                                ~/code/moondust-companion
                            </code>
                            <Separator class="mb-3" />
                            <p class="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                                Settings
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
                            <div class="mt-auto px-2">
                                <Separator class="mb-3" />
                                <Tooltip
                                    content="Open project settings"
                                    shortcut={["⌘", ","]}
                                    side="right"
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        class="w-full justify-start"
                                    >
                                        <Settings
                                            class="size-3.5"
                                            stroke-width={2}
                                            aria-hidden
                                        />
                                        Settings
                                    </Button>
                                </Tooltip>
                            </div>
                        </aside>

                        {/* Main */}
                        <main class="flex flex-col overflow-hidden">
                            <header class="flex items-center justify-between border-b border-void-700 bg-void-850 px-5 py-3">
                                <div class="flex items-baseline gap-3">
                                    <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-starlight-400">
                                        settings
                                    </span>
                                    <span class="text-sm font-medium text-void-100">
                                        {SECTION_LABEL[active()] ?? "General"}
                                    </span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <Badge tone="nebula" mono size="sm">
                                        main
                                    </Badge>
                                    <Badge mono size="sm">
                                        12 changes
                                    </Badge>
                                </div>
                            </header>
                            <div class="flex-1 overflow-y-auto p-6">
                                <h2 class="text-xl font-semibold tracking-tight text-void-50">
                                    {SECTION_LABEL[active()] ?? "General"}
                                </h2>
                                <p class="mt-2 max-w-prose text-sm leading-relaxed text-void-400">
                                    {SECTION_DESCRIPTION[active()] ??
                                        "Pick a section from the left."}
                                </p>
                                <div class="mt-6 inline-flex items-center gap-2">
                                    <span class="font-mono text-[10px] uppercase tracking-[0.14em] text-void-500">
                                        active id
                                    </span>
                                    <Badge mono>{active()}</Badge>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        );
    },
};

const RailIcon = (props: {
    icon: (p: {
        class?: string;
        "stroke-width"?: number;
    }) => JSX.Element;
    tip: string;
    shortcut?: readonly string[];
    active?: boolean;
    badge?: string;
}) => {
    const Icon = props.icon;
    return (
        <Tooltip content={props.tip} shortcut={props.shortcut} side="right">
            <button
                type="button"
                class={`relative flex size-9 items-center justify-center rounded-none border-l-2 transition-colors duration-100 ${
                    props.active
                        ? "border-starlight-400 bg-void-800 text-starlight-300"
                        : "border-transparent text-void-500 hover:bg-void-800/60 hover:text-void-100"
                }`}
            >
                <Icon class="size-4" stroke-width={1.75} />
                {props.badge && (
                    <span class="absolute -top-0.5 -right-0.5">
                        <Badge tone="flare" size="sm" mono>
                            {props.badge}
                        </Badge>
                    </span>
                )}
            </button>
        </Tooltip>
    );
};

const SECTION_LABEL: Record<string, string> = {
    general: "General",
    git: "Git",
    agent: "Agent",
    environment: "Environment",
};

const SECTION_DESCRIPTION: Record<string, string> = {
    general:
        "Project name, path, and the surface used to identify this project across windows.",
    git: "Default branch, worktree behavior, and the rules used when forking from threads.",
    agent: "Default provider, model, system prompt, and the tools the agent is allowed to call.",
    environment:
        "Shell, package manager, and the environment variables passed to spawned commands.",
};
