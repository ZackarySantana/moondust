import GitBranch from "lucide-solid/icons/git-branch";
import { createSignal, type JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import {
    BranchCommitGitDialog,
    CommitStagedGitDialog,
    DiscardFileGitDialog,
    DiscardUnstagedGitDialog,
    GitActionDialog,
} from "./git-review-dialogs";

const meta = {
    title: "Modals/GitReviewDialogs",
    parameters: { layout: "fullscreen" },
    tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Stage = (props: { children: JSX.Element; label?: string }) => (
    <div class="min-h-screen bg-void-950">
        <div class="border-b border-void-700 bg-void-900 px-6 py-3">
            <div class="flex items-center gap-2">
                <span class="size-1.5 bg-starlight-400" />
                <span class="font-mono text-[11px] uppercase tracking-[0.16em] text-void-300">
                    moondust · review
                </span>
                <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    · {props.label ?? "git changes"}
                </span>
            </div>
        </div>
        <div class="grid grid-cols-[260px_1fr] divide-x divide-void-700">
            <aside class="space-y-2 p-4">
                <div class="flex items-center gap-1.5">
                    <GitBranch
                        class="size-3 text-nebula-300"
                        stroke-width={2}
                        aria-hidden
                    />
                    <code class="font-mono text-[12px] text-nebula-300">
                        feature/file-row
                    </code>
                </div>
                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    Staged · 3
                </p>
                <ul class="space-y-px font-mono text-[11px] text-void-200">
                    <li class="border-l-2 border-l-starlight-400 px-2 py-1">
                        components/file-change-row.tsx
                    </li>
                    <li class="border-l-2 border-transparent px-2 py-1">
                        components/file-change-row.stories.tsx
                    </li>
                    <li class="border-l-2 border-transparent px-2 py-1">
                        index.ts
                    </li>
                </ul>
                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    Unstaged · 1
                </p>
                <ul class="space-y-px font-mono text-[11px] text-void-300">
                    <li class="px-2 py-1">internal/v1/app/app.go</li>
                </ul>
            </aside>
            <main class="p-6">
                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    selection · components/file-change-row.tsx
                </p>
                <pre class="mt-3 max-w-3xl overflow-hidden border border-void-700 bg-void-900 p-4 font-mono text-[11px] leading-relaxed text-void-300">
{`@@ -12,4 +12,6 @@
   class={cn(
-    "rounded px-1 py-0.5 hover:bg-slate-800/40",
+    "rounded-none px-1 py-0.5 hover:bg-void-800/60",
+    "transition-colors duration-100",
   )}`}
                </pre>
            </main>
        </div>
        {props.children}
    </div>
);

export const ActionShell: Story = {
    render: () => (
        <Stage label="confirm action">
            <GitActionDialog
                open
                title="Confirm action"
                pending={false}
                error=""
                confirmLabel="Confirm"
                onClose={() => {}}
                onConfirm={() => {}}
            >
                <p class="mb-4 text-sm text-void-300">
                    The shared shell for git review dialogs. It provides the
                    overlay, escape and enter keys, an error banner and the
                    button row.
                </p>
            </GitActionDialog>
        </Stage>
    ),
};

export const ActionShellPending: Story = {
    render: () => (
        <Stage label="confirm action">
            <GitActionDialog
                open
                title="Confirm action"
                pending
                error=""
                confirmLabel="Confirm"
                onClose={() => {}}
                onConfirm={() => {}}
            >
                <p class="mb-4 text-sm text-void-300">
                    Buttons disable while the action is in flight; the confirm
                    button shows a spinner.
                </p>
            </GitActionDialog>
        </Stage>
    ),
};

export const DiscardFile: Story = {
    render: () => (
        <Stage label="discard file">
            <DiscardFileGitDialog
                open
                filePath="internal/v2/app/project.go"
                pending={false}
                error=""
                onClose={() => {}}
                onConfirm={() => {}}
            />
        </Stage>
    ),
};

export const DiscardFileWithError: Story = {
    render: () => (
        <Stage label="discard file · error">
            <DiscardFileGitDialog
                open
                filePath="internal/v2/app/project.go"
                pending={false}
                error="git: working tree has unmerged paths"
                onClose={() => {}}
                onConfirm={() => {}}
            />
        </Stage>
    ),
};

export const DiscardUnstaged: Story = {
    render: () => (
        <Stage label="discard unstaged">
            <DiscardUnstagedGitDialog
                open
                pending={false}
                error=""
                onClose={() => {}}
                onConfirm={() => {}}
            />
        </Stage>
    ),
};

export const CommitStaged: Story = {
    render: () => {
        const [msg, setMsg] = createSignal(
            "feat(review): port collapsible section to components package",
        );
        return (
            <Stage label="commit staged">
                <CommitStagedGitDialog
                    open
                    message={msg()}
                    onMessage={setMsg}
                    pending={false}
                    error=""
                    onClose={() => {}}
                    onConfirm={() => {}}
                />
            </Stage>
        );
    },
};

export const CommitStagedWithGenerate: Story = {
    render: () => {
        const [msg, setMsg] = createSignal("");
        return (
            <Stage label="commit staged · ai generate">
                <CommitStagedGitDialog
                    open
                    message={msg()}
                    onMessage={setMsg}
                    pending={false}
                    error=""
                    onClose={() => {}}
                    onConfirm={() => {}}
                    onGenerate={async () => {
                        await new Promise((r) => setTimeout(r, 600));
                        return "feat(review): port collapsible section to components package\n\nGenerated by AI from staged diff.";
                    }}
                />
            </Stage>
        );
    },
};

export const BranchAndCommit: Story = {
    render: () => {
        const [branch, setBranch] = createSignal("feature/port-review");
        const [msg, setMsg] = createSignal(
            "feat(review): port collapsible section to components package",
        );
        return (
            <Stage label="branch & commit">
                <BranchCommitGitDialog
                    open
                    branchName={branch()}
                    commitMessage={msg()}
                    onBranchName={setBranch}
                    onCommitMessage={setMsg}
                    pending={false}
                    error=""
                    onClose={() => {}}
                    onConfirm={() => {}}
                />
            </Stage>
        );
    },
};

export const BranchAndCommitPending: Story = {
    render: () => (
        <Stage label="branch & commit · pending">
            <BranchCommitGitDialog
                open
                branchName="feature/port-review"
                commitMessage="feat(review): port collapsible section to components package"
                onBranchName={() => {}}
                onCommitMessage={() => {}}
                pending
                error=""
                onClose={() => {}}
                onConfirm={() => {}}
            />
        </Stage>
    ),
};
