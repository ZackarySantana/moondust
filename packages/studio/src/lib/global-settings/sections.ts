import type { VerticalNavItem } from "@moondust/components";
import Bot from "lucide-solid/icons/bot";
import GitBranch from "lucide-solid/icons/git-branch";
import Globe from "lucide-solid/icons/globe";
import SlidersHorizontal from "lucide-solid/icons/sliders-horizontal";
import Sparkles from "lucide-solid/icons/sparkles";

import { paths } from "@/lib/workspace";

export type GlobalSettingsNavItem = VerticalNavItem;

/**
 * Global settings sidebar: one entry for app-wide options, then one per
 * chat agent / provider Moondust can drive.
 */
export const GLOBAL_SETTINGS_NAV: readonly GlobalSettingsNavItem[] = [
    {
        id: "general",
        label: "General",
        icon: SlidersHorizontal,
    },
    {
        id: "cursor",
        label: "Cursor Agent",
        icon: Bot,
    },
    {
        id: "claude",
        label: "Claude Code",
        icon: Sparkles,
    },
    {
        id: "openrouter",
        label: "OpenRouter",
        icon: Globe,
    },
    {
        id: "git",
        label: "Git",
        icon: GitBranch,
        href: paths.globalSettingsGit("worktrees"),
    },
] as const;

/** Top-level nav ids (sidebar). */
export const GLOBAL_SETTINGS_SECTION_IDS: ReadonlySet<string> = new Set(
    GLOBAL_SETTINGS_NAV.map((s) => s.id),
);

/** Sections rendered at `/settings/:section` (no second path segment). */
export const GLOBAL_SETTINGS_FLAT_SECTION_IDS: ReadonlySet<string> = new Set([
    "general",
    "cursor",
    "claude",
    "openrouter",
]);

export type GitSettingsSubsection = "worktrees" | "authentication";

export function labelForGlobalSettingsSection(id: string): string {
    return GLOBAL_SETTINGS_NAV.find((s) => s.id === id)?.label ?? id;
}
