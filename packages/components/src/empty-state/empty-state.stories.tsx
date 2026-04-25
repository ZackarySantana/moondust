import FolderOpen from "lucide-solid/icons/folder-open";
import Inbox from "lucide-solid/icons/inbox";
import KeyRound from "lucide-solid/icons/key-round";
import MessageSquare from "lucide-solid/icons/message-square";
import Plus from "lucide-solid/icons/plus";
import Search from "lucide-solid/icons/search";
import type { JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { EmptyState } from "./empty-state";
import { Button } from "../button/button";
import { Code } from "../code/code";

const meta = {
    title: "UI/EmptyState",
    component: EmptyState,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
    args: {
        title: "No threads yet",
        description: "Start a conversation to see it here.",
        size: "default",
    },
    argTypes: {
        size: { control: { type: "select" }, options: ["sm", "default", "lg"] },
        bordered: { control: { type: "boolean" } },
    },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = (props: { children: JSX.Element }) => (
    <div class="min-w-3xl bg-void-950 p-10">
        <div class="mx-auto max-w-2xl space-y-6">{props.children}</div>
    </div>
);

const Caption = (props: { children: JSX.Element }) => (
    <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
        {props.children}
    </p>
);

export const Playground: Story = {
    args: {
        icon: Inbox,
    },
};

export const Sizes: Story = {
    render: () => (
        <Frame>
            <Caption>sm</Caption>
            <div class="border border-void-700 bg-void-900">
                <EmptyState
                    icon={Inbox}
                    title="No threads yet"
                    description="Start a conversation to see it here."
                    size="sm"
                />
            </div>

            <Caption>default</Caption>
            <div class="border border-void-700 bg-void-900">
                <EmptyState
                    icon={Inbox}
                    title="No threads yet"
                    description="Start a conversation to see it here."
                />
            </div>

            <Caption>lg</Caption>
            <div class="border border-void-700 bg-void-900">
                <EmptyState
                    icon={Inbox}
                    title="No threads yet"
                    description="Start a conversation to see it here."
                    size="lg"
                />
            </div>
        </Frame>
    ),
};

export const Variants: Story = {
    render: () => (
        <Frame>
            <Caption>title only</Caption>
            <div class="border border-void-700 bg-void-900">
                <EmptyState title="Nothing to show" />
            </div>

            <Caption>title + description</Caption>
            <div class="border border-void-700 bg-void-900">
                <EmptyState
                    icon={MessageSquare}
                    title="No assistant turns"
                    description="When the assistant replies, you'll see its messages here along with token usage."
                />
            </div>

            <Caption>title + actions</Caption>
            <div class="border border-void-700 bg-void-900">
                <EmptyState
                    icon={FolderOpen}
                    title="No projects"
                    description="Track your work by grouping related threads into projects."
                    actions={
                        <>
                            <Button>
                                <Plus class="size-3.5" stroke-width={2} aria-hidden />
                                New project
                            </Button>
                            <Button variant="ghost">Learn more</Button>
                        </>
                    }
                />
            </div>

            <Caption>bordered (use inside lists)</Caption>
            <EmptyState
                bordered
                icon={Search}
                title="No matches"
                description={
                    <>
                        Nothing matched <Code tone="nebula">"router"</Code>.
                        Try a different query or clear filters.
                    </>
                }
                actions={<Button variant="ghost">Clear filters</Button>}
            />
        </Frame>
    ),
};

export const InContext: Story = {
    render: () => (
        <Frame>
            <Caption>home — fresh install</Caption>
            <div class="border border-void-700 bg-void-900">
                <EmptyState
                    size="lg"
                    icon={MessageSquare}
                    title="Welcome to Moondust"
                    description={
                        <>
                            Start by creating a project for any folder on disk.
                            Moondust automatically threads conversations and
                            tracks usage across <Code tone="nebula">claude</Code>{" "}
                            and your routed providers.
                        </>
                    }
                    actions={
                        <>
                            <Button>
                                <Plus class="size-3.5" stroke-width={2} aria-hidden />
                                New project
                            </Button>
                            <Button variant="ghost">Open settings</Button>
                        </>
                    }
                />
            </div>

            <Caption>settings tab — provider not configured</Caption>
            <div class="border border-void-700 bg-void-900 p-2">
                <EmptyState
                    icon={KeyRound}
                    title="OpenRouter not configured"
                    description="Add a key to enable cost reporting and access higher-tier models."
                    actions={
                        <Button variant="default" size="sm">
                            Add API key
                        </Button>
                    }
                    size="sm"
                />
            </div>

            <Caption>list — no search results</Caption>
            <div class="border border-void-700 bg-void-900 p-3">
                <EmptyState
                    bordered
                    icon={Search}
                    title="No matching threads"
                    description={
                        <>
                            Nothing matched <Code tone="nebula">"login"</Code>{" "}
                            in this project.
                        </>
                    }
                />
            </div>
        </Frame>
    ),
};
