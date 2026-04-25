import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { ExternalAnchor } from "./external-anchor";

const meta = {
    title: "Navigation/ExternalAnchor",
    component: ExternalAnchor,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
} satisfies Meta<typeof ExternalAnchor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = {
    render: () => (
        <p class="text-sm text-slate-300">
            Read the{" "}
            <ExternalAnchor
                href="https://docs.moondust.pro"
                class="text-emerald-400 underline-offset-4 hover:underline"
            >
                Moondust docs
            </ExternalAnchor>{" "}
            for more info.
        </p>
    ),
};

export const WithExternalHandler: Story = {
    render: () => {
        const [last, setLast] = createSignal<string | null>(null);
        return (
            <div class="space-y-3 text-sm text-slate-300">
                <p>
                    Click{" "}
                    <ExternalAnchor
                        href="https://github.com/moondust-pro/moondust"
                        class="text-emerald-400 underline-offset-4 hover:underline"
                        onOpenExternal={(href) => setLast(href)}
                    >
                        GitHub
                    </ExternalAnchor>{" "}
                    to simulate opening in the system browser.
                </p>
                <p class="text-xs text-slate-500">
                    Last opened: {last() ?? "—"}
                </p>
            </div>
        );
    },
};

export const InProse: Story = {
    render: () => (
        <p class="max-w-prose text-sm leading-relaxed text-slate-300">
            Moondust integrates with{" "}
            <ExternalAnchor
                href="https://openrouter.ai"
                class="text-emerald-400 underline-offset-4 hover:underline"
            >
                OpenRouter
            </ExternalAnchor>
            ,{" "}
            <ExternalAnchor
                href="https://www.cursor.com"
                class="text-emerald-400 underline-offset-4 hover:underline"
            >
                Cursor
            </ExternalAnchor>
            , and{" "}
            <ExternalAnchor
                href="https://www.anthropic.com/claude"
                class="text-emerald-400 underline-offset-4 hover:underline"
            >
                Claude
            </ExternalAnchor>
            . Each integration is configured under Settings.
        </p>
    ),
};
