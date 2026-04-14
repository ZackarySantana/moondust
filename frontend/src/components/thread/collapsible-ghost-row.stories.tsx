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
            Tool calls (3)
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
                <div class="rounded border border-slate-800/50 bg-slate-950/40 px-2 py-1.5 font-mono text-[10px] text-slate-400">
                    read_file src/main.go
                </div>
            }
        >
            Tool calls (3)
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
            Thinking…
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
                    <p class="max-w-md text-xs leading-relaxed text-slate-400">
                        Extra content appears when expanded. Toggle the row
                        label to open or close.
                    </p>
                }
            >
                Transcript detail
            </CollapsibleGhostRow>
        );
    },
};
