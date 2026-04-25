import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { ResizeHandle } from "./resize-handle";

const meta = {
    title: "Layout/ResizeHandle",
    component: ResizeHandle,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof ResizeHandle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
    render: () => {
        const [width, setWidth] = createSignal(280);
        return (
            <div class="flex h-64 w-full overflow-hidden rounded-lg border border-slate-800/60 bg-app-panel">
                <aside
                    class="overflow-auto bg-app-surface p-3 text-xs text-slate-300"
                    style={{ width: `${width()}px` }}
                >
                    <p class="font-medium text-slate-100">Sidebar</p>
                    <p class="mt-1 text-slate-500">{width()}px wide</p>
                </aside>
                <ResizeHandle
                    direction="horizontal"
                    onResize={(delta) =>
                        setWidth((w) =>
                            Math.max(140, Math.min(540, w - delta)),
                        )
                    }
                />
                <main class="flex-1 p-4 text-sm text-slate-300">
                    Drag the handle to resize the sidebar.
                </main>
            </div>
        );
    },
};

export const Vertical: Story = {
    render: () => {
        const [height, setHeight] = createSignal(140);
        return (
            <div class="flex h-72 w-full flex-col overflow-hidden rounded-lg border border-slate-800/60 bg-app-panel">
                <main class="flex-1 p-4 text-sm text-slate-300">
                    Drag the handle to resize the bottom dock.
                </main>
                <ResizeHandle
                    direction="vertical"
                    onResize={(delta) =>
                        setHeight((h) =>
                            Math.max(60, Math.min(260, h + delta)),
                        )
                    }
                />
                <footer
                    class="overflow-auto bg-app-surface p-3 text-xs text-slate-300"
                    style={{ height: `${height()}px` }}
                >
                    <p class="font-medium text-slate-100">Bottom dock</p>
                    <p class="mt-1 text-slate-500">{height()}px tall</p>
                </footer>
            </div>
        );
    },
};
