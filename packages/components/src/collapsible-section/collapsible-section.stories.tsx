import RefreshCcw from "lucide-solid/icons/refresh-ccw";
import Plus from "lucide-solid/icons/plus";
import type { JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { CollapsibleSection } from "./collapsible-section";

const meta = {
    title: "Review/CollapsibleSection",
    component: CollapsibleSection,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof CollapsibleSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = (props: { children: JSX.Element; label: string }) => (
    <div class="min-h-screen bg-void-950 p-10">
        <div class="mx-auto max-w-2xl">
            <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                {props.label}
            </p>
            <div class="border border-void-700 bg-void-900 p-2">
                {props.children}
            </div>
        </div>
    </div>
);

const FileList = (props: { paths: string[] }) => (
    <ul class="space-y-1 pl-5">
        {props.paths.map((p) => (
            <li class="font-mono text-[11px] text-void-300">{p}</li>
        ))}
    </ul>
);

export const Tones: Story = {
    render: () => (
        <Frame label="tones — starlight (success), nebula (info), flare (warning), void (neutral)">
            <CollapsibleSection title="Staged" count={3} tone="starlight">
                <FileList
                    paths={[
                        "internal/v2/app/project.go",
                        "packages/studio/src/views/settings.tsx",
                        "internal/v1/app/legacy.go",
                    ]}
                />
            </CollapsibleSection>
            <CollapsibleSection title="Recent commits" count={12} tone="nebula">
                <p class="pl-5 text-[11px] text-void-400">
                    12 commits in this branch.
                </p>
            </CollapsibleSection>
            <CollapsibleSection title="Conflicts" count={2} tone="flare">
                <FileList
                    paths={[
                        "packages/components/src/dialog/dialog.tsx",
                        "packages/studio/src/router.tsx",
                    ]}
                />
            </CollapsibleSection>
            <CollapsibleSection title="Stash" count={0} tone="void">
                <p class="pl-5 text-[11px] text-void-500">
                    No stashed changes.
                </p>
            </CollapsibleSection>
        </Frame>
    ),
};

export const ClickTarget: Story = {
    render: () => (
        <Frame label="click target — anywhere on the header strip toggles, even the empty space between the title and the count badge">
            <CollapsibleSection title="Staged" count={4} tone="starlight">
                <FileList
                    paths={[
                        "internal/v2/app/project.go",
                        "packages/studio/src/views/settings.tsx",
                        "internal/v1/app/legacy.go",
                        "scripts/dev.sh",
                    ]}
                />
            </CollapsibleSection>
        </Frame>
    ),
};

export const WithTrailing: Story = {
    render: () => (
        <Frame label="trailing actions — clicks on actions do not toggle the section">
            <CollapsibleSection
                title="Recent commits"
                count={12}
                tone="nebula"
                trailing={
                    <button
                        type="button"
                        class="cursor-pointer rounded-none p-1 text-void-400 transition-colors duration-100 hover:bg-void-700 hover:text-void-100"
                        aria-label="Refresh"
                    >
                        <RefreshCcw
                            class="size-3"
                            stroke-width={2}
                            aria-hidden
                        />
                    </button>
                }
            >
                <p class="pl-5 text-[11px] text-void-400">
                    12 commits in this branch.
                </p>
            </CollapsibleSection>
            <CollapsibleSection
                title="Untracked"
                count={3}
                tone="void"
                trailing={
                    <button
                        type="button"
                        class="cursor-pointer rounded-none p-1 text-void-400 transition-colors duration-100 hover:bg-void-700 hover:text-starlight-300"
                        aria-label="Stage all"
                    >
                        <Plus class="size-3" stroke-width={2} aria-hidden />
                    </button>
                }
            >
                <FileList
                    paths={[
                        "scripts/dev.sh",
                        "docs/migration-notes.md",
                        ".env.local",
                    ]}
                />
            </CollapsibleSection>
        </Frame>
    ),
};

export const States: Story = {
    render: () => (
        <Frame label="states — open by default when count is greater than zero, otherwise closed">
            <CollapsibleSection title="With items (open)" count={3} tone="starlight">
                <FileList paths={["one.go", "two.go", "three.go"]} />
            </CollapsibleSection>
            <CollapsibleSection title="Empty (closed)" count={0} tone="void">
                <p class="pl-5 text-[11px] text-void-500">
                    No items in this group.
                </p>
            </CollapsibleSection>
            <CollapsibleSection
                title="Forced closed"
                count={4}
                tone="nebula"
                defaultOpen={false}
            >
                <p class="pl-5 text-[11px] text-void-400">
                    Click the row to open.
                </p>
            </CollapsibleSection>
        </Frame>
    ),
};

export const InContext: Story = {
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-2xl border border-void-700 bg-void-900">
                <header class="flex items-center justify-between border-b border-void-700 bg-void-850 px-4 py-2.5">
                    <div class="flex items-baseline gap-3">
                        <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-starlight-400">
                            git
                        </span>
                        <span class="text-sm font-medium text-void-100">
                            Changes
                        </span>
                    </div>
                    <code class="text-[12px] text-nebula-300">
                        origin/main
                    </code>
                </header>
                <div class="space-y-1 p-2">
                    <CollapsibleSection
                        title="Staged"
                        count={3}
                        tone="starlight"
                    >
                        <FileList
                            paths={[
                                "internal/v2/app/project.go",
                                "packages/studio/src/views/settings.tsx",
                                "internal/v1/app/legacy.go",
                            ]}
                        />
                    </CollapsibleSection>
                    <CollapsibleSection
                        title="Unstaged"
                        count={2}
                        tone="nebula"
                        trailing={
                            <button
                                type="button"
                                class="cursor-pointer rounded-none p-1 text-void-400 transition-colors duration-100 hover:bg-void-700 hover:text-starlight-300"
                                aria-label="Stage all"
                            >
                                <Plus
                                    class="size-3"
                                    stroke-width={2}
                                    aria-hidden
                                />
                            </button>
                        }
                    >
                        <FileList
                            paths={[
                                "packages/components/src/button/button.tsx",
                                "packages/components/src/input/input.tsx",
                            ]}
                        />
                    </CollapsibleSection>
                    <CollapsibleSection
                        title="Untracked"
                        count={1}
                        tone="void"
                        trailing={
                            <button
                                type="button"
                                class="cursor-pointer rounded-none p-1 text-void-400 transition-colors duration-100 hover:bg-void-700 hover:text-starlight-300"
                                aria-label="Stage all"
                            >
                                <Plus
                                    class="size-3"
                                    stroke-width={2}
                                    aria-hidden
                                />
                            </button>
                        }
                    >
                        <FileList paths={["scripts/dev.sh"]} />
                    </CollapsibleSection>
                    <CollapsibleSection
                        title="Conflicts"
                        count={0}
                        tone="flare"
                    >
                        <p class="pl-5 text-[11px] text-void-500">
                            No conflicts. You are clear.
                        </p>
                    </CollapsibleSection>
                </div>
            </div>
        </div>
    ),
};
