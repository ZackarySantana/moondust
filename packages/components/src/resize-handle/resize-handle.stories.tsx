import { createSignal, type JSX } from "solid-js";
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

const Frame = (props: { children: JSX.Element; label: string }) => (
    <div class="min-h-screen bg-void-950 p-10">
        <div class="mx-auto max-w-3xl">
            <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                {props.label}
            </p>
            {props.children}
        </div>
    </div>
);

export const Horizontal: Story = {
    render: () => {
        const [width, setWidth] = createSignal(280);
        return (
            <Frame label="horizontal — drag the handle to resize the sidebar">
                <div class="flex h-72 w-full overflow-hidden border border-void-700 bg-void-900">
                    <aside
                        class="overflow-auto border-r border-void-700 bg-void-850 p-4"
                        style={{ width: `${width()}px` }}
                    >
                        <p class="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                            Threads
                        </p>
                        <div class="space-y-px text-sm text-void-400">
                            <div class="border-l-2 border-starlight-400 bg-void-800 px-2 py-1.5 text-void-50">
                                Refactor router
                            </div>
                            <div class="border-l-2 border-transparent px-2 py-1.5">
                                Replace floating-ui
                            </div>
                        </div>
                        <p class="mt-4 font-mono text-[10px] tabular-nums text-void-500">
                            {width()}px wide
                        </p>
                    </aside>
                    <ResizeHandle
                        direction="horizontal"
                        onResize={(delta) =>
                            setWidth((w) =>
                                Math.max(160, Math.min(560, w - delta)),
                            )
                        }
                    />
                    <main class="flex-1 p-5 text-sm text-void-300">
                        Drag the thin handle to resize the sidebar. The grip
                        glows starlight while hovered, and brightens further
                        while dragging.
                    </main>
                </div>
            </Frame>
        );
    },
};

export const Vertical: Story = {
    render: () => {
        const [height, setHeight] = createSignal(160);
        return (
            <Frame label="vertical — drag the handle to resize the bottom dock">
                <div class="flex h-96 w-full flex-col overflow-hidden border border-void-700 bg-void-900">
                    <main class="flex-1 p-5 text-sm text-void-300">
                        <p class="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                            Editor
                        </p>
                        <p>
                            Drag the horizontal handle below to resize the
                            terminal dock.
                        </p>
                    </main>
                    <ResizeHandle
                        direction="vertical"
                        onResize={(delta) =>
                            setHeight((h) =>
                                Math.max(80, Math.min(280, h + delta)),
                            )
                        }
                    />
                    <footer
                        class="overflow-auto border-t border-void-700 bg-void-850 p-4"
                        style={{ height: `${height()}px` }}
                    >
                        <p class="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                            Terminal
                        </p>
                        <pre class="font-mono text-[12px] leading-relaxed text-void-300">
{`$ pnpm dev
  ready started server on 0.0.0.0:3000
  compiled successfully in 1.2s`}
                        </pre>
                        <p class="mt-3 font-mono text-[10px] tabular-nums text-void-500">
                            {height()}px tall
                        </p>
                    </footer>
                </div>
            </Frame>
        );
    },
};

export const InContext: Story = {
    parameters: { layout: "fullscreen" },
    render: () => {
        const [sidebarW, setSidebarW] = createSignal(220);
        const [inspectorW, setInspectorW] = createSignal(280);
        const [dockH, setDockH] = createSignal(140);
        return (
            <div class="min-h-screen bg-void-950 p-10">
                <div class="mx-auto max-w-6xl">
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        three pane shell — sidebar, main with terminal dock,
                        inspector
                    </p>
                    <div class="flex h-[36rem] overflow-hidden border border-void-700 bg-void-900">
                        <aside
                            class="overflow-auto border-r border-void-700 bg-void-850 p-3"
                            style={{ width: `${sidebarW()}px` }}
                        >
                            <p class="mb-2 px-1 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                                Threads
                            </p>
                            <div class="space-y-px text-sm text-void-400">
                                <div class="border-l-2 border-starlight-400 bg-void-800 px-2 py-1.5 text-void-50">
                                    Refactor router
                                </div>
                                <div class="border-l-2 border-transparent px-2 py-1.5">
                                    Replace floating-ui
                                </div>
                                <div class="border-l-2 border-transparent px-2 py-1.5">
                                    Investigate flaky test
                                </div>
                            </div>
                            <p class="mt-3 px-1 font-mono text-[10px] tabular-nums text-void-500">
                                {sidebarW()}px
                            </p>
                        </aside>
                        <ResizeHandle
                            direction="horizontal"
                            onResize={(delta) =>
                                setSidebarW((w) =>
                                    Math.max(160, Math.min(360, w - delta)),
                                )
                            }
                        />

                        <div class="flex flex-1 flex-col">
                            <main class="flex-1 overflow-auto p-5 text-sm text-void-200">
                                <p class="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                                    Editor
                                </p>
                                <p>
                                    Drag any of the three handles to resize
                                    the surrounding panes.
                                </p>
                            </main>
                            <ResizeHandle
                                direction="vertical"
                                onResize={(delta) =>
                                    setDockH((h) =>
                                        Math.max(
                                            80,
                                            Math.min(280, h + delta),
                                        ),
                                    )
                                }
                            />
                            <footer
                                class="overflow-auto border-t border-void-700 bg-void-850 p-4"
                                style={{ height: `${dockH()}px` }}
                            >
                                <p class="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                                    Terminal · {dockH()}px
                                </p>
                                <pre class="font-mono text-[12px] leading-relaxed text-void-300">
{`$ pnpm test
  PASS  packages/components`}
                                </pre>
                            </footer>
                        </div>

                        <ResizeHandle
                            direction="horizontal"
                            onResize={(delta) =>
                                setInspectorW((w) =>
                                    Math.max(200, Math.min(420, w + delta)),
                                )
                            }
                        />
                        <aside
                            class="overflow-auto border-l border-void-700 bg-void-850 p-3"
                            style={{ width: `${inspectorW()}px` }}
                        >
                            <p class="mb-2 px-1 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                                Inspector
                            </p>
                            <div class="space-y-3 text-sm text-void-300">
                                <div>
                                    <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                                        model
                                    </p>
                                    <code class="text-[12px] text-nebula-300">
                                        claude-3.5-sonnet
                                    </code>
                                </div>
                                <div>
                                    <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                                        tokens
                                    </p>
                                    <p class="font-mono tabular-nums">
                                        12,481
                                    </p>
                                </div>
                                <div>
                                    <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                                        cost
                                    </p>
                                    <p class="font-mono tabular-nums text-starlight-300">
                                        $0.0124
                                    </p>
                                </div>
                            </div>
                            <p class="mt-3 px-1 font-mono text-[10px] tabular-nums text-void-500">
                                {inspectorW()}px
                            </p>
                        </aside>
                    </div>
                </div>
            </div>
        );
    },
};
