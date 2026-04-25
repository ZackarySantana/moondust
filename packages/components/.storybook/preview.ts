import type { Preview } from "storybook-solidjs-vite";
import "../src/style.css";

const preview: Preview = {
    parameters: {
        backgrounds: {
            options: {
                app: { name: "App", value: "#080c0a" },
                panel: { name: "Panel", value: "#0c110f" },
                surface: { name: "Surface", value: "#121815" },
            },
        },
    },
    initialGlobals: {
        backgrounds: { value: "app" },
    },
};

export default preview;
