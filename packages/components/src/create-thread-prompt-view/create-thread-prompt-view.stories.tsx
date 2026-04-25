import { createSignal, type JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { CreateThreadPromptView } from "./create-thread-prompt-view";

const meta = {
    title: "Modals/CreateThreadPromptView",
    component: CreateThreadPromptView,
    parameters: { layout: "fullscreen" },
    tags: ["autodocs"],
} satisfies Meta<typeof CreateThreadPromptView>;

export default meta;
type Story = StoryObj<typeof meta>;

const Stage = (props: { children: JSX.Element }) => (
    <div class="min-h-screen bg-void-950">
        <div class="border-b border-void-700 bg-void-900 px-6 py-3">
            <div class="flex items-center gap-2">
                <span class="size-1.5 bg-starlight-400" />
                <span class="font-mono text-[11px] uppercase tracking-[0.16em] text-void-300">
                    moondust · refactor router
                </span>
            </div>
        </div>
        <div class="grid place-items-center px-6 py-12">
            <div class="w-full max-w-md text-center">
                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    project · moondust
                </p>
                <p class="mt-1 text-void-300">
                    Start a new conversation in this project.
                </p>
            </div>
        </div>
        {props.children}
    </div>
);

export const Prompt: Story = {
    render: () => (
        <Stage>
            <CreateThreadPromptView
                open
                phase="prompt"
                useWorktree
                error=""
                pending={false}
                onWorktreeChange={() => {}}
                onConfirm={() => {}}
                onCancel={() => {}}
                onOverlayClick={() => {}}
            />
        </Stage>
    ),
};

export const PromptNoWorktree: Story = {
    render: () => (
        <Stage>
            <CreateThreadPromptView
                open
                phase="prompt"
                useWorktree={false}
                error=""
                pending={false}
                onWorktreeChange={() => {}}
                onConfirm={() => {}}
                onCancel={() => {}}
                onOverlayClick={() => {}}
            />
        </Stage>
    ),
};

export const PromptWithError: Story = {
    render: () => (
        <Stage>
            <CreateThreadPromptView
                open
                phase="prompt"
                useWorktree
                error="Could not create worktree: branch already exists."
                pending={false}
                onWorktreeChange={() => {}}
                onConfirm={() => {}}
                onCancel={() => {}}
                onOverlayClick={() => {}}
            />
        </Stage>
    ),
};

export const Creating: Story = {
    render: () => (
        <Stage>
            <CreateThreadPromptView
                open
                phase="creating"
                useWorktree
                error=""
                pending
                onWorktreeChange={() => {}}
                onConfirm={() => {}}
                onCancel={() => {}}
                onOverlayClick={() => {}}
            />
        </Stage>
    ),
};

export const WithHelper: Story = {
    render: () => (
        <Stage>
            <CreateThreadPromptView
                open
                phase="prompt"
                useWorktree
                error=""
                pending={false}
                helperHint={
                    <>
                        You can set a default in{" "}
                        <a
                            href="#settings"
                            class="text-starlight-300 underline-offset-4 hover:underline"
                        >
                            Settings → Git
                        </a>
                        .
                    </>
                }
                onWorktreeChange={() => {}}
                onConfirm={() => {}}
                onCancel={() => {}}
                onOverlayClick={() => {}}
            />
        </Stage>
    ),
};

export const Interactive: Story = {
    render: () => {
        const [useWorktree, setUseWorktree] = createSignal(true);
        const [phase, setPhase] = createSignal<"prompt" | "creating">(
            "prompt",
        );
        return (
            <Stage>
                <CreateThreadPromptView
                    open
                    phase={phase()}
                    useWorktree={useWorktree()}
                    error=""
                    pending={phase() === "creating"}
                    onWorktreeChange={setUseWorktree}
                    onConfirm={() => {
                        setPhase("creating");
                        setTimeout(() => setPhase("prompt"), 1500);
                    }}
                    onCancel={() => {}}
                    onOverlayClick={() => {}}
                />
            </Stage>
        );
    },
};
