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

export const ProjectSettings: Story = {
    args: {
        items: PROJECT_SECTIONS,
        baseHref: "/project/demo/settings",
        activeId: "general",
        navLabel: "Project settings",
    },
};

export const AppSettings: Story = {
    args: {
        items: APP_SECTIONS,
        baseHref: "/settings",
        activeId: "providers",
        navLabel: "Settings",
    },
};

export const GitActive: Story = {
    args: {
        items: PROJECT_SECTIONS,
        baseHref: "/project/demo/settings",
        activeId: "git",
        navLabel: "Project settings",
    },
};

export const TextOnly: Story = {
    args: {
        items: TEXT_ONLY_SECTIONS,
        baseHref: "/settings",
        activeId: "git",
        navLabel: "Sections",
    },
};

export const CustomLinkRenderer: Story = {
    render: () => (
        <VerticalNav
            items={PROJECT_SECTIONS}
            baseHref="/project/demo/settings"
            activeId="agent"
            navLabel="Project settings"
            renderLink={(p) => (
                <button
                    type="button"
                    class={p.class}
                    onClick={() => console.log("nav to", p.href)}
                >
                    {p.children}
                </button>
            )}
        />
    ),
};

export const Empty: Story = {
    args: {
        items: [],
        baseHref: "/settings",
        activeId: "",
        navLabel: "Empty nav",
    },
};
