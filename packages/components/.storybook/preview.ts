import type { Preview } from "storybook-solidjs-vite";
import "../src/style.css";

const preview: Preview = {
    parameters: {
        backgrounds: {
            options: {
                dark: { name: "Dark", value: "#333" },
            },
        },
    },
    initialGlobals: {
        backgrounds: { value: "dark" },
    },
};

export default preview;
