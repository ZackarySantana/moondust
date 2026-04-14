import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { ResizeHandle } from "./resize-handle";

const meta = {
    title: "Layout/ResizeHandle",
    component: ResizeHandle,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof ResizeHandle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
    render: () => {
        const [width, setWidth] = createSignal(160);
        return (
            <div class="flex h-36 w-full max-w-lg overflow-hidden rounded-lg border border-slate-800/60 bg-slate-950/40">
                <div
                    class="flex shrink-0 items-center justify-center bg-slate-900/50 text-xs text-slate-400"
                    style={{ width: `${width()}px` }}
                >
                    {width()}px
                </div>
                <ResizeHandle
                    direction="horizontal"
                    onResize={(delta) =>
                        setWidth((w) => Math.max(72, Math.min(400, w - delta)))
                    }
                />
                <div class="flex min-w-0 flex-1 items-center justify-center bg-slate-950/30 text-xs text-slate-500">
                    Flexible
                </div>
            </div>
        );
    },
};

export const Vertical: Story = {
    render: () => {
        const [top, setTop] = createSignal(100);
        return (
            <div class="flex h-56 w-full max-w-md flex-col overflow-hidden rounded-lg border border-slate-800/60 bg-slate-950/40">
                <div
                    class="flex shrink-0 items-center justify-center bg-slate-900/50 text-xs text-slate-400"
                    style={{ height: `${top()}px` }}
                >
                    {top()}px
                </div>
                <ResizeHandle
                    direction="vertical"
                    onResize={(delta) =>
                        setTop((h) => Math.max(48, Math.min(220, h - delta)))
                    }
                />
                <div class="flex min-h-0 flex-1 items-center justify-center bg-slate-950/30 text-xs text-slate-500">
                    Bottom pane
                </div>
            </div>
        );
    },
};
