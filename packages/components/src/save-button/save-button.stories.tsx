import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button } from "../button/button";
import { Input } from "../input/input";
import { Label } from "../label/label";
import { SaveButton } from "./save-button";

const meta = {
    title: "Forms/SaveButton",
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

export const Dirty: Story = {
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

export const ExternallyDisabled: Story = {
    args: {
        dirty: true,
        isPending: false,
        disabled: true,
        onClick: () => {},
    },
};

export const Interactive: Story = {
    render: () => {
        const [value, setValue] = createSignal("Moondust");
        const [saved, setSaved] = createSignal("Moondust");
        const [pending, setPending] = createSignal(false);

        function save() {
            setPending(true);
            setTimeout(() => {
                setSaved(value());
                setPending(false);
            }, 1200);
        }

        return (
            <div class="flex w-80 flex-col gap-3">
                <div class="space-y-1.5">
                    <Label for="iv-name">Project name</Label>
                    <Input
                        id="iv-name"
                        value={value()}
                        onInput={(e) => setValue(e.currentTarget.value)}
                    />
                </div>
                <div class="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setValue(saved())}
                    >
                        Reset
                    </Button>
                    <SaveButton
                        dirty={value() !== saved()}
                        isPending={pending()}
                        onClick={save}
                    />
                </div>
            </div>
        );
    },
};

export const CustomLabels: Story = {
    args: {
        dirty: true,
        isPending: false,
        label: "Apply",
        savedLabel: "Applied",
        pendingLabel: "Applying…",
        onClick: () => {},
    },
};
