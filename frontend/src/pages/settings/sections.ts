export const SETTINGS_SECTIONS = [
    { id: "projects", label: "Projects" },
    { id: "providers", label: "Providers" },
    { id: "git", label: "Git" },
    { id: "environments", label: "Environments" },
    { id: "features", label: "Features" },
    { id: "about", label: "About" },
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]["id"];
