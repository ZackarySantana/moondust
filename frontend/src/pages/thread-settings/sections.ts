import Folder from "lucide-solid/icons/folder";
import type { VerticalNavItem } from "@/components/vertical-nav";

/** Single-section nav; keeps layout aligned with project and app settings shells. */
export const THREAD_SETTINGS_SECTIONS: readonly VerticalNavItem[] = [
    { id: "general", label: "General", icon: Folder },
];
