import Pencil from "lucide-solid/icons/pencil";
import { createSignal, type JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { InlineEditableText } from "./inline-editable-text";
import { HoverReveal } from "../hover-reveal/hover-reveal";

const meta = {
    title: "UI/InlineEditableText",
    component: InlineEditableText,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof InlineEditableText>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = (props: { children: JSX.Element }) => (
    <div class="min-w-3xl bg-void-950 p-10">
        <div class="space-y-8">{props.children}</div>
    </div>
);

const Caption = (props: { children: JSX.Element }) => (
    <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
        {props.children}
    </p>
);

export const Sizes: Story = {
    render: () => {
        const [a, setA] = createSignal("Small thread title");
        const [b, setB] = createSignal("Default thread title");
        const [c, setC] = createSignal("Large project name");
        return (
            <Frame>
                <Caption>sm</Caption>
                <InlineEditableText
                    value={a()}
                    onCommit={setA}
                    size="sm"
                    aria-label="Edit title"
                />

                <Caption>default</Caption>
                <InlineEditableText
                    value={b()}
                    onCommit={setB}
                    aria-label="Edit title"
                />

                <Caption>lg</Caption>
                <InlineEditableText
                    value={c()}
                    onCommit={setC}
                    size="lg"
                    aria-label="Edit project"
                />
            </Frame>
        );
    },
};

export const States: Story = {
    render: () => {
        const [v, setV] = createSignal("Refactor router");
        const [empty, setEmpty] = createSignal("");
        return (
            <Frame>
                <Caption>idle — click to edit</Caption>
                <InlineEditableText
                    value={v()}
                    onCommit={setV}
                    aria-label="Edit thread title"
                />

                <Caption>empty — shows placeholder</Caption>
                <InlineEditableText
                    value={empty()}
                    onCommit={setEmpty}
                    placeholder="Untitled thread"
                    aria-label="Edit thread title"
                />

                <Caption>disabled — read-only</Caption>
                <InlineEditableText
                    value="Locked thread name"
                    onCommit={() => {
                        /* noop */
                    }}
                    disabled
                    aria-label="Edit thread title"
                />
            </Frame>
        );
    },
};

export const Multiline: Story = {
    render: () => {
        const [v, setV] = createSignal(
            "Investigate intermittent connection drops on the staging cluster after the canary deploy.",
        );
        return (
            <Frame>
                <Caption>multiline · ⌘+Enter to commit, Esc to cancel</Caption>
                <div class="max-w-xl">
                    <InlineEditableText
                        value={v()}
                        onCommit={setV}
                        multiline
                        size="default"
                        aria-label="Edit summary"
                    />
                </div>
            </Frame>
        );
    },
};

export const WithValidation: Story = {
    render: () => {
        const [v, setV] = createSignal("Refactor router");
        return (
            <Frame>
                <Caption>validate · empty values are rejected</Caption>
                <InlineEditableText
                    value={v()}
                    onCommit={setV}
                    aria-label="Edit thread title"
                    validate={(next) => {
                        if (!next) return "Title cannot be empty.";
                        if (next.length < 3)
                            return "Use at least 3 characters.";
                        return null;
                    }}
                />
            </Frame>
        );
    },
};

export const InContext: Story = {
    render: () => {
        const [title, setTitle] = createSignal("Refactor router");
        const [project] = createSignal("moondust");
        return (
            <div class="min-h-screen bg-void-950 p-10">
                <div class="mx-auto max-w-2xl space-y-8">
                    <Caption>thread header — hover the title</Caption>
                    <header class="border border-void-700 bg-void-900 px-4 py-3">
                        <div class="group flex items-center gap-1.5">
                            <InlineEditableText
                                value={title()}
                                onCommit={setTitle}
                                size="lg"
                                aria-label="Rename thread"
                            />
                            <HoverReveal>
                                <Pencil
                                    class="size-3.5 text-void-500"
                                    stroke-width={2}
                                    aria-hidden
                                />
                            </HoverReveal>
                        </div>
                        <p class="mt-1 text-xs text-void-500">
                            in{" "}
                            <span class="text-void-300">{project()}</span> · 24
                            messages
                        </p>
                    </header>

                    <Caption>sidebar list — auto-edit on create</Caption>
                    <ul class="border border-void-700 bg-void-900">
                        <SidebarRow initial="Refactor router" />
                        <SidebarRow initial="Fix flake in CI" />
                        <SidebarRow initial="" autoEdit placeholder="Untitled" />
                    </ul>
                </div>
            </div>
        );
    },
};

const SidebarRow = (props: {
    initial: string;
    autoEdit?: boolean;
    placeholder?: string;
}) => {
    const [v, setV] = createSignal(props.initial);
    return (
        <li class="border-b border-void-700 px-2 py-1 text-sm last:border-b-0">
            <InlineEditableText
                value={v()}
                onCommit={setV}
                placeholder={props.placeholder}
                autoEdit={props.autoEdit}
                aria-label="Rename thread"
            />
        </li>
    );
};
