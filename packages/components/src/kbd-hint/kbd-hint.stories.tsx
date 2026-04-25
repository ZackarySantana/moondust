import Plus from "lucide-solid/icons/plus";
import Settings from "lucide-solid/icons/settings";
import type { JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { KbdHint } from "./kbd-hint";

const meta = {
    title: "UI/KbdHint",
    component: KbdHint,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    args: {
        combo: ["⌘", "N"],
        size: "xs",
    },
    argTypes: {
        size: { control: { type: "select" }, options: ["xs", "sm"] },
        side: {
            control: { type: "select" },
            options: [undefined, "top", "right", "bottom", "left"],
        },
    },
} satisfies Meta<typeof KbdHint>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = (props: { children: JSX.Element }) => (
    <div class="min-w-3xl bg-void-950 p-10">
        <div class="space-y-8">{props.children}</div>
    </div>
);

const Row = (props: { label: string; children: JSX.Element }) => (
    <div class="grid grid-cols-[140px_1fr] items-center gap-6">
        <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
            {props.label}
        </span>
        <div class="flex flex-wrap items-center gap-6">{props.children}</div>
    </div>
);

export const Playground: Story = {};

export const Sizes: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="xs">
                <KbdHint combo={["⌘", "K"]} size="xs" />
                <KbdHint combo="⌘+Shift+P" size="xs" />
                <KbdHint combo="?" size="xs" />
            </Row>
            <Row label="sm">
                <KbdHint combo={["⌘", "K"]} size="sm" />
                <KbdHint combo="⌘+Shift+P" size="sm" />
                <KbdHint combo="?" size="sm" />
            </Row>
        </Frame>
    ),
};

export const InputFormats: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="array">
                <KbdHint combo={["⌘", "Shift", "P"]} size="sm" />
            </Row>
            <Row label="string + plus">
                <KbdHint combo="⌘+K" size="sm" />
            </Row>
            <Row label="string + space">
                <KbdHint combo="Ctrl Alt T" size="sm" />
            </Row>
            <Row label="single key">
                <KbdHint combo="Esc" size="sm" />
            </Row>
        </Frame>
    ),
};

export const InContext: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-2xl space-y-8">
                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    in context — hover to reveal
                </p>

                <div class="border border-void-700 bg-void-900 p-3">
                    <p class="mb-2 px-1 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        sidebar group · hover any row
                    </p>
                    <ul class="space-y-0.5">
                        <SidebarRow label="Refactor router" combo={["⌘", "1"]} />
                        <SidebarRow label="Fix flake in CI" combo={["⌘", "2"]} />
                        <SidebarRow
                            label="Wire up new auth flow"
                            combo={["⌘", "3"]}
                        />
                    </ul>
                </div>

                <div class="border border-void-700 bg-void-900 p-3">
                    <p class="mb-2 px-1 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        sidebar section header · hover for shortcut + add
                    </p>
                    <div class="group/section flex items-center justify-between rounded-none px-2 py-1.5">
                        <span class="text-[11px] font-semibold uppercase tracking-widest text-void-500">
                            Projects
                        </span>
                        <span class="relative inline-flex items-center">
                            <KbdHint
                                combo="⌘+Shift+N"
                                side="left"
                                class="opacity-0 transition-opacity group-hover/section:opacity-100"
                            />
                            <button
                                type="button"
                                class="cursor-pointer p-0.5 text-void-500 transition-colors hover:bg-void-800 hover:text-void-200"
                                aria-label="New project"
                            >
                                <Plus class="size-3.5" stroke-width={2} />
                            </button>
                        </span>
                    </div>
                </div>

                <div class="border border-void-700 bg-void-900 p-3">
                    <p class="mb-2 px-1 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        nav link · trailing inline hint
                    </p>
                    <a
                        href="#"
                        class="flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium text-void-300 transition-colors hover:bg-void-800/40 hover:text-void-100"
                    >
                        <Settings class="size-4" stroke-width={1.75} aria-hidden />
                        Settings
                        <span class="ml-auto">
                            <KbdHint combo="⌘+," size="sm" />
                        </span>
                    </a>
                </div>
            </div>
        </div>
    ),
};

const SidebarRow = (props: {
    label: string;
    combo: readonly string[];
}) => (
    <li class="group/row flex items-center justify-between rounded-none px-2 py-1.5 text-sm text-void-300 transition-colors hover:bg-void-800/40 hover:text-void-100">
        <span class="truncate">{props.label}</span>
        <KbdHint
            combo={props.combo}
            class="opacity-0 transition-opacity group-hover/row:opacity-100"
        />
    </li>
);
