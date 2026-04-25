import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { For } from "solid-js";

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
