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

export const StagedAdd: Story = {
    args: {
        path: "internal/v2/app/project.go",
        status: "A",
        context: "staged",
        onUnstage: () => {},
        onClick: () => {},
    },
};

export const StagedModify: Story = {
    args: {
        path: "packages/studio/src/index.tsx",
        status: "M",
        context: "staged",
        onUnstage: () => {},
        onClick: () => {},
    },
};

export const UnstagedDelete: Story = {
    args: {
        path: "internal/v1/app/legacy.go",
        status: "D",
        context: "unstaged",
        onStage: () => {},
        onDiscard: () => {},
        onClick: () => {},
    },
};

export const Untracked: Story = {
    args: {
        path: "scripts/dev.sh",
        status: "untracked",
        context: "untracked",
        onStage: () => {},
        onClick: () => {},
    },
};

export const Pending: Story = {
    args: {
        path: "internal/v2/app/project.go",
        status: "M",
        context: "unstaged",
        pendingPath: "internal/v2/app/project.go",
        onStage: () => {},
        onDiscard: () => {},
    },
};

export const Disabled: Story = {
    args: {
        path: "internal/v2/app/project.go",
        status: "M",
        context: "unstaged",
        disabled: true,
        onStage: () => {},
        onDiscard: () => {},
    },
};

export const ListInPanel: Story = {
    render: () => (
        <div class="w-96 rounded-lg border border-slate-800/60 bg-app-panel p-2">
            <FileChangeRow
                path="internal/v2/app/project.go"
                status="A"
                context="staged"
                onUnstage={() => {}}
            />
            <FileChangeRow
                path="packages/studio/src/index.tsx"
                status="M"
                context="staged"
                onUnstage={() => {}}
            />
            <FileChangeRow
                path="internal/v1/app/legacy.go"
                status="D"
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
            <FileChangeRow
                path="long/very/deeply/nested/path/with/a/file/that/is/wide/file.go"
                status="R"
                context="staged"
                onUnstage={() => {}}
            />
        </div>
    ),
};
