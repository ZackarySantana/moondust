import path from "node:path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [tailwindcss(), solid()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@wails": path.resolve(__dirname, "../wails-app/wailsjs"),
        },
    },
});
