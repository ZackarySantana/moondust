import Folder from "lucide-solid/icons/folder";
import Blocks from "lucide-solid/icons/blocks";
import GitBranch from "lucide-solid/icons/git-branch";
import Layers from "lucide-solid/icons/layers";
import Sparkles from "lucide-solid/icons/sparkles";
import Info from "lucide-solid/icons/info";
import ScrollText from "lucide-solid/icons/scroll-text";
import TerminalIcon from "lucide-solid/icons/terminal";
import type { VerticalNavItem } from "@/components/vertical-nav";

export type SettingsSection = VerticalNavItem;

export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
    { id: "projects", label: "Projects", icon: Folder },
    { id: "providers", label: "Providers", icon: Blocks },
    { id: "git", label: "Git", icon: GitBranch },
    { id: "environments", label: "Environments", icon: Layers },
    { id: "features", label: "Features", icon: Sparkles },
    { id: "logs", label: "Logs", icon: ScrollText },
    { id: "terminal", label: "Terminal", icon: TerminalIcon },
    { id: "about", label: "About", icon: Info },
];

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]["id"];
