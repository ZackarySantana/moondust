import { createSignal, type JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { FileChangeRow } from "./file-change-row";

const meta = {
    title: "Review/FileChangeRow",
    component: FileChangeRow,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof FileChangeRow>;

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

export const StatusCodes: Story = {
    render: () => (
        <Frame label="status codes — A staged, M modified, D deleted, R renamed, U conflict, ? untracked">
            <FileChangeRow
                path="internal/v2/app/project.go"
                status="A"
                context="staged"
                onUnstage={() => {}}
            />
            <FileChangeRow
                path="packages/studio/src/views/settings.tsx"
                status="M"
                context="staged"
                onUnstage={() => {}}
            />
            <FileChangeRow
                path="internal/v1/app/legacy.go"
                status="D"
                context="staged"
                onUnstage={() => {}}
            />
            <FileChangeRow
                path="packages/components/src/dialog/dialog.tsx"
                status="R"
                context="staged"
                onUnstage={() => {}}
            />
            <FileChangeRow
                path="packages/components/src/button/button.tsx"
                status="U"
                context="unstaged"
                onStage={() => {}}
                onDiscard={() => {}}
            />
            <FileChangeRow
                path="scripts/dev.sh"
                status="untracked"
                context="untracked"
                onStage={() => {}}
            />
        </Frame>
    ),
};

export const StagedList: Story = {
    render: () => (
        <Frame label="staged — hover for unstage">
            <FileChangeRow
                path="internal/v2/app/project.go"
                status="A"
                context="staged"
                onUnstage={() => {}}
            />
            <FileChangeRow
                path="packages/studio/src/views/settings.tsx"
                status="M"
                context="staged"
                onUnstage={() => {}}
            />
            <FileChangeRow
                path="internal/v1/app/legacy.go"
                status="D"
                context="staged"
                onUnstage={() => {}}
            />
            <FileChangeRow
                path="packages/components/src/dialog/dialog.tsx"
                status="R"
                context="staged"
                onUnstage={() => {}}
            />
        </Frame>
    ),
};

export const UnstagedList: Story = {
    render: () => (
        <Frame label="unstaged — hover for stage and discard">
            <FileChangeRow
                path="packages/components/src/button/button.tsx"
                status="M"
                context="unstaged"
                onStage={() => {}}
                onDiscard={() => {}}
            />
            <FileChangeRow
                path="packages/components/src/input/input.tsx"
                status="M"
                context="unstaged"
                onStage={() => {}}
                onDiscard={() => {}}
            />
            <FileChangeRow
                path="internal/v1/app/old.go"
                status="D"
                context="unstaged"
                onStage={() => {}}
                onDiscard={() => {}}
            />
        </Frame>
    ),
};

export const UntrackedList: Story = {
    render: () => (
        <Frame label="untracked — hover for stage">
            <FileChangeRow
                path="scripts/dev.sh"
                status="untracked"
                context="untracked"
                onStage={() => {}}
            />
            <FileChangeRow
                path="docs/migration-notes.md"
                status="untracked"
                context="untracked"
                onStage={() => {}}
            />
            <FileChangeRow
                path=".env.local"
                status="untracked"
                context="untracked"
                onStage={() => {}}
            />
        </Frame>
    ),
};

export const Pending: Story = {
    render: () => (
        <Frame label="pending — spinner replaces row actions while a stage or discard is in flight">
            <FileChangeRow
                path="internal/v2/app/project.go"
                status="M"
                context="unstaged"
                pendingPath="internal/v2/app/project.go"
                onStage={() => {}}
                onDiscard={() => {}}
            />
            <FileChangeRow
                path="packages/components/src/button/button.tsx"
                status="M"
                context="unstaged"
                onStage={() => {}}
                onDiscard={() => {}}
            />
            <FileChangeRow
                path="packages/components/src/input/input.tsx"
                status="M"
                context="unstaged"
                onStage={() => {}}
                onDiscard={() => {}}
            />
        </Frame>
    ),
};

export const Disabled: Story = {
    render: () => (
        <Frame label="disabled — actions are inert while another job runs">
            <FileChangeRow
                path="internal/v2/app/project.go"
                status="M"
                context="unstaged"
                disabled
                onStage={() => {}}
                onDiscard={() => {}}
            />
            <FileChangeRow
                path="packages/components/src/button/button.tsx"
                status="A"
                context="staged"
                disabled
                onUnstage={() => {}}
            />
        </Frame>
    ),
};

export const LongPaths: Story = {
    render: () => (
        <Frame label="long paths — truncated middle with ellipsis">
            <FileChangeRow
                path="long/very/deeply/nested/path/with/a/file/that/is/wide/file.go"
                status="R"
                context="staged"
                onUnstage={() => {}}
            />
            <FileChangeRow
                path="packages/studio/src/views/projects/[projectId]/threads/[threadId]/composer/composer.tsx"
                status="M"
                context="unstaged"
                onStage={() => {}}
                onDiscard={() => {}}
            />
        </Frame>
    ),
};

export const InContext: Story = {
    render: () => {
        const [pending, setPending] = createSignal<string | null>(null);

        function flash(path: string) {
            setPending(path);
            setTimeout(() => setPending(null), 800);
        }

        return (
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
                            <span class="font-mono text-[11px] tabular-nums text-void-400">
                                3 staged · 2 unstaged · 1 untracked
                            </span>
                        </div>
                        <code class="text-[12px] text-nebula-300">
                            origin/main
                        </code>
                    </header>

                    <Section label="Staged">
                        <FileChangeRow
                            path="internal/v2/app/project.go"
                            status="A"
                            context="staged"
                            pendingPath={pending()}
                            onUnstage={flash}
                        />
                        <FileChangeRow
                            path="packages/studio/src/views/settings.tsx"
                            status="M"
                            context="staged"
                            pendingPath={pending()}
                            onUnstage={flash}
                        />
                        <FileChangeRow
                            path="internal/v1/app/legacy.go"
                            status="D"
                            context="staged"
                            pendingPath={pending()}
                            onUnstage={flash}
                        />
                    </Section>

                    <Section label="Unstaged">
                        <FileChangeRow
                            path="packages/components/src/button/button.tsx"
                            status="M"
                            context="unstaged"
                            pendingPath={pending()}
                            onStage={flash}
                            onDiscard={flash}
                        />
                        <FileChangeRow
                            path="packages/components/src/input/input.tsx"
                            status="M"
                            context="unstaged"
                            pendingPath={pending()}
                            onStage={flash}
                            onDiscard={flash}
                        />
                    </Section>

                    <Section label="Untracked">
                        <FileChangeRow
                            path="scripts/dev.sh"
                            status="untracked"
                            context="untracked"
                            pendingPath={pending()}
                            onStage={flash}
                        />
                    </Section>
                </div>
            </div>
        );
    },
};

const Section = (props: { label: string; children: JSX.Element }) => (
    <section class="border-b border-void-700 last:border-b-0">
        <p class="border-b border-void-700/60 px-4 pt-2 pb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
            {props.label}
        </p>
        <div class="p-2">{props.children}</div>
    </section>
);
