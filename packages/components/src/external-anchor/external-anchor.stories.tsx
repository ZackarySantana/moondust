import { createSignal, type JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import ExternalLink from "lucide-solid/icons/external-link";
import { ExternalAnchor } from "./external-anchor";

const meta = {
    title: "Navigation/ExternalAnchor",
    component: ExternalAnchor,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof ExternalAnchor>;

export default meta;
type Story = StoryObj<typeof meta>;

const Row = (props: { label: string; children: JSX.Element }) => (
    <div class="grid grid-cols-[110px_1fr] items-start gap-6">
        <span class="pt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
            {props.label}
        </span>
        <div>{props.children}</div>
    </div>
);

const Frame = (props: { children: JSX.Element }) => (
    <div class="min-w-3xl bg-void-950 p-10">
        <div class="space-y-6">{props.children}</div>
    </div>
);

const linkClass =
    "text-starlight-300 underline-offset-4 transition-colors duration-100 hover:text-starlight-200 hover:underline";

export const Plain: Story = {
    render: () => (
        <p class="text-sm text-void-300">
            Read the{" "}
            <ExternalAnchor
                href="https://docs.moondust.pro"
                class={linkClass}
            >
                Moondust docs
            </ExternalAnchor>{" "}
            for more info.
        </p>
    ),
};

export const Variants: Story = {
    render: () => (
        <Frame>
            <Row label="default">
                <p class="text-sm text-void-300">
                    Read the{" "}
                    <ExternalAnchor
                        href="https://docs.moondust.pro"
                        class={linkClass}
                    >
                        Moondust docs
                    </ExternalAnchor>{" "}
                    for more info.
                </p>
            </Row>
            <Row label="with icon">
                <p class="text-sm text-void-300">
                    Sign in with your{" "}
                    <ExternalAnchor
                        href="https://github.com"
                        class={`inline-flex items-center gap-1 ${linkClass}`}
                    >
                        GitHub account
                        <ExternalLink size={12} />
                    </ExternalAnchor>
                    .
                </p>
            </Row>
            <Row label="muted">
                <p class="text-sm text-void-300">
                    Source available on{" "}
                    <ExternalAnchor
                        href="https://github.com/moondust-pro/moondust"
                        class="text-void-300 underline-offset-4 transition-colors duration-100 hover:text-void-100 hover:underline"
                    >
                        GitHub
                    </ExternalAnchor>
                    .
                </p>
            </Row>
            <Row label="standalone">
                <ExternalAnchor
                    href="https://moondust.pro/changelog"
                    class={`inline-flex items-center gap-1.5 ${linkClass}`}
                >
                    Read the changelog
                    <ExternalLink size={12} />
                </ExternalAnchor>
            </Row>
        </Frame>
    ),
};

export const InProse: Story = {
    render: () => (
        <Frame>
            <Row label="paragraph">
                <p class="max-w-prose text-sm leading-relaxed text-void-200">
                    Moondust integrates with{" "}
                    <ExternalAnchor
                        href="https://openrouter.ai"
                        class={linkClass}
                    >
                        OpenRouter
                    </ExternalAnchor>
                    ,{" "}
                    <ExternalAnchor
                        href="https://www.anthropic.com/claude"
                        class={linkClass}
                    >
                        Claude
                    </ExternalAnchor>
                    , and{" "}
                    <ExternalAnchor
                        href="https://openai.com"
                        class={linkClass}
                    >
                        OpenAI
                    </ExternalAnchor>
                    . Each integration is configured under Settings.
                </p>
            </Row>
            <Row label="footnote">
                <p class="max-w-prose text-xs text-void-500">
                    By signing in you agree to our{" "}
                    <ExternalAnchor
                        href="https://moondust.pro/terms"
                        class="text-void-400 underline-offset-4 hover:text-void-200 hover:underline"
                    >
                        terms of service
                    </ExternalAnchor>{" "}
                    and{" "}
                    <ExternalAnchor
                        href="https://moondust.pro/privacy"
                        class="text-void-400 underline-offset-4 hover:text-void-200 hover:underline"
                    >
                        privacy policy
                    </ExternalAnchor>
                    .
                </p>
            </Row>
        </Frame>
    ),
};

export const WithExternalHandler: Story = {
    render: () => {
        const [last, setLast] = createSignal<string | null>(null);
        return (
            <Frame>
                <Row label="callback">
                    <div class="space-y-2 text-sm text-void-300">
                        <p>
                            Click{" "}
                            <ExternalAnchor
                                href="https://github.com/moondust-pro/moondust"
                                class={linkClass}
                                onOpenExternal={(href) => setLast(href)}
                            >
                                GitHub
                            </ExternalAnchor>{" "}
                            to simulate opening in the system browser.
                        </p>
                        <p class="font-mono text-[11px] text-void-500">
                            Last opened: {last() ?? "never"}
                        </p>
                    </div>
                </Row>
                <Row label="rationale">
                    <p class="max-w-md text-xs leading-relaxed text-void-400">
                        In Wails, Tauri, and Electron embeds, the embedded
                        webview should not navigate. Pass{" "}
                        <code class="text-[12px] text-void-200">
                            onOpenExternal
                        </code>{" "}
                        to route the click through the host shell instead.
                    </p>
                </Row>
            </Frame>
        );
    },
};

export const InContext: Story = {
    parameters: { layout: "padded" },
    render: () => (
        <div class="min-h-screen bg-void-950 p-10">
            <div class="mx-auto max-w-2xl border border-void-700 bg-void-900 p-6">
                <p class="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-starlight-400">
                    about
                </p>
                <h1 class="text-2xl font-semibold tracking-tight text-void-50">
                    Moondust
                </h1>
                <p class="mt-2 text-sm text-void-400">
                    Version{" "}
                    <code class="text-[12px] text-nebula-300">2.1.0</code> ·
                    Apr 25, 2026
                </p>

                <div class="mt-6 space-y-3 text-sm leading-relaxed text-void-200">
                    <p>
                        Moondust is a desktop client for AI coding assistants.
                        Source on{" "}
                        <ExternalAnchor
                            href="https://github.com/moondust-pro/moondust"
                            class={`inline-flex items-center gap-1 ${linkClass}`}
                        >
                            GitHub
                            <ExternalLink size={12} />
                        </ExternalAnchor>
                        , issue tracker on{" "}
                        <ExternalAnchor
                            href="https://linear.app/moondust"
                            class={`inline-flex items-center gap-1 ${linkClass}`}
                        >
                            Linear
                            <ExternalLink size={12} />
                        </ExternalAnchor>
                        .
                    </p>
                    <p class="text-void-400">
                        Documentation, integrations, and release notes live on
                        the{" "}
                        <ExternalAnchor
                            href="https://docs.moondust.pro"
                            class={`inline-flex items-center gap-1 ${linkClass}`}
                        >
                            docs site
                            <ExternalLink size={12} />
                        </ExternalAnchor>
                        .
                    </p>
                </div>

                <div class="mt-6 grid grid-cols-2 gap-px border border-void-700 bg-void-700 text-sm">
                    <ExternalAnchor
                        href="https://moondust.pro/changelog"
                        class="bg-void-900 px-4 py-3 text-void-200 transition-colors duration-100 hover:bg-void-800 hover:text-starlight-300"
                    >
                        Changelog
                    </ExternalAnchor>
                    <ExternalAnchor
                        href="https://moondust.pro/blog"
                        class="bg-void-900 px-4 py-3 text-void-200 transition-colors duration-100 hover:bg-void-800 hover:text-starlight-300"
                    >
                        Blog
                    </ExternalAnchor>
                    <ExternalAnchor
                        href="https://moondust.pro/discord"
                        class="bg-void-900 px-4 py-3 text-void-200 transition-colors duration-100 hover:bg-void-800 hover:text-starlight-300"
                    >
                        Discord
                    </ExternalAnchor>
                    <ExternalAnchor
                        href="https://moondust.pro/sponsor"
                        class="bg-void-900 px-4 py-3 text-void-200 transition-colors duration-100 hover:bg-void-800 hover:text-starlight-300"
                    >
                        Sponsor
                    </ExternalAnchor>
                </div>
            </div>
        </div>
    ),
};
