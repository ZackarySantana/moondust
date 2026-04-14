import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { store } from "@wails/go/models";
import { CommitRow } from "./commit-row";

function commit(
    overrides: Partial<store.GitCommitSummary> = {},
): store.GitCommitSummary {
    return store.GitCommitSummary.createFrom({
        hash: "a1b2c3d4",
        subject: "Fix thread header layout on narrow widths",
        author: "Moondust Dev",
        when: "2 hours ago",
        exact_date: "2026-04-14T18:00:00.000Z",
        ...overrides,
    });
}

const meta = {
    title: "Review/CommitRow",
    component: CommitRow,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof CommitRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithoutGitHub: Story = {
    args: {
        commit: commit(),
        githubURL: null,
    },
};

export const WithGitHub: Story = {
    args: {
        commit: commit({
            hash: "deadbeef",
            subject: "Merge pull request #42 from feature/storybook",
        }),
        githubURL: "https://github.com/zackarysantana/moondust",
    },
};
