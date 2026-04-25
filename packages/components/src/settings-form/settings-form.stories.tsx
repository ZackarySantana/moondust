import { createSignal, type JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button } from "../button/button";
import { Separator } from "../separator/separator";
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

const Frame = (props: { children: JSX.Element }) => (
    <div class="min-h-screen bg-void-950 p-10">
        <div class="mx-auto max-w-3xl">{props.children}</div>
    </div>
);

const Card = (props: { label: string; children: JSX.Element }) => (
    <div>
        <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
            {props.label}
        </p>
        <div class="border border-void-700 bg-void-900 p-6">
            {props.children}
        </div>
    </div>
);

export const Anatomy: Story = {
    render: () => {
        const [name, setName] = createSignal("moondust-companion");
        return (
            <Frame>
                <div class="space-y-8">
                    <Card label="editable">
                        <FieldRow
                            id="anat-name"
                            label="Project name"
                            value={name()}
                            placeholder="moondust-companion"
                            description="Shown in the sidebar and project picker."
                            onInput={(e) =>
                                setName(e.currentTarget.value)
                            }
                        />
                    </Card>
                    <Card label="readonly">
                        <FieldRow
                            id="anat-path"
                            label="Project path"
                            value="/Users/leo/code/moondust-companion"
                            description="Read only fields omit the onInput handler."
                        />
                    </Card>
                    <Card label="disabled">
                        <FieldRow
                            id="anat-branch"
                            label="Default branch"
                            value="origin/main"
                            disabled
                            onInput={() => {}}
                            description="Disabled while another job is in progress."
                        />
                    </Card>
                    <Card label="copyable">
                        <CopyableReadonlyField
                            label="Workspace ID"
                            value="ws_01HXXXX0000ABCDE"
                            copyAriaLabel="Copy workspace ID"
                            description="Click to copy the ID to your clipboard."
                        />
                    </Card>
                </div>
            </Frame>
        );
    },
};

export const Sections: Story = {
    render: () => {
        const [name, setName] = createSignal("moondust-companion");
        const [branch, setBranch] = createSignal("origin/main");
        return (
            <Frame>
                <Card label="project / settings">
                    <div class="space-y-10">
                        <Section
                            title="General"
                            description="Project wide identity and naming."
                        >
                            <FieldRow
                                id="sec-name"
                                label="Name"
                                value={name()}
                                onInput={(e) =>
                                    setName(e.currentTarget.value)
                                }
                            />
                            <FieldRow
                                id="sec-path"
                                label="Path"
                                value="/Users/leo/code/moondust-companion"
                            />
                        </Section>
                        <Separator />
                        <Section
                            title="Git"
                            description="Branching defaults applied to new threads."
                        >
                            <FieldRow
                                id="sec-branch"
                                label="Default branch"
                                value={branch()}
                                onInput={(e) =>
                                    setBranch(e.currentTarget.value)
                                }
                                description="Tip: use origin/main or origin/master."
                            />
                        </Section>
                    </div>
                </Card>
            </Frame>
        );
    },
};

export const Identifiers: Story = {
    render: () => (
        <Frame>
            <Card label="project / identifiers">
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
                        label="Workspace ID"
                        value="ws_01HXXXX0000ABCDE"
                        copyAriaLabel="Copy workspace ID"
                    />
                    <CopyableReadonlyField
                        label="API key"
                        value="md_sk_live_abcdef1234567890"
                        copyAriaLabel="Copy API key"
                        description="Treat like a password."
                    />
                </Section>
            </Card>
        </Frame>
    ),
};

export const InContext: Story = {
    render: () => {
        const [name, setName] = createSignal("moondust-companion");
        const [hint, setHint] = createSignal("Internal tooling for design");
        const [branch, setBranch] = createSignal("origin/main");
        return (
            <Frame>
                <header class="mb-8">
                    <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-starlight-400">
                        moondust-companion / settings
                    </p>
                    <h1 class="mt-2 text-3xl font-semibold tracking-tight text-void-50">
                        Project settings
                    </h1>
                </header>

                <div class="border border-void-700 bg-void-900">
                    <div class="space-y-10 p-6">
                        <Section
                            title="Identity"
                            description="Names and descriptions that appear in the UI."
                        >
                            <FieldRow
                                id="ic-name"
                                label="Name"
                                value={name()}
                                onInput={(e) =>
                                    setName(e.currentTarget.value)
                                }
                            />
                            <FieldRow
                                id="ic-desc"
                                label="Description"
                                value={hint()}
                                onInput={(e) =>
                                    setHint(e.currentTarget.value)
                                }
                                description="Optional, shown on the project picker."
                            />
                        </Section>
                        <Separator />
                        <Section
                            title="Location"
                            description="Where the project lives on disk and in git."
                        >
                            <FieldRow
                                id="ic-path"
                                label="Local path"
                                value="/Users/leo/code/moondust-companion"
                            />
                            <FieldRow
                                id="ic-branch"
                                label="Default branch"
                                value={branch()}
                                onInput={(e) =>
                                    setBranch(e.currentTarget.value)
                                }
                            />
                        </Section>
                        <Separator />
                        <Section
                            title="Identifiers"
                            description="Stable IDs for integrations and the API."
                        >
                            <CopyableReadonlyField
                                label="Project ID"
                                value="proj_01HX1234567890"
                                copyAriaLabel="Copy project ID"
                            />
                            <CopyableReadonlyField
                                label="Workspace ID"
                                value="ws_01HXXXX0000ABCDE"
                                copyAriaLabel="Copy workspace ID"
                            />
                            <CopyableReadonlyField
                                label="API key"
                                value="md_sk_live_abcdef1234567890"
                                copyAriaLabel="Copy API key"
                                description="Treat like a password."
                            />
                        </Section>
                    </div>
                    <Separator />
                    <div class="flex items-center justify-end gap-2 px-6 py-3">
                        <Button variant="ghost">Cancel</Button>
                        <Button>Save changes</Button>
                    </div>
                </div>
            </Frame>
        );
    },
};
