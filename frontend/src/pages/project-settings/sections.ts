import Folder from "lucide-solid/icons/folder";
import GitBranch from "lucide-solid/icons/git-branch";
import Bot from "lucide-solid/icons/bot";
import Layers from "lucide-solid/icons/layers";
import TriangleAlert from "lucide-solid/icons/triangle-alert";
import type { VerticalNavItem } from "@/components/vertical-nav";

export const PROJECT_SETTINGS_SECTIONS: readonly VerticalNavItem[] = [
    { id: "general", label: "General", icon: Folder },
    { id: "git", label: "Git", icon: GitBranch },
    { id: "agent", label: "Agent", icon: Bot },
    { id: "environment", label: "Environment", icon: Layers },
    { id: "danger", label: "Danger Zone", icon: TriangleAlert },
];
