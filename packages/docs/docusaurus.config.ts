import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    title: "Moondust",
    tagline: "Desktop command center for AI agents.",
    favicon: "img/favicon.ico",

    // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
    future: {
        v4: true, // Improve compatibility with the upcoming Docusaurus v4
    },

    // Set the production url of your site here
    url: "https://docs.moondust.pro",
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: "/",

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: "zackarysantana",
    projectName: "moondust",

    onBrokenLinks: "throw",

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },

    presets: [
        [
            "classic",
            {
                docs: {
                    sidebarPath: "./sidebars.ts",
                    editUrl:
                        "https://github.com/zackarysantana/moondust/edit/main/packages/docs/",
                },
                blog: false,
                theme: {
                    customCss: "./src/css/custom.css",
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        // Replace with your project's social card
        image: "img/docusaurus-social-card.jpg",
        colorMode: {
            respectPrefersColorScheme: true,
        },
        navbar: {
            title: "Moondust",
            logo: {
                alt: "Moondust",
                src: "img/logo.svg",
            },
            items: [
                {
                    type: "docSidebar",
                    sidebarId: "tutorialSidebar",
                    position: "left",
                    label: "Docs",
                },
                {
                    href: "https://docs.moondust.pro/storybook",
                    label: "Storybook",
                    position: "right",
                },
                {
                    href: "https://github.com/zackarysantana/moondust",
                    label: "GitHub",
                    position: "right",
                },
            ],
        },
        footer: {
            style: "dark",
            links: [
                {
                    title: "Docs",
                    items: [
                        {
                            label: "Introduction",
                            to: "/docs/intro",
                        },
                        {
                            label: "Providers",
                            to: "/docs/providers/overview",
                        },
                        {
                            label: "Installation",
                            to: "/docs/getting-started/installation",
                        },
                        {
                            label: "Future plans",
                            to: "/docs/plans/multi-device-shared-server",
                        },
                        {
                            label: "Storybook",
                            href: "https://docs.moondust.pro/storybook",
                        },
                    ],
                },
                {
                    title: "Project",
                    items: [
                        {
                            label: "GitHub",
                            href: "https://github.com/zackarysantana/moondust",
                        },
                        {
                            label: "npm",
                            href: "https://www.npmjs.com/package/moondust",
                        },
                        {
                            label: "OpenRouter",
                            href: "https://openrouter.ai/",
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Moondust. Built with Docusaurus.`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
