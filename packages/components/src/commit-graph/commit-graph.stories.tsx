import GitBranch from "lucide-solid/icons/git-branch";
import type { JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { CommitGraph, type CommitSummary } from "./commit-graph";

const meta = {
    title: "Review/CommitGraph",
    component: CommitGraph,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof CommitGraph>;

export default meta;
type Story = StoryObj<typeof meta>;

const LOCAL: CommitSummary[] = [
    {
        hash: "a1b2c3d",
        subject: "review: scaffold collapsible section component",
        author: "Alex Rivera",
        when: "2m ago",
        exact_date: "Apr 25, 2026, 1:32 PM",
    },
    {
        hash: "9f8e7d6",
        subject: "review: extract file change row",
        author: "Alex Rivera",
        when: "12m ago",
        exact_date: "Apr 25, 2026, 1:22 PM",
    },
    {
        hash: "5c4b3a2",
        subject: "review: initial branch view",
        author: "Alex Rivera",
        when: "1h ago",
        exact_date: "Apr 25, 2026, 12:34 PM",
    },
];

const MAIN: CommitSummary[] = [
    {
        hash: "0e1d2c3",
        subject: "chore(release): cut v0.42.0",
        author: "release-bot",
        when: "3h ago",
        exact_date: "Apr 25, 2026, 10:14 AM",
    },
    {
        hash: "4f5e6d7",
        subject: "feat(threads): worktree per thread",
        author: "Sam Patel",
        when: "1d ago",
        exact_date: "Apr 24, 2026, 4:42 PM",
    },
    {
        hash: "8a9b0c1",
        subject: "fix(git): tolerate detached HEAD on first launch",
        author: "Sam Patel",
        when: "2d ago",
        exact_date: "Apr 23, 2026, 11:01 AM",
    },
];

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

const Card = (props: {
    children: JSX.Element;
    branch: string;
    base: string;
}) => (
    <div class="border border-void-700 bg-void-900">
        <div class="flex items-center justify-between border-b border-void-700 px-3 py-2">
            <div class="flex items-center gap-1.5">
                <GitBranch
                    class="size-3 text-nebula-300"
                    stroke-width={2}
                    aria-hidden
                />
                <code class="font-mono text-[11px] text-nebula-300">
                    {props.branch}
                </code>
            </div>
            <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                base · {props.base}
            </span>
        </div>
        <div class="p-3">{props.children}</div>
    </div>
);

export const Playground: Story = {
    args: {
        localCommits: LOCAL,
        mainCommits: MAIN,
        baseBranch: "origin/main",
        branchName: "feature/file-row",
        githubURL: "https://github.com/moondust-pro/moondust",
    },
};

export const Default: Story = {
    render: () => (
        <Frame label="default — local commits above the fork point, base branch below">
            <Card
                branch="feature/file-row"
                base="origin/main"
            >
                <CommitGraph
                    localCommits={LOCAL}
                    mainCommits={MAIN}
                    baseBranch="origin/main"
                    branchName="feature/file-row"
                    githubURL="https://github.com/moondust-pro/moondust"
                />
            </Card>
            <p class="mt-3 text-xs text-void-500">
                Hover any commit row to see author, full hash and date.
            </p>
        </Frame>
    ),
};

export const Variants: Story = {
    render: () => (
        <Frame label="variants — different commit graph shapes">
            <div class="grid gap-6">
                <div class="border-l-2 border-void-700 pl-4">
                    <p class="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        only local
                    </p>
                    <Card
                        branch="feature/exploration"
                        base="origin/main"
                    >
                        <CommitGraph
                            localCommits={LOCAL}
                            mainCommits={[]}
                            baseBranch="origin/main"
                            branchName="feature/exploration"
                            githubURL="https://github.com/moondust-pro/moondust"
                        />
                    </Card>
                </div>
                <div class="border-l-2 border-void-700 pl-4">
                    <p class="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        only base
                    </p>
                    <Card
                        branch="origin/main"
                        base="origin/main"
                    >
                        <CommitGraph
                            localCommits={[]}
                            mainCommits={MAIN}
                            baseBranch="origin/main"
                            branchName="origin/main"
                            githubURL="https://github.com/moondust-pro/moondust"
                        />
                    </Card>
                </div>
                <div class="border-l-2 border-void-700 pl-4">
                    <p class="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        no GitHub url
                    </p>
                    <Card
                        branch="feature/file-row"
                        base="origin/main"
                    >
                        <CommitGraph
                            localCommits={LOCAL}
                            mainCommits={MAIN}
                            baseBranch="origin/main"
                            branchName="feature/file-row"
                            githubURL={null}
                        />
                    </Card>
                    <p class="mt-1.5 text-[11px] text-void-500">
                        The GitHub link in the hover popover is hidden when
                        the project has no remote URL.
                    </p>
                </div>
                <div class="border-l-2 border-void-700 pl-4">
                    <p class="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        empty
                    </p>
                    <Card
                        branch="feature/empty"
                        base="origin/main"
                    >
                        <CommitGraph
                            localCommits={[]}
                            mainCommits={[]}
                            baseBranch="origin/main"
                            branchName="feature/empty"
                            githubURL={null}
                        />
                    </Card>
                </div>
            </div>
        </Frame>
    ),
};

export const Dense: Story = {
    render: () => (
        <Frame label="dense — long history with many commits both sides">
            <Card
                branch="feature/many"
                base="origin/main"
            >
                <CommitGraph
                    localCommits={Array.from({ length: 8 }, (_, i) => ({
                        hash: `${(i + 11).toString(16)}aabbcc`.slice(0, 7),
                        subject: `feat(local): incremental change #${i + 1}`,
                        author: "Alex Rivera",
                        when: `${i + 1}h ago`,
                    }))}
                    mainCommits={Array.from({ length: 6 }, (_, i) => ({
                        hash: `${(i + 21).toString(16)}ddeeff`.slice(0, 7),
                        subject: `chore(main): housekeeping #${i + 1}`,
                        author: "Sam Patel",
                        when: `${i + 1}d ago`,
                    }))}
                    baseBranch="origin/main"
                    branchName="feature/many"
                    githubURL="https://github.com/moondust-pro/moondust"
                />
            </Card>
        </Frame>
    ),
};

export const InContext: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-3xl">
                <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    review panel — graph alongside diff stats
                </p>
                <div class="border border-void-700 bg-void-900">
                    <div class="flex items-center justify-between border-b border-void-700 px-4 py-2.5">
                        <div class="flex items-center gap-1.5">
                            <GitBranch
                                class="size-3.5 text-nebula-300"
                                stroke-width={2}
                                aria-hidden
                            />
                            <code class="font-mono text-[12px] text-nebula-300">
                                feature/file-row
                            </code>
                            <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                                · 3 ahead, 0 behind
                            </span>
                        </div>
                        <div class="flex items-center gap-2 font-mono text-[10px] tabular-nums text-void-400">
                            <span class="text-starlight-300">+482</span>
                            <span class="text-flare-400">-127</span>
                            <span class="text-void-500">12 files</span>
                        </div>
                    </div>
                    <div class="grid grid-cols-[1fr_180px] divide-x divide-void-700">
                        <div class="p-4">
                            <CommitGraph
                                localCommits={LOCAL}
                                mainCommits={MAIN}
                                baseBranch="origin/main"
                                branchName="feature/file-row"
                                githubURL="https://github.com/moondust-pro/moondust"
                            />
                        </div>
                        <aside class="space-y-3 p-4 text-xs">
                            <div>
                                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                                    base
                                </p>
                                <code class="font-mono text-[11px] text-nebula-300">
                                    origin/main
                                </code>
                            </div>
                            <div>
                                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                                    author
                                </p>
                                <p class="text-void-200">Alex Rivera</p>
                            </div>
                            <div>
                                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                                    last activity
                                </p>
                                <p class="font-mono text-[11px] tabular-nums text-void-300">
                                    2m ago
                                </p>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    ),
};
