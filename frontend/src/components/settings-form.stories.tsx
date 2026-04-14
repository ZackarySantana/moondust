import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyableReadonlyField, FieldRow, Section } from "./settings-form";

const meta = {
    title: "Settings/SettingsForm",
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SectionBlock: Story = {
    render: () => (
        <div class="max-w-xl rounded-lg border border-slate-800/50 bg-slate-950/20 p-6">
            <Section
                title="Example section"
                description="Optional description copy for settings groups."
            >
                <p class="text-sm text-slate-400">
                    Child content uses the same spacing rhythm as project
                    settings.
                </p>
            </Section>
        </div>
    ),
};

export const FieldRowStory: Story = {
    render: () => (
        <div class="max-w-2xl rounded-lg border border-slate-800/50 bg-slate-950/20 p-6">
            <FieldRow
                id="field-repo"
                label="Repository"
                value="https://github.com/org/repo"
                placeholder="URL"
                onInput={() => {}}
                description="Shown for illustration; not wired to save."
            />
        </div>
    ),
};

export const CopyableReadonlyFieldStory: Story = {
    render: () => (
        <div class="max-w-2xl rounded-lg border border-slate-800/50 bg-slate-950/20 p-6">
            <CopyableReadonlyField
                label="Project ID"
                value="proj_01h2z3k4"
                description="Read-only identifier."
                copyAriaLabel="Copy project ID"
            />
        </div>
    ),
};

export const ComposedSection: Story = {
    render: () => (
        <div class="max-w-2xl rounded-lg border border-slate-800/50 bg-slate-950/20 p-6">
            <Section
                title="Connection"
                description="Example layout combining primitives."
            >
                <div class="space-y-4">
                    <div class="space-y-1">
                        <Label for="story-host">Host</Label>
                        <Input
                            id="story-host"
                            placeholder="localhost"
                        />
                    </div>
                    <CopyableReadonlyField
                        label="Token"
                        value="••••••••"
                        copyAriaLabel="Copy token"
                    />
                </div>
            </Section>
        </div>
    ),
};
