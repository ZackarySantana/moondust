import Bell from "lucide-solid/icons/bell";
import Blocks from "lucide-solid/icons/blocks";
import Folder from "lucide-solid/icons/folder";
import GitBranch from "lucide-solid/icons/git-branch";
import Info from "lucide-solid/icons/info";
import Keyboard from "lucide-solid/icons/keyboard";
import Layers from "lucide-solid/icons/layers";
import ScrollText from "lucide-solid/icons/scroll-text";
import Sparkles from "lucide-solid/icons/sparkles";
import TerminalIcon from "lucide-solid/icons/terminal";
import Wrench from "lucide-solid/icons/wrench";
import type { VerticalNavItem } from "@/components/vertical-nav";

export type SettingsSection = VerticalNavItem;

export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
    { id: "projects", label: "Projects", icon: Folder },
    { id: "providers", label: "Providers", icon: Blocks },
    { id: "git", label: "Git", icon: GitBranch },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "shortcuts", label: "Keyboard Shortcuts", icon: Keyboard },
    { id: "environments", label: "Environments", icon: Layers },
    { id: "agent-tools", label: "Agent tools", icon: Wrench },
    { id: "features", label: "Features", icon: Sparkles },
    { id: "logs", label: "Logs", icon: ScrollText },
    { id: "terminal", label: "Terminal", icon: TerminalIcon },
    { id: "about", label: "About", icon: Info },
];

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]["id"];
