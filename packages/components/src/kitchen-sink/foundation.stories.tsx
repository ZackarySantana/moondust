import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { For } from "solid-js";
import Bell from "lucide-solid/icons/bell";
import Bot from "lucide-solid/icons/bot";
import GitBranch from "lucide-solid/icons/git-branch";
import Info from "lucide-solid/icons/info";
import Save from "lucide-solid/icons/save";
import Settings from "lucide-solid/icons/settings";
import Trash2 from "lucide-solid/icons/trash-2";
import X from "lucide-solid/icons/x";

const meta: Meta = {
    title: "Kitchen Sink/Foundation",
};

export default meta;
type Story = StoryObj;

interface Swatch {
    label: string;
    classes: string;
    text: string;
    hex: string;
}

const VOID_SWATCHES: Swatch[] = [
    { label: "void/50", classes: "bg-void-50", text: "text-void-950", hex: "#f0f2f9" },
    { label: "void/100", classes: "bg-void-100", text: "text-void-950", hex: "#dde2f0" },
    { label: "void/200", classes: "bg-void-200", text: "text-void-950", hex: "#b8c0dc" },
    { label: "void/300", classes: "bg-void-300", text: "text-void-950", hex: "#8a93bd" },
    { label: "void/400", classes: "bg-void-400", text: "text-void-50", hex: "#5d6798" },
    { label: "void/500", classes: "bg-void-500", text: "text-void-50", hex: "#3d4574" },
    { label: "void/600", classes: "bg-void-600", text: "text-void-50", hex: "#2a305a" },
    { label: "void/700", classes: "bg-void-700", text: "text-void-50", hex: "#1c2142" },
    { label: "void/800", classes: "bg-void-800", text: "text-void-100", hex: "#131730" },
    { label: "void/850", classes: "bg-void-850", text: "text-void-200", hex: "#0c1024" },
    { label: "void/900", classes: "bg-void-900", text: "text-void-200", hex: "#080a18" },
    { label: "void/950", classes: "bg-void-950", text: "text-void-200", hex: "#050610" },
];

const STARLIGHT_SWATCHES: Swatch[] = [
    { label: "starlight/50", classes: "bg-starlight-50", text: "text-void-950", hex: "#fef9e7" },
    { label: "starlight/100", classes: "bg-starlight-100", text: "text-void-950", hex: "#fcefb8" },
    { label: "starlight/200", classes: "bg-starlight-200", text: "text-void-950", hex: "#f5dc7a" },
    { label: "starlight/300", classes: "bg-starlight-300", text: "text-void-950", hex: "#e8c248" },
    { label: "starlight/400", classes: "bg-starlight-400", text: "text-void-950", hex: "#c89e2b" },
    { label: "starlight/500", classes: "bg-starlight-500", text: "text-void-50", hex: "#a17e1f" },
    { label: "starlight/600", classes: "bg-starlight-600", text: "text-void-50", hex: "#745b15" },
    { label: "starlight/700", classes: "bg-starlight-700", text: "text-void-50", hex: "#4a3a0d" },
];

const NEBULA_SWATCHES: Swatch[] = [
    { label: "nebula/200", classes: "bg-nebula-200", text: "text-void-950", hex: "#d8cdf0" },
    { label: "nebula/300", classes: "bg-nebula-300", text: "text-void-950", hex: "#b9a6e6" },
    { label: "nebula/400", classes: "bg-nebula-400", text: "text-void-950", hex: "#9b87d4" },
    { label: "nebula/500", classes: "bg-nebula-500", text: "text-void-50", hex: "#7d6abf" },
    { label: "nebula/600", classes: "bg-nebula-600", text: "text-void-50", hex: "#5e4fa0" },
    { label: "nebula/700", classes: "bg-nebula-700", text: "text-void-50", hex: "#443a7c" },
];

const FLARE_SWATCHES: Swatch[] = [
    { label: "flare/300", classes: "bg-flare-300", text: "text-void-950", hex: "#f1a092" },
    { label: "flare/400", classes: "bg-flare-400", text: "text-void-950", hex: "#e87766" },
    { label: "flare/500", classes: "bg-flare-500", text: "text-void-50", hex: "#d65a48" },
    { label: "flare/600", classes: "bg-flare-600", text: "text-void-50", hex: "#ab3d2e" },
    { label: "flare/700", classes: "bg-flare-700", text: "text-void-50", hex: "#7a2920" },
];

const SectionHeader = (props: { name: string; role: string }) => (
    <div class="mb-3 flex items-baseline justify-between border-b border-void-700 pb-2">
        <h2 class="text-sm font-semibold tracking-tight text-void-100">
            {props.name}
        </h2>
        <span class="font-mono text-[11px] text-void-400">{props.role}</span>
    </div>
);

const SwatchRow = (props: { swatches: Swatch[] }) => (
    <div class="grid grid-cols-2 gap-px bg-void-700 sm:grid-cols-4 lg:grid-cols-6">
        <For each={props.swatches}>
            {(s) => (
                <div
                    class={`flex h-20 flex-col justify-between p-2 ${s.classes} ${s.text}`}
                >
                    <span class="text-[11px] font-medium tracking-tight">
                        {s.label}
                    </span>
                    <span class="font-mono text-[10px] opacity-80">
                        {s.hex}
                    </span>
                </div>
            )}
        </For>
    </div>
);

export const Palette: Story = {
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-5xl">
                <header class="mb-10">
                    <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-starlight-400">
                        moondust / design tokens
                    </p>
                    <h1 class="mt-2 text-3xl font-semibold tracking-tight text-void-50">
                        Stellar palette
                    </h1>
                    <p class="mt-3 max-w-2xl text-sm leading-relaxed text-void-300">
                        A four-family system on a deep midnight indigo base.
                        Void carries surfaces and neutral text. Starlight is
                        the signature gold reserved for primary actions.
                        Nebula highlights identifiers in motion. Flare warns.
                    </p>
                </header>

                <section class="mb-10">
                    <SectionHeader name="Void" role="surfaces / neutral text" />
                    <SwatchRow swatches={VOID_SWATCHES} />
                </section>

                <section class="mb-10">
                    <SectionHeader
                        name="Starlight"
                        role="primary action / brand"
                    />
                    <SwatchRow swatches={STARLIGHT_SWATCHES} />
                </section>

                <section class="mb-10">
                    <SectionHeader
                        name="Nebula"
                        role="links / live identifiers"
                    />
                    <SwatchRow swatches={NEBULA_SWATCHES} />
                </section>

                <section>
                    <SectionHeader name="Flare" role="destructive / error" />
                    <SwatchRow swatches={FLARE_SWATCHES} />
                </section>
            </div>
        </div>
    ),
};

export const Typography: Story = {
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-3xl space-y-12">
                <header>
                    <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-starlight-400">
                        moondust / type
                    </p>
                    <h1 class="mt-2 text-3xl font-semibold tracking-tight text-void-50">
                        Inter for prose, JetBrains Mono for identifiers
                    </h1>
                    <p class="mt-3 text-sm leading-relaxed text-void-300">
                        Mono is reserved for things that name something a
                        machine cares about: paths, IDs, hashes, model names,
                        keystrokes, numeric data. Everything else stays in
                        Inter.
                    </p>
                </header>

                <section>
                    <h2 class="mb-4 border-b border-void-700 pb-2 text-sm font-semibold tracking-tight text-void-100">
                        Sans scale (Inter)
                    </h2>
                    <div class="space-y-4">
                        <Row label="display/3xl">
                            <p class="text-3xl font-semibold tracking-tight text-void-50">
                                Build threads, not transcripts.
                            </p>
                        </Row>
                        <Row label="heading/xl">
                            <p class="text-xl font-semibold tracking-tight text-void-100">
                                Project settings
                            </p>
                        </Row>
                        <Row label="heading/base">
                            <p class="text-base font-medium text-void-100">
                                Recent threads
                            </p>
                        </Row>
                        <Row label="body/sm">
                            <p class="text-sm leading-relaxed text-void-200">
                                A working thread that you keep editing as you
                                learn. Forks become cheap experiments.
                            </p>
                        </Row>
                        <Row label="caption/xs">
                            <p class="text-xs text-void-400">
                                Created 2 minutes ago by you
                            </p>
                        </Row>
                    </div>
                </section>

                <section>
                    <h2 class="mb-4 border-b border-void-700 pb-2 text-sm font-semibold tracking-tight text-void-100">
                        Mono semantic (JetBrains Mono)
                    </h2>
                    <div class="space-y-3">
                        <Row label="path">
                            <code class="text-[12px] text-void-200">
                                internal/v2/app/project.go
                            </code>
                        </Row>
                        <Row label="identifier">
                            <code class="text-[12px] text-nebula-300">
                                claude-3.5-sonnet
                            </code>
                        </Row>
                        <Row label="hash">
                            <code class="text-[12px] text-nebula-400">
                                a1b2c3d
                            </code>
                        </Row>
                        <Row label="numeric">
                            <span class="font-mono text-[12px] tabular-nums text-starlight-300">
                                $0.0124
                            </span>
                            <span class="ml-3 font-mono text-[12px] tabular-nums text-void-400">
                                12,481 tok
                            </span>
                        </Row>
                        <Row label="keystroke">
                            <span class="inline-flex items-center gap-1">
                                <kbd class="inline-flex items-center rounded-none border border-b-2 border-void-700 bg-void-800 px-1.5 py-px font-mono text-[10px] leading-none text-void-200">
                                    ⌘
                                </kbd>
                                <kbd class="inline-flex items-center rounded-none border border-b-2 border-void-700 bg-void-800 px-1.5 py-px font-mono text-[10px] leading-none text-void-200">
                                    K
                                </kbd>
                            </span>
                        </Row>
                        <Row label="block">
                            <pre class="rounded-none border border-void-700 bg-void-900 p-3 text-[12px] leading-relaxed text-void-200">{`func (p *Project) Open(ctx context.Context) error {
    if p.path == "" {
        return ErrNoPath
    }
    return nil
}`}</pre>
                        </Row>
                    </div>
                </section>
            </div>
        </div>
    ),
};

const Row = (props: { label: string; children: import("solid-js").JSX.Element }) => (
    <div class="grid grid-cols-[120px_1fr] items-baseline gap-6">
        <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
            {props.label}
        </span>
        <div>{props.children}</div>
    </div>
);

export const Surfaces: Story = {
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-3xl">
                <header class="mb-10">
                    <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-starlight-400">
                        moondust / surfaces
                    </p>
                    <h1 class="mt-2 text-3xl font-semibold tracking-tight text-void-50">
                        Layered void surfaces
                    </h1>
                    <p class="mt-3 max-w-2xl text-sm leading-relaxed text-void-300">
                        Surfaces step up by one shade per layer. Hairlines
                        live at <code class="font-mono text-[12px] text-nebula-300">void-700</code>.
                        Hover/active states bump up by one stop. The viewport
                        below is the canonical four-layer stack.
                    </p>
                </header>

                <div class="bg-void-950 p-6">
                    <Caption tone="950">app background</Caption>
                    <div class="mt-3 border border-void-700 bg-void-900 p-6">
                        <Caption tone="900">primary panel</Caption>
                        <div class="mt-3 border border-void-700 bg-void-850 p-6">
                            <Caption tone="850">elevated surface</Caption>
                            <div class="mt-3 border border-void-700 bg-void-800 p-6">
                                <Caption tone="800">selected / hover</Caption>
                            </div>
                        </div>
                    </div>
                </div>

                <section class="mt-10">
                    <h2 class="mb-4 border-b border-void-700 pb-2 text-sm font-semibold tracking-tight text-void-100">
                        Recipe
                    </h2>
                    <ul class="space-y-2 text-[13px] leading-relaxed text-void-300">
                        <li>
                            <code class="font-mono text-[12px] text-nebula-300">
                                bg-void-950
                            </code>{" "}
                            — app body, story canvas.
                        </li>
                        <li>
                            <code class="font-mono text-[12px] text-nebula-300">
                                bg-void-900
                            </code>{" "}
                            — primary panels, cards, dialogs, popovers.
                        </li>
                        <li>
                            <code class="font-mono text-[12px] text-nebula-300">
                                bg-void-850
                            </code>{" "}
                            — elevated headers, hero strips inside cards.
                        </li>
                        <li>
                            <code class="font-mono text-[12px] text-nebula-300">
                                bg-void-800
                            </code>{" "}
                            — selected/active states, hover targets.
                        </li>
                        <li>
                            <code class="font-mono text-[12px] text-nebula-300">
                                border-void-700
                            </code>{" "}
                            — every hairline divider; no other border tone in
                            normal flow.
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    ),
};

const Caption = (props: {
    tone: string;
    children: import("solid-js").JSX.Element;
}) => (
    <div class="flex items-center justify-between">
        <span class="font-mono text-[10px] uppercase tracking-[0.14em] text-void-500">
            void/{props.tone}
        </span>
        <span class="text-[11px] text-void-400">{props.children}</span>
    </div>
);

export const Iconography: Story = {
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-3xl space-y-12">
                <header>
                    <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-starlight-400">
                        moondust / iconography
                    </p>
                    <h1 class="mt-2 text-3xl font-semibold tracking-tight text-void-50">
                        Lucide, lightly stroked
                    </h1>
                    <p class="mt-3 max-w-2xl text-sm leading-relaxed text-void-300">
                        Icons are{" "}
                        <code class="font-mono text-[12px] text-nebula-300">
                            lucide-solid
                        </code>
                        . Stroke weight is{" "}
                        <code class="font-mono text-[12px] text-nebula-300">
                            2
                        </code>{" "}
                        for inline UI affordances and{" "}
                        <code class="font-mono text-[12px] text-nebula-300">
                            1.75
                        </code>{" "}
                        for navigational and ambient rail icons. The brutal
                        Stellar look favors fewer, more intentional icons over
                        decorating every label.
                    </p>
                </header>

                <section>
                    <h2 class="mb-4 border-b border-void-700 pb-2 text-sm font-semibold tracking-tight text-void-100">
                        Sizes
                    </h2>
                    <div class="space-y-4">
                        <Row label="3.5 / inline">
                            <div class="flex items-center gap-3 text-void-300">
                                <Info class="size-3.5" stroke-width={2} />
                                <span class="text-[12px]">
                                    Inline with 12-13px text
                                </span>
                            </div>
                        </Row>
                        <Row label="4 / button">
                            <div class="flex items-center gap-3 text-void-200">
                                <Save class="size-4" stroke-width={2} />
                                <span class="text-sm">
                                    Default button affordance
                                </span>
                            </div>
                        </Row>
                        <Row label="5 / hero">
                            <div class="flex items-center gap-3 text-starlight-300">
                                <GitBranch class="size-5" stroke-width={1.75} />
                                <span class="text-base">
                                    Empty-state or section hero
                                </span>
                            </div>
                        </Row>
                    </div>
                </section>

                <section>
                    <h2 class="mb-4 border-b border-void-700 pb-2 text-sm font-semibold tracking-tight text-void-100">
                        Tonal use
                    </h2>
                    <div class="space-y-4">
                        <Row label="neutral">
                            <div class="flex items-center gap-4 text-void-400">
                                <Settings class="size-4" stroke-width={2} />
                                <Bell class="size-4" stroke-width={2} />
                                <Bot class="size-4" stroke-width={2} />
                            </div>
                        </Row>
                        <Row label="active">
                            <div class="flex items-center gap-4 text-starlight-300">
                                <Settings class="size-4" stroke-width={2} />
                                <Bell class="size-4" stroke-width={2} />
                                <Bot class="size-4" stroke-width={2} />
                            </div>
                        </Row>
                        <Row label="info">
                            <div class="flex items-center gap-4 text-nebula-300">
                                <Info class="size-4" stroke-width={2} />
                                <GitBranch class="size-4" stroke-width={2} />
                            </div>
                        </Row>
                        <Row label="destructive">
                            <div class="flex items-center gap-4 text-flare-400">
                                <Trash2 class="size-4" stroke-width={2} />
                                <X class="size-4" stroke-width={2} />
                            </div>
                        </Row>
                    </div>
                </section>

                <section>
                    <h2 class="mb-4 border-b border-void-700 pb-2 text-sm font-semibold tracking-tight text-void-100">
                        Rules
                    </h2>
                    <ul class="space-y-2 text-[13px] leading-relaxed text-void-300">
                        <li>
                            Icons are decorative when paired with a label —
                            mark them{" "}
                            <code class="font-mono text-[12px] text-nebula-300">
                                aria-hidden
                            </code>
                            .
                        </li>
                        <li>
                            Solo icon buttons need{" "}
                            <code class="font-mono text-[12px] text-nebula-300">
                                aria-label
                            </code>{" "}
                            and a{" "}
                            <code class="font-mono text-[12px] text-nebula-300">
                                Tooltip
                            </code>
                            .
                        </li>
                        <li>
                            Match icon color to the surrounding text by
                            default; reach for tone (
                            <span class="text-starlight-300">starlight</span>,{" "}
                            <span class="text-nebula-300">nebula</span>,{" "}
                            <span class="text-flare-400">flare</span>) only
                            when the icon carries the meaning.
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    ),
};
