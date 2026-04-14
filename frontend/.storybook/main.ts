import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineMain } from "storybook-solidjs-vite";
import { mergeConfig, type UserConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Same site as Docusaurus (`packages/docs/docusaurus.config.ts` `url` + `baseUrl`).
 * Canonical Storybook URL: https://docs.moondust.pro/storybook/
 */
const STORYBOOK_DEPLOY_BASE = "/storybook/";

export default defineMain({
    stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: ["@storybook/addon-docs"],
    framework: {
        name: "storybook-solidjs-vite",
        options: {},
    },
    async viteFinal(_config) {
        const extra: UserConfig = {
            plugins: [tailwindcss()],
            resolve: {
                alias: {
                    "@": path.resolve(__dirname, "../src"),
                    "@wails": path.resolve(__dirname, "../wailsjs"),
                },
            },
        };
        // Production builds: asset base matches static hosting next to Docusaurus.
        // Storybook's viteFinal leaves `config.mode` unset; `NODE_ENV` is set for `storybook build`.
        if (process.env.NODE_ENV === "production") {
            extra.base = STORYBOOK_DEPLOY_BASE;
        }
        return mergeConfig(_config, extra);
    },
});
