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

export const Default: Story = {
    args: {
        localCommits: LOCAL,
        mainCommits: MAIN,
        baseBranch: "origin/main",
        branchName: "feature/file-row",
        githubURL: "https://github.com/moondust-pro/moondust",
    },
};

export const NoGithub: Story = {
    args: {
        localCommits: LOCAL,
        mainCommits: MAIN,
        baseBranch: "origin/main",
        branchName: "feature/file-row",
        githubURL: null,
    },
};

export const OnlyLocal: Story = {
    args: {
        localCommits: LOCAL,
        mainCommits: [],
        baseBranch: "origin/main",
        branchName: "feature/file-row",
        githubURL: "https://github.com/moondust-pro/moondust",
    },
};

export const OnlyMain: Story = {
    args: {
        localCommits: [],
        mainCommits: MAIN,
        baseBranch: "origin/main",
        branchName: "feature/file-row",
        githubURL: "https://github.com/moondust-pro/moondust",
    },
};

export const Empty: Story = {
    args: {
        localCommits: [],
        mainCommits: [],
        baseBranch: "origin/main",
        branchName: "feature/file-row",
        githubURL: "https://github.com/moondust-pro/moondust",
    },
};

export const ManyCommits: Story = {
    args: {
        localCommits: Array.from({ length: 8 }, (_, i) => ({
            hash: `${(i + 11).toString(16)}aabbcc`.slice(0, 7),
            subject: `feat(local): incremental change #${i + 1}`,
            author: "Alex Rivera",
            when: `${i + 1}h ago`,
        })),
        mainCommits: Array.from({ length: 6 }, (_, i) => ({
            hash: `${(i + 21).toString(16)}ddeeff`.slice(0, 7),
            subject: `chore(main): housekeeping #${i + 1}`,
            author: "Sam Patel",
            when: `${i + 1}d ago`,
        })),
        baseBranch: "origin/main",
        branchName: "feature/many",
        githubURL: "https://github.com/moondust-pro/moondust",
    },
};
