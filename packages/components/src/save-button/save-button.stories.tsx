import { createSignal, type JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button } from "../button/button";
import { Input } from "../input/input";
import { Label } from "../label/label";
import { Select } from "../select/select";
import { Separator } from "../separator/separator";
import { SaveButton } from "./save-button";

const meta = {
    title: "Forms/SaveButton",
    component: SaveButton,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    argTypes: {
        dirty: { control: "boolean" },
        isPending: { control: "boolean" },
        disabled: { control: "boolean" },
    },
} satisfies Meta<typeof SaveButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const Row = (props: { label: string; children: JSX.Element }) => (
    <div class="grid grid-cols-[110px_1fr] items-center gap-6">
        <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
            {props.label}
        </span>
        <div class="flex flex-wrap items-center gap-3">{props.children}</div>
    </div>
);

const Frame = (props: { children: JSX.Element }) => (
    <div class="min-w-3xl bg-void-950 p-10">
        <div class="space-y-6">{props.children}</div>
    </div>
);

export const Playground: Story = {
    args: {
        dirty: true,
        isPending: false,
        disabled: false,
        onClick: () => {},
    },
};

export const States: Story = {
    render: () => (
        <Frame>
            <Row label="clean">
                <SaveButton
                    dirty={false}
                    isPending={false}
                    onClick={() => {}}
                />
                <span class="text-xs text-void-400">
                    No unsaved changes, button is inert
                </span>
            </Row>
            <Row label="dirty">
                <SaveButton dirty isPending={false} onClick={() => {}} />
                <span class="text-xs text-void-400">
                    Form has unsaved changes
                </span>
            </Row>
            <Row label="saving">
                <SaveButton dirty isPending onClick={() => {}} />
                <span class="text-xs text-void-400">
                    Spinner with pending label
                </span>
            </Row>
            <Row label="disabled">
                <SaveButton
                    dirty
                    isPending={false}
                    disabled
                    onClick={() => {}}
                />
                <span class="text-xs text-void-400">
                    Externally blocked, e.g. another job in progress
                </span>
            </Row>
        </Frame>
    ),
};

export const CustomLabels: Story = {
    render: () => (
        <Frame>
            <Row label="apply">
                <SaveButton
                    dirty
                    isPending={false}
                    label="Apply"
                    savedLabel="Applied"
                    pendingLabel="Applying…"
                    onClick={() => {}}
                />
            </Row>
            <Row label="connect">
                <SaveButton
                    dirty
                    isPending={false}
                    label="Connect"
                    savedLabel="Connected"
                    pendingLabel="Connecting…"
                    onClick={() => {}}
                />
            </Row>
            <Row label="publish">
                <SaveButton
                    dirty
                    isPending
                    label="Publish"
                    savedLabel="Published"
                    pendingLabel="Publishing…"
                    onClick={() => {}}
                />
            </Row>
        </Frame>
    ),
};

export const LiveCycle: Story = {
    parameters: { layout: "padded" },
    render: () => {
        const [name, setName] = createSignal("moondust-companion");
        const [savedName, setSavedName] = createSignal("moondust-companion");
        const [pending, setPending] = createSignal(false);

        function save() {
            setPending(true);
            setTimeout(() => {
                setSavedName(name());
                setPending(false);
            }, 1200);
        }

        return (
            <div class="min-h-screen bg-void-950 p-10">
                <div class="mx-auto max-w-xl">
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        Project settings
                    </p>
                    <div class="border border-void-700 bg-void-900 p-6">
                        <div class="mb-5">
                            <Label for="lc-name">Project name</Label>
                            <Input
                                id="lc-name"
                                value={name()}
                                onInput={(e) =>
                                    setName(e.currentTarget.value)
                                }
                            />
                            <p class="mt-1.5 text-xs text-void-400">
                                Edit the name then click Save. The button
                                cycles through dirty, saving, saved, then
                                returns to clean after 2 seconds.
                            </p>
                        </div>
                        <Separator class="!my-4" />
                        <div class="flex items-center justify-between">
                            <div class="text-xs text-void-500">
                                Saved value:{" "}
                                <code class="font-mono text-void-300">
                                    {savedName()}
                                </code>
                            </div>
                            <div class="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setName(savedName())}
                                >
                                    Reset
                                </Button>
                                <SaveButton
                                    dirty={name() !== savedName()}
                                    isPending={pending()}
                                    onClick={save}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
};

export const InContext: Story = {
    parameters: { layout: "padded" },
    render: () => {
        const [name, setName] = createSignal("moondust-companion");
        const [provider, setProvider] = createSignal("Anthropic");
        const [tokens, setTokens] = createSignal("4096");
        const [savedName, setSavedName] = createSignal("moondust-companion");
        const [savedProvider, setSavedProvider] = createSignal("Anthropic");
        const [savedTokens, setSavedTokens] = createSignal("4096");
        const [pending, setPending] = createSignal(false);

        const dirty = () =>
            name() !== savedName() ||
            provider() !== savedProvider() ||
            tokens() !== savedTokens();

        function save() {
            setPending(true);
            setTimeout(() => {
                setSavedName(name());
                setSavedProvider(provider());
                setSavedTokens(tokens());
                setPending(false);
            }, 1000);
        }

        function reset() {
            setName(savedName());
            setProvider(savedProvider());
            setTokens(savedTokens());
        }

        return (
            <div class="min-h-screen bg-void-950 p-10">
                <div class="mx-auto max-w-2xl">
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        Project settings
                    </p>
                    <div class="border border-void-700 bg-void-900">
                        <div class="space-y-5 p-6">
                            <div>
                                <Label for="ic-name">Name</Label>
                                <Input
                                    id="ic-name"
                                    value={name()}
                                    onInput={(e) =>
                                        setName(e.currentTarget.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label for="ic-provider">Provider</Label>
                                <Select
                                    id="ic-provider"
                                    value={provider()}
                                    onChange={(e) =>
                                        setProvider(e.currentTarget.value)
                                    }
                                >
                                    <option>Anthropic</option>
                                    <option>OpenAI</option>
                                    <option>Google</option>
                                </Select>
                            </div>
                            <div>
                                <Label for="ic-tokens">Max tokens</Label>
                                <Input
                                    id="ic-tokens"
                                    type="number"
                                    value={tokens()}
                                    onInput={(e) =>
                                        setTokens(e.currentTarget.value)
                                    }
                                    class="text-right font-mono tabular-nums"
                                />
                            </div>
                        </div>
                        <Separator />
                        <div class="flex items-center justify-between px-6 py-3">
                            <div class="text-xs text-void-500">
                                {dirty()
                                    ? "Unsaved changes"
                                    : "All changes saved"}
                            </div>
                            <div class="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    disabled={!dirty() || pending()}
                                    onClick={reset}
                                >
                                    Reset
                                </Button>
                                <SaveButton
                                    dirty={dirty()}
                                    isPending={pending()}
                                    onClick={save}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
};
