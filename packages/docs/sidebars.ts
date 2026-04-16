import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

/**
 * Explicit order: intro → getting started → features (incl. git sidebar) → providers → plans → contributing → architecture → storybook.
 */
const sidebars: SidebarsConfig = {
    tutorialSidebar: [
        "intro",
        {
            type: "category",
            label: "Getting started",
            items: ["getting-started/installation"],
        },
        {
            type: "category",
            label: "Features",
            items: [
                "features/overview",
                "features/workspaces",
                "features/git-sidebar",
            ],
        },
        {
            type: "category",
            label: "Providers",
            items: [
                "providers/overview",
                "providers/openrouter",
                "providers/cursor",
                "providers/pi",
                "providers/claude",
                "providers/codex",
            ],
        },
        {
            type: "category",
            label: "Plans",
            items: ["plans/multi-device-shared-server"],
        },
        "contributing",
        "architecture",
        "storybook",
    ],
};

export default sidebars;
