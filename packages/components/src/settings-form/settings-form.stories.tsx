import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import {
    CopyableReadonlyField,
    FieldRow,
    Section,
} from "./settings-form";

const meta = {
    title: "Forms/SettingsForm",
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleFieldRow: Story = {
    render: () => {
        const [value, setValue] = createSignal("My project");
        return (
            <div class="max-w-2xl">
                <FieldRow
                    id="single-name"
                    label="Project name"
                    value={value()}
                    placeholder="My project"
                    description="Shown in the sidebar and project picker."
                    onInput={(e) => setValue(e.currentTarget.value)}
                />
            </div>
        );
    },
};

export const ReadOnlyFieldRow: Story = {
    render: () => (
        <div class="max-w-2xl">
            <FieldRow
                id="ro-path"
                label="Project path"
                value="/Users/me/work/moondust"
                description="Read-only fields omit the onInput handler."
            />
        </div>
    ),
};

export const DisabledFieldRow: Story = {
    render: () => (
        <div class="max-w-2xl">
            <FieldRow
                id="dis-branch"
                label="Default branch"
                value="origin/main"
                disabled
                onInput={() => {}}
                description="Disabled while another job is in progress."
            />
        </div>
    ),
};

export const SectionLayout: Story = {
    render: () => {
        const [name, setName] = createSignal("Moondust");
        const [branch, setBranch] = createSignal("origin/main");
        return (
            <div class="max-w-2xl space-y-10">
                <Section
                    title="General"
                    description="Project-wide identity and naming."
                >
                    <FieldRow
                        id="sec-name"
                        label="Name"
                        value={name()}
                        onInput={(e) => setName(e.currentTarget.value)}
                    />
                    <FieldRow
                        id="sec-path"
                        label="Path"
                        value="/Users/me/work/moondust"
                    />
                </Section>
                <Section
                    title="Git"
                    description="Branching defaults applied to new threads."
                >
                    <FieldRow
                        id="sec-branch"
                        label="Default branch"
                        value={branch()}
                        onInput={(e) => setBranch(e.currentTarget.value)}
                        description="Tip: use origin/main or origin/master."
                    />
                </Section>
            </div>
        );
    },
};

export const CopyableField: Story = {
    render: () => (
        <div class="max-w-2xl">
            <CopyableReadonlyField
                label="Workspace ID"
                value="ws_01HXXXX0000ABCDE"
                copyAriaLabel="Copy workspace ID"
                description="Click to copy the ID to your clipboard."
            />
        </div>
    ),
};

export const FullForm: Story = {
    render: () => {
        const [name, setName] = createSignal("Moondust");
        const [hint, setHint] = createSignal("Internal tooling");
        return (
            <div class="max-w-2xl space-y-10">
                <Section
                    title="Identity"
                    description="Names that appear in the UI."
                >
                    <FieldRow
                        id="full-name"
                        label="Name"
                        value={name()}
                        onInput={(e) => setName(e.currentTarget.value)}
                    />
                    <FieldRow
                        id="full-hint"
                        label="Description"
                        value={hint()}
                        onInput={(e) => setHint(e.currentTarget.value)}
                    />
                </Section>
                <Section
                    title="Identifiers"
                    description="Stable IDs for integrations."
                >
                    <CopyableReadonlyField
                        label="Project ID"
                        value="proj_01HX1234567890"
                        copyAriaLabel="Copy project ID"
                    />
                    <CopyableReadonlyField
                        label="API key"
                        value="md_sk_live_abcdef1234567890"
                        copyAriaLabel="Copy API key"
                        description="Treat like a password."
                    />
                </Section>
            </div>
        );
    },
};
