import type { Meta, StoryObj } from "storybook-solidjs-vite";
import type { JSX } from "solid-js";
import { Separator } from "./separator";

const meta = {
    title: "UI/Separator",
    component: Separator,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

const Row = (props: { label: string; children: JSX.Element }) => (
    <div class="grid grid-cols-[110px_1fr] items-start gap-6">
        <span class="pt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
            {props.label}
        </span>
        <div>{props.children}</div>
    </div>
);

const Frame = (props: { children: JSX.Element }) => (
    <div class="min-w-3xl bg-void-950 p-10">
        <div class="space-y-8">{props.children}</div>
    </div>
);

export const Horizontal: Story = {
    render: () => (
        <Frame>
            <Row label="default">
                <div class="w-80 space-y-3 text-sm text-void-200">
                    <p>Section above</p>
                    <Separator />
                    <p>Section below</p>
                </div>
            </Row>
            <Row label="strong">
                <div class="w-80 space-y-3 text-sm text-void-200">
                    <p>Above</p>
                    <Separator class="bg-void-600" />
                    <p>Below</p>
                </div>
            </Row>
            <Row label="subtle">
                <div class="w-80 space-y-3 text-sm text-void-200">
                    <p>Above</p>
                    <Separator class="bg-void-800" />
                    <p>Below</p>
                </div>
            </Row>
            <Row label="accent">
                <div class="w-80 space-y-3 text-sm text-void-200">
                    <p>Above</p>
                    <Separator class="bg-starlight-400/50" />
                    <p>Below</p>
                </div>
            </Row>
        </Frame>
    ),
};

export const Vertical: Story = {
    render: () => (
        <Frame>
            <Row label="inline">
                <div class="flex h-6 items-center gap-3 text-sm text-void-200">
                    <span>Threads</span>
                    <Separator orientation="vertical" />
                    <span>Files</span>
                    <Separator orientation="vertical" />
                    <span>Settings</span>
                </div>
            </Row>
            <Row label="metadata">
                <div class="flex h-4 items-center gap-3 text-xs text-void-400">
                    <span>2 minutes ago</span>
                    <Separator orientation="vertical" class="h-3" />
                    <code class="text-[12px] text-nebula-300">
                        claude-3.5-sonnet
                    </code>
                    <Separator orientation="vertical" class="h-3" />
                    <span class="font-mono tabular-nums">12,481 tok</span>
                    <Separator orientation="vertical" class="h-3" />
                    <span class="font-mono tabular-nums text-starlight-300">
                        $0.0124
                    </span>
                </div>
            </Row>
            <Row label="toolbar">
                <div class="flex h-8 items-center gap-2 border border-void-700 bg-void-900 px-3 text-xs text-void-300">
                    <span>File</span>
                    <span>Edit</span>
                    <span>View</span>
                    <Separator orientation="vertical" class="mx-1 h-4" />
                    <code class="text-[11px] text-void-200">main</code>
                    <Separator orientation="vertical" class="mx-1 h-4" />
                    <span class="font-mono tabular-nums text-void-400">
                        12 changes
                    </span>
                </div>
            </Row>
        </Frame>
    ),
};

export const InCard: Story = {
    render: () => (
        <Frame>
            <Row label="settings card">
                <div class="w-80 border border-void-700 bg-void-900 p-5">
                    <h3 class="text-sm font-semibold tracking-tight text-void-50">
                        General
                    </h3>
                    <p class="mt-1 text-xs text-void-500">
                        Project-wide identity and naming.
                    </p>
                    <Separator class="my-4" />
                    <div class="space-y-2 text-[13px] text-void-200">
                        <p>Name</p>
                        <p>Path</p>
                        <p>Default branch</p>
                    </div>
                </div>
            </Row>
            <Row label="form actions">
                <div class="w-80 border border-void-700 bg-void-900">
                    <div class="space-y-2 p-5 text-[13px] text-void-200">
                        <p>moondust-companion</p>
                        <p>~/code/moondust-companion</p>
                    </div>
                    <Separator />
                    <div class="flex items-center justify-end gap-2 px-5 py-3 text-xs text-void-400">
                        <span>Cancel</span>
                        <span class="text-void-200">Save</span>
                    </div>
                </div>
            </Row>
            <Row label="grouped list">
                <div class="w-80 border border-void-700 bg-void-900 divide-y divide-void-700 [&>*]:py-3 [&>*]:px-4 [&>*]:text-sm [&>*]:text-void-200">
                    <div>Account</div>
                    <div>Notifications</div>
                    <div>Appearance</div>
                    <div>Shortcuts</div>
                </div>
            </Row>
        </Frame>
    ),
};

export const InContext: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-3xl border border-void-700 bg-void-900">
                <header class="flex items-center justify-between px-5 py-3">
                    <div class="flex items-baseline gap-3">
                        <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-starlight-400">
                            thread
                        </span>
                        <span class="text-sm font-medium text-void-100">
                            Refactor router
                        </span>
                    </div>
                    <div class="flex h-4 items-center gap-3 text-xs text-void-400">
                        <span>2 minutes ago</span>
                        <Separator orientation="vertical" class="h-3" />
                        <code class="text-[12px] text-nebula-300">
                            claude-3.5-sonnet
                        </code>
                        <Separator orientation="vertical" class="h-3" />
                        <span class="font-mono tabular-nums">12,481 tok</span>
                    </div>
                </header>
                <Separator />
                <article class="px-5 py-4">
                    <p class="text-sm leading-relaxed text-void-200">
                        The router currently lives at{" "}
                        <code class="text-[12px] text-void-100">
                            src/router.tsx
                        </code>{" "}
                        and pulls in{" "}
                        <code class="text-[12px] text-nebula-300">
                            @solidjs/router
                        </code>
                        .
                    </p>
                </article>
                <Separator />
                <footer class="flex items-center justify-between px-5 py-3 text-xs text-void-400">
                    <span>3 messages</span>
                    <span>Composer is read-only in this story.</span>
                </footer>
            </div>
        </div>
    ),
};
