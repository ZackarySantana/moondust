import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { ChatComposer } from "./chat-composer";
import { Chip } from "../chip/chip";
import { KbdHint } from "../kbd-hint/kbd-hint";

const meta = {
    title: "Chat/ChatComposer",
    component: ChatComposer,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof ChatComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
    render: () => {
        const [value, setValue] = createSignal("");
        return (
            <div class="bg-void-900 border border-void-700 max-w-2xl">
                <ChatComposer
                    value={value()}
                    onValueChange={setValue}
                    onSubmit={(v) => {
                        alert(`Submit: ${v}`);
                        setValue("");
                    }}
                    leadingControls={
                        <>
                            <Chip tone="starlight">Cursor Agent</Chip>
                            <Chip tone="outline">claude-sonnet-4.6</Chip>
                        </>
                    }
                    hint={
                        <span class="inline-flex items-center gap-1.5">
                            <KbdHint combo={["↵"]} />
                            send
                            <span class="opacity-40">·</span>
                            <KbdHint combo={["⇧", "↵"]} />
                            newline
                        </span>
                    }
                />
            </div>
        );
    },
};

export const Streaming: Story = {
    render: () => {
        const [value, setValue] = createSignal("Hold on, let me investigate…");
        return (
            <div class="bg-void-900 border border-void-700 max-w-2xl">
                <ChatComposer
                    value={value()}
                    onValueChange={setValue}
                    onSubmit={() => {}}
                    onCancelStream={() => alert("cancel stream")}
                    streamState="responding"
                    leadingControls={<Chip tone="starlight">Cursor Agent</Chip>}
                    hint={<span>Agent is responding…</span>}
                />
            </div>
        );
    },
};

export const Multiline: Story = {
    render: () => {
        const [value, setValue] = createSignal(
            "Refactor the router so each thread mounts its own outlet.\n\nKeep streaming state in the thread context, not in the composer.\n\n@src/router.ts @src/lib/queries/threads.ts",
        );
        return (
            <div class="bg-void-900 border border-void-700 max-w-2xl">
                <ChatComposer
                    value={value()}
                    onValueChange={setValue}
                    onSubmit={() => {}}
                    leadingControls={<Chip tone="starlight">Cursor Agent</Chip>}
                />
            </div>
        );
    },
};
