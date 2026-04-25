import type { Preview } from "storybook-solidjs-vite";
import "../src/style.css";

const preview: Preview = {
    parameters: {
        backgrounds: {
            options: {
                void: { name: "Void", value: "#050610" },
                panel: { name: "Panel", value: "#080a18" },
                surface: { name: "Surface", value: "#0c1024" },
                elevated: { name: "Elevated", value: "#131730" },
            },
        },
    },
    initialGlobals: {
        backgrounds: { value: "void" },
    },
};

export default preview;
