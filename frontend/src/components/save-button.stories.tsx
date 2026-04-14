import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { SaveButton } from "./save-button";

function InteractiveSaveDemo(props: {
    startDirty: boolean;
    failSave?: boolean;
}) {
    const [dirty, setDirty] = createSignal(props.startDirty);
    const [pending, setPending] = createSignal(false);

    return (
        <div class="flex flex-col items-start gap-4">
            <label class="flex cursor-pointer items-center gap-2 text-xs text-slate-400">
                <input
                    type="checkbox"
                    checked={dirty()}
                    onChange={(e) => setDirty(e.currentTarget.checked)}
                />
                Dirty (unsaved changes)
            </label>
            <SaveButton
                dirty={dirty()}
                isPending={pending()}
                onClick={() => {
                    setPending(true);
                    window.setTimeout(() => {
                        setPending(false);
                        if (!props.failSave) setDirty(false);
                    }, 1200);
                }}
            />
        </div>
    );
}

const meta = {
    title: "UI/SaveButton",
    component: SaveButton,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof SaveButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Clean: Story = {
    args: {
        dirty: false,
        isPending: false,
        onClick: () => {},
    },
};

export const DirtyReady: Story = {
    args: {
        dirty: true,
        isPending: false,
        onClick: () => {},
    },
};

export const Saving: Story = {
    args: {
        dirty: true,
        isPending: true,
        onClick: () => {},
    },
};

export const Interactive: Story = {
    render: () => <InteractiveSaveDemo startDirty />,
};

export const InteractiveStayDirty: Story = {
    name: "Interactive (save keeps dirty)",
    render: () => (
        <InteractiveSaveDemo
            startDirty
            failSave
        />
    ),
};
