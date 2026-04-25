import type { JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Badge, type BadgeProps } from "./badge";

const meta = {
    title: "UI/Badge",
    component: Badge,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    args: {
        children: "Default",
        tone: "neutral",
        size: "default",
    },
    argTypes: {
        tone: {
            control: { type: "select" },
            options: ["neutral", "starlight", "nebula", "flare", "outline"],
        },
        size: {
            control: { type: "select" },
            options: ["sm", "default"],
        },
        dot: { control: { type: "boolean" } },
        mono: { control: { type: "boolean" } },
    },
} satisfies Meta<typeof Badge>;

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

export const Playground: Story = {
    args: {
        children: "Live",
        tone: "starlight",
        dot: true,
    },
};

export const Tones: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="neutral">
                <Badge>Neutral</Badge>
                <Badge dot>With dot</Badge>
                <Badge mono>123</Badge>
            </Row>
            <Row label="starlight">
                <Badge tone="starlight">Selected</Badge>
                <Badge tone="starlight" dot>
                    Active
                </Badge>
                <Badge tone="starlight" mono>
                    $0.0124
                </Badge>
            </Row>
            <Row label="nebula">
                <Badge tone="nebula">Info</Badge>
                <Badge tone="nebula" dot>
                    Live
                </Badge>
                <Badge tone="nebula" mono>
                    main
                </Badge>
            </Row>
            <Row label="flare">
                <Badge tone="flare">Warning</Badge>
                <Badge tone="flare" dot>
                    Failed
                </Badge>
                <Badge tone="flare" mono>
                    !12
                </Badge>
            </Row>
            <Row label="outline">
                <Badge tone="outline">Outline</Badge>
                <Badge tone="outline" dot>
                    Hollow
                </Badge>
                <Badge tone="outline" mono>
                    v2.1.0
                </Badge>
            </Row>
        </Frame>
    ),
};

export const Sizes: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="default">
                <Badge tone="neutral">Neutral</Badge>
                <Badge tone="starlight">Starlight</Badge>
                <Badge tone="nebula">Nebula</Badge>
                <Badge tone="flare">Flare</Badge>
            </Row>
            <Row label="sm">
                <Badge tone="neutral" size="sm">
                    Neutral
                </Badge>
                <Badge tone="starlight" size="sm">
                    Starlight
                </Badge>
                <Badge tone="nebula" size="sm">
                    Nebula
                </Badge>
                <Badge tone="flare" size="sm">
                    Flare
                </Badge>
            </Row>
            <Row label="dotted sm">
                <Badge tone="starlight" size="sm" dot>
                    Live
                </Badge>
                <Badge tone="nebula" size="sm" dot>
                    Idle
                </Badge>
                <Badge tone="flare" size="sm" dot>
                    Down
                </Badge>
            </Row>
        </Frame>
    ),
};

export const SemanticUses: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <Frame>
            <Row label="status">
                <Badge tone="starlight" dot>
                    Running
                </Badge>
                <Badge tone="nebula" dot>
                    Queued
                </Badge>
                <Badge tone="flare" dot>
                    Failed
                </Badge>
                <Badge tone="outline">Idle</Badge>
            </Row>
            <Row label="counts">
                <Badge mono>3</Badge>
                <Badge tone="starlight" mono>
                    12
                </Badge>
                <Badge tone="flare" mono>
                    !2
                </Badge>
            </Row>
            <Row label="identifiers">
                <Badge tone="nebula" mono>
                    main
                </Badge>
                <Badge tone="nebula" mono>
                    feature/login-flow
                </Badge>
                <Badge tone="outline" mono>
                    v2.1.0
                </Badge>
            </Row>
            <Row label="cost">
                <Badge tone="starlight" mono>
                    $0.0124
                </Badge>
                <Badge mono>1.8k tok</Badge>
                <Badge tone="outline" mono>
                    free
                </Badge>
            </Row>
            <Row label="kinds">
                <Badge tone="starlight">Pro</Badge>
                <Badge tone="outline">Beta</Badge>
                <Badge tone="flare">Deprecated</Badge>
            </Row>
        </Frame>
    ),
};

export const InContext: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-3xl space-y-6">
                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    in context — badges across surfaces
                </p>

                <article class="border border-void-700 bg-void-900">
                    <header class="flex items-center justify-between border-b border-void-700 px-4 py-3">
                        <div class="flex items-center gap-3">
                            <span class="text-sm font-medium text-void-50">
                                Refactor router
                            </span>
                            <Badge tone="starlight" dot size="sm">
                                Running
                            </Badge>
                        </div>
                        <div class="flex items-center gap-2">
                            <Badge tone="nebula" mono size="sm">
                                claude-3.5-sonnet
                            </Badge>
                            <Badge tone="starlight" mono size="sm">
                                $0.0124
                            </Badge>
                        </div>
                    </header>
                    <div class="space-y-3 p-4 text-sm text-void-200">
                        <p class="leading-relaxed">
                            Two approaches: a tiny custom hook, or use
                            tanstack/router's loaders.
                        </p>
                        <div class="flex flex-wrap items-center gap-2">
                            <Badge tone="outline" size="sm">
                                Plan
                            </Badge>
                            <Badge tone="outline" size="sm">
                                Refactor
                            </Badge>
                            <Badge tone="outline" size="sm">
                                Router
                            </Badge>
                        </div>
                    </div>
                </article>

                <div class="border border-void-700 bg-void-900 p-4">
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        navigation tabs with counters
                    </p>
                    <nav class="flex items-center gap-4">
                        <NavLink active label="Threads" count={4} />
                        <NavLink label="Files" count={12} />
                        <NavLink label="Diffs" count={3} tone="flare" />
                        <NavLink label="Settings" />
                    </nav>
                </div>

                <div class="border border-void-700 bg-void-900 p-4">
                    <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                        provider list with state
                    </p>
                    <ul class="divide-y divide-void-700">
                        <ProviderRow
                            name="Anthropic"
                            model="claude-3.5-sonnet"
                            state="active"
                        />
                        <ProviderRow
                            name="OpenAI"
                            model="gpt-4o"
                            state="active"
                        />
                        <ProviderRow
                            name="Google"
                            model="gemini-1.5-pro"
                            state="needs-key"
                        />
                        <ProviderRow
                            name="Local"
                            model="llama-3.1-8b"
                            state="offline"
                        />
                    </ul>
                </div>
            </div>
        </div>
    ),
};

const NavLink = (props: {
    label: string;
    active?: boolean;
    count?: number;
    tone?: BadgeProps["tone"];
}) => (
    <a
        href="#"
        class={`flex items-center gap-2 border-b-2 pb-2 text-sm transition-colors duration-100 ${
            props.active
                ? "border-starlight-400 text-void-50"
                : "border-transparent text-void-400 hover:text-void-200"
        }`}
    >
        <span>{props.label}</span>
        {props.count !== undefined && (
            <Badge tone={props.tone ?? "neutral"} size="sm" mono>
                {props.count}
            </Badge>
        )}
    </a>
);

const ProviderRow = (props: {
    name: string;
    model: string;
    state: "active" | "needs-key" | "offline";
}) => (
    <li class="flex items-center justify-between py-2.5">
        <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-void-100">{props.name}</span>
            <code class="font-mono text-[12px] text-nebula-300">
                {props.model}
            </code>
        </div>
        {props.state === "active" && (
            <Badge tone="starlight" dot size="sm">
                Active
            </Badge>
        )}
        {props.state === "needs-key" && (
            <Badge tone="flare" size="sm">
                Needs key
            </Badge>
        )}
        {props.state === "offline" && (
            <Badge tone="outline" size="sm">
                Offline
            </Badge>
        )}
    </li>
);
