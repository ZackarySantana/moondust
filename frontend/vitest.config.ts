import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@wails": path.resolve(__dirname, "./wailsjs"),
        },
    },
    test: {
        include: ["src/**/*.test.ts"],
    },
});
