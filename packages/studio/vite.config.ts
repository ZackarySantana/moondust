import path from "node:path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [tailwindcss(), solid()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port:
            typeof process.env.PORT === "string" &&
            Number.isFinite(Number(process.env.PORT))
                ? Number(process.env.PORT)
                : 5173,
    },
});
