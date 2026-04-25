import type { JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { AssistantMessageForkButton } from "./assistant-message-fork-button";
import { AssistantMessageMetadataButton } from "../assistant-message-metadata/assistant-message-metadata";

const meta = {
    title: "Chat/AssistantMessageForkButton",
    component: AssistantMessageForkButton,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof AssistantMessageForkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = (props: { children: JSX.Element; label?: string }) => (
    <div class="min-w-3xl bg-void-950 p-10">
        {props.label && (
            <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                {props.label}
            </p>
        )}
        <div class="space-y-6">{props.children}</div>
    </div>
);

const Row = (props: { label: string; children: JSX.Element }) => (
    <div class="grid grid-cols-[140px_1fr] items-start gap-6 border-l-2 border-void-700 pl-4">
        <span class="pt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
            {props.label}
        </span>
        <div>{props.children}</div>
    </div>
);

export const Playground: Story = {
    args: {
        onFork: () => new Promise((r) => setTimeout(r, 500)),
    },
};

export const Variants: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame label="variants — click each fork icon to open the confirm popover">
            <Row label="default">
                <div class="flex items-center gap-3">
                    <AssistantMessageForkButton
                        onFork={() => new Promise((r) => setTimeout(r, 500))}
                    />
                    <span class="text-xs text-void-400">
                        Default copy and Fork label.
                    </span>
                </div>
            </Row>
            <Row label="slow fork">
                <div class="flex items-center gap-3">
                    <AssistantMessageForkButton
                        onFork={() =>
                            new Promise((r) => setTimeout(r, 1500))
                        }
                    />
                    <span class="text-xs text-void-400">
                        Confirm shows a spinner while pending.
                    </span>
                </div>
            </Row>
            <Row label="custom copy">
                <div class="flex items-center gap-3">
                    <AssistantMessageForkButton
                        onFork={() => new Promise((r) => setTimeout(r, 600))}
                        title="Branch from here?"
                        description="We'll spin up a fresh worktree from this message so you can explore an alternate path."
                        confirmLabel="Branch"
                    />
                    <span class="text-xs text-void-400">
                        Override the title, description and confirm label.
                    </span>
                </div>
            </Row>
        </Frame>
    ),
};

export const InMessageHeader: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-2xl">
                <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    in message header — paired with the metadata popover
                </p>
                <article class="border border-void-700 bg-void-900">
                    <div class="flex items-center justify-between border-b border-void-700 px-4 py-2">
                        <div class="flex items-center gap-2">
                            <span class="size-1.5 bg-starlight-400" />
                            <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-400">
                                assistant
                            </span>
                            <code class="font-mono text-[11px] text-nebula-300">
                                claude-3.5-sonnet
                            </code>
                        </div>
                        <div class="flex items-center gap-0.5">
                            <AssistantMessageMetadataButton
                                summary="$0.0124"
                                sections={[
                                    {
                                        heading: "OpenRouter",
                                        subheading: "claude-3.5-sonnet",
                                        hero: {
                                            label: "Total cost",
                                            value: "$0.0124",
                                        },
                                        pills: [
                                            { label: "Input", value: "1,420" },
                                            { label: "Output", value: "382" },
                                        ],
                                    },
                                ]}
                            />
                            <AssistantMessageForkButton
                                onFork={() =>
                                    new Promise((r) => setTimeout(r, 700))
                                }
                            />
                        </div>
                    </div>
                    <div class="space-y-3 p-4 text-sm leading-relaxed text-void-200">
                        <p>
                            Two approaches: a tiny custom hook, or use
                            tanstack/router's loaders. The hook is simpler;
                            loaders compose better with suspense.
                        </p>
                        <p>Want to try the hook first or skip ahead?</p>
                    </div>
                </article>
            </div>
        </div>
    ),
};

export const InTimeline: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-2xl space-y-3">
                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    timeline — fork from any past message
                </p>
                <article class="border border-void-700 bg-void-900">
                    <div class="flex items-center justify-between border-b border-void-700 px-4 py-2">
                        <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-400">
                            user · 9:14 AM
                        </span>
                        <AssistantMessageForkButton
                            onFork={() =>
                                new Promise((r) => setTimeout(r, 500))
                            }
                            title="Fork from this prompt?"
                            description="Branches a new thread starting at this user message. Subsequent assistant turns are not carried over."
                        />
                    </div>
                    <p class="p-4 text-sm text-void-200">
                        Refactor the router to use loaders.
                    </p>
                </article>
                <article class="border border-void-700 bg-void-900">
                    <div class="flex items-center justify-between border-b border-void-700 px-4 py-2">
                        <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-400">
                            assistant · 9:15 AM
                        </span>
                        <AssistantMessageForkButton
                            onFork={() =>
                                new Promise((r) => setTimeout(r, 500))
                            }
                        />
                    </div>
                    <p class="p-4 text-sm text-void-200">
                        Two approaches: a tiny custom hook, or tanstack
                        loaders. Want to try the hook first?
                    </p>
                </article>
                <article class="border border-void-700 bg-void-900">
                    <div class="flex items-center justify-between border-b border-void-700 px-4 py-2">
                        <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-400">
                            user · 9:16 AM
                        </span>
                        <AssistantMessageForkButton
                            onFork={() =>
                                new Promise((r) => setTimeout(r, 500))
                            }
                            title="Fork from this prompt?"
                            description="Branches a new thread starting at this user message."
                            confirmLabel="Branch"
                        />
                    </div>
                    <p class="p-4 text-sm text-void-200">Hook first.</p>
                </article>
            </div>
        </div>
    ),
};
