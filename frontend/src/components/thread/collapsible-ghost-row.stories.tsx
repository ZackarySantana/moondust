import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { CollapsibleGhostRow } from "./collapsible-ghost-row";

const meta = {
    title: "Thread/CollapsibleGhostRow",
    component: CollapsibleGhostRow,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof CollapsibleGhostRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {
    render: () => (
        <CollapsibleGhostRow
            expanded={false}
            onToggle={() => {}}
            ariaLabelExpanded="Collapse tool calls"
            ariaLabelCollapsed="Expand tool calls"
        >
            <span class="text-slate-400">Tool calls (3)</span>
        </CollapsibleGhostRow>
    ),
};

export const Expanded: Story = {
    render: () => (
        <CollapsibleGhostRow
            expanded
            onToggle={() => {}}
            ariaLabelExpanded="Collapse tool calls"
            ariaLabelCollapsed="Expand tool calls"
            body={
                <div class="ml-4 mt-1 rounded-lg border border-slate-800/40 bg-slate-900/30 px-3 py-2 font-mono text-[10px] text-slate-400">
                    read_file src/main.go
                </div>
            }
        >
            <span class="text-slate-400">Tool calls (3)</span>
        </CollapsibleGhostRow>
    ),
};

export const Busy: Story = {
    render: () => (
        <CollapsibleGhostRow
            expanded={false}
            onToggle={() => {}}
            showBusy
            ariaLabelExpanded="Collapse thought"
            ariaLabelCollapsed="Expand thought"
        >
            <span class="text-slate-400">Thinking</span>
        </CollapsibleGhostRow>
    ),
};

export const Interactive: Story = {
    render: () => {
        const [expanded, setExpanded] = createSignal(false);
        return (
            <CollapsibleGhostRow
                expanded={expanded()}
                onToggle={() => setExpanded((e) => !e)}
                ariaLabelExpanded="Collapse details"
                ariaLabelCollapsed="Expand details"
                body={
                    <div class="ml-4 mt-1 rounded-lg border border-slate-800/40 bg-slate-900/30 px-3 py-2">
                        <p class="max-w-md text-xs leading-relaxed text-slate-400">
                            Extra content appears when expanded. Toggle the row
                            label to open or close.
                        </p>
                    </div>
                }
            >
                <span class="text-slate-400">Transcript detail</span>
            </CollapsibleGhostRow>
        );
    },
};
