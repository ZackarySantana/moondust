import Brain from "lucide-solid/icons/brain";
import Eye from "lucide-solid/icons/eye";
import FileText from "lucide-solid/icons/file-text";
import Hash from "lucide-solid/icons/hash";
import ImageIcon from "lucide-solid/icons/image";
import Sparkles from "lucide-solid/icons/sparkles";
import Wrench from "lucide-solid/icons/wrench";
import Zap from "lucide-solid/icons/zap";
import { createSignal, For, type JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Chip } from "./chip";

const meta = {
    title: "UI/Chip",
    component: Chip,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    args: {
        children: "Vision",
        tone: "nebula",
        size: "default",
        icon: Eye,
    },
    argTypes: {
        tone: {
            control: { type: "select" },
            options: ["neutral", "starlight", "nebula", "flare", "outline"],
        },
        size: { control: { type: "select" }, options: ["sm", "default"] },
        selectable: { control: { type: "boolean" } },
        selected: { control: { type: "boolean" } },
    },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = (props: { children: JSX.Element }) => (
    <div class="min-w-3xl bg-void-950 p-10">
        <div class="space-y-8">{props.children}</div>
    </div>
);

const Row = (props: { label: string; children: JSX.Element }) => (
    <div class="grid grid-cols-[140px_1fr] items-center gap-6">
        <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
            {props.label}
        </span>
        <div class="flex flex-wrap items-center gap-2">{props.children}</div>
    </div>
);

export const Playground: Story = {};

export const Tones: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="neutral">
                <Chip>Neutral</Chip>
                <Chip icon={Hash}>Tag</Chip>
            </Row>
            <Row label="starlight">
                <Chip tone="starlight" icon={Sparkles}>
                    Pro
                </Chip>
                <Chip tone="starlight">Selected</Chip>
            </Row>
            <Row label="nebula">
                <Chip tone="nebula" icon={Eye}>
                    Vision
                </Chip>
                <Chip tone="nebula" icon={Brain}>
                    Reasoning
                </Chip>
            </Row>
            <Row label="flare">
                <Chip tone="flare" icon={Zap}>
                    Deprecated
                </Chip>
                <Chip tone="flare">Beta</Chip>
            </Row>
            <Row label="outline">
                <Chip tone="outline">Outline</Chip>
                <Chip tone="outline" icon={FileText}>
                    Long context
                </Chip>
            </Row>
        </Frame>
    ),
};

export const Sizes: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="default">
                <Chip tone="nebula" icon={Eye}>
                    Vision
                </Chip>
                <Chip tone="nebula" icon={Brain}>
                    Reasoning
                </Chip>
                <Chip tone="nebula" icon={FileText}>
                    Long context
                </Chip>
                <Chip tone="nebula" icon={Wrench}>
                    Tools
                </Chip>
            </Row>
            <Row label="sm">
                <Chip tone="nebula" icon={Eye} size="sm">
                    Vision
                </Chip>
                <Chip tone="nebula" icon={Brain} size="sm">
                    Reasoning
                </Chip>
                <Chip tone="nebula" icon={FileText} size="sm">
                    Long context
                </Chip>
                <Chip tone="nebula" icon={Wrench} size="sm">
                    Tools
                </Chip>
            </Row>
        </Frame>
    ),
};

export const Removable: Story = {
    parameters: { layout: "padded" },
    render: () => {
        const [tags, setTags] = createSignal([
            "auth",
            "router",
            "feature/login",
            "p0",
        ]);
        return (
            <Frame>
                <Row label="filters">
                    <For each={tags()}>
                        {(t) => (
                            <Chip
                                tone="outline"
                                onRemove={() =>
                                    setTags((prev) =>
                                        prev.filter((x) => x !== t),
                                    )
                                }
                            >
                                {t}
                            </Chip>
                        )}
                    </For>
                </Row>
            </Frame>
        );
    },
};

export const Selectable: Story = {
    parameters: { layout: "padded" },
    render: () => {
        const all = [
            { id: "vision", label: "Vision", icon: Eye },
            { id: "reasoning", label: "Reasoning", icon: Brain },
            { id: "long-context", label: "Long context", icon: FileText },
            { id: "tools", label: "Tools", icon: Wrench },
            { id: "image", label: "Image", icon: ImageIcon },
        ] as const;
        const [picked, setPicked] = createSignal<Set<string>>(
            new Set(["vision", "long-context"]),
        );
        return (
            <Frame>
                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    capability filter — toggle chips
                </p>
                <Row label="filters">
                    <For each={all}>
                        {(c) => (
                            <Chip
                                tone="nebula"
                                icon={c.icon}
                                selectable
                                selected={picked().has(c.id)}
                                onSelect={() =>
                                    setPicked((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(c.id)) next.delete(c.id);
                                        else next.add(c.id);
                                        return next;
                                    })
                                }
                            >
                                {c.label}
                            </Chip>
                        )}
                    </For>
                </Row>
            </Frame>
        );
    },
};

export const InContext: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-2xl space-y-6">
                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    in context — model row capabilities
                </p>

                <div class="border border-void-700 bg-void-900">
                    <ModelRow
                        name="Claude 3.5 Sonnet"
                        id="claude-3.5-sonnet"
                        caps={[
                            { label: "Vision", icon: Eye },
                            { label: "Reasoning", icon: Brain },
                            { label: "Long context", icon: FileText },
                            { label: "Tools", icon: Wrench },
                        ]}
                    />
                    <ModelRow
                        name="GPT-4o"
                        id="gpt-4o"
                        caps={[
                            { label: "Vision", icon: Eye },
                            { label: "Tools", icon: Wrench },
                        ]}
                    />
                    <ModelRow
                        name="Llama 3.1 70B"
                        id="meta-llama/llama-3.1-70b"
                        caps={[
                            { label: "Long context", icon: FileText },
                        ]}
                    />
                </div>
            </div>
        </div>
    ),
};

const ModelRow = (props: {
    name: string;
    id: string;
    caps: readonly { label: string; icon: typeof Eye }[];
}) => (
    <div class="space-y-1.5 border-b border-void-700 px-3 py-3 last:border-b-0">
        <div class="flex items-baseline gap-2">
            <p class="text-[13px] font-medium text-void-50">{props.name}</p>
            <code class="font-mono text-[10px] text-void-500">{props.id}</code>
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
            <For each={props.caps}>
                {(c) => (
                    <Chip tone="nebula" icon={c.icon} size="sm">
                        {c.label}
                    </Chip>
                )}
            </For>
        </div>
    </div>
);
