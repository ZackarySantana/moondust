import type { Meta, StoryObj } from "storybook-solidjs-vite";
import type { SectionTone } from "./collapsible-section";
import { CollapsibleSection } from "./collapsible-section";

const tones: SectionTone[] = ["emerald", "amber", "sky", "violet", "slate"];

const meta = {
    title: "Review/CollapsibleSection",
    component: CollapsibleSection,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof CollapsibleSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenWithItems: Story = {
    render: () => (
        <div class="max-w-md">
            <CollapsibleSection
                title="Changed files"
                count={3}
                tone="emerald"
                defaultOpen
            >
                <p class="text-xs text-slate-400">
                    File diff rows would render here.
                </p>
            </CollapsibleSection>
        </div>
    ),
};

export const CollapsedEmpty: Story = {
    render: () => (
        <div class="max-w-md">
            <CollapsibleSection
                title="Commits"
                count={0}
                tone="slate"
                defaultOpen={false}
            >
                <p class="text-xs text-slate-500">No commits.</p>
            </CollapsibleSection>
        </div>
    ),
};

export const AllTones: Story = {
    render: () => (
        <div class="max-w-md space-y-2">
            {tones.map((tone) => (
                <CollapsibleSection
                    title={`Section (${tone})`}
                    count={tone === "slate" ? 0 : 2}
                    tone={tone}
                    defaultOpen={tone !== "slate"}
                >
                    <p class="text-xs text-slate-400">Content for {tone}.</p>
                </CollapsibleSection>
            ))}
        </div>
    ),
};
