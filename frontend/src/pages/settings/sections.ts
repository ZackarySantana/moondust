import type { Component, JSX } from "solid-js";
import Folder from "lucide-solid/icons/folder";
import Blocks from "lucide-solid/icons/blocks";
import GitBranch from "lucide-solid/icons/git-branch";
import Layers from "lucide-solid/icons/layers";
import Sparkles from "lucide-solid/icons/sparkles";
import Info from "lucide-solid/icons/info";

export type IconComponent = Component<
    JSX.SvgSVGAttributes<SVGSVGElement> & { "stroke-width"?: number }
>;

export interface SettingsSection {
    id: string;
    label: string;
    icon: IconComponent;
}

export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
    { id: "projects", label: "Projects", icon: Folder },
    { id: "providers", label: "Providers", icon: Blocks },
    { id: "git", label: "Git", icon: GitBranch },
    { id: "environments", label: "Environments", icon: Layers },
    { id: "features", label: "Features", icon: Sparkles },
    { id: "about", label: "About", icon: Info },
];

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]["id"];
