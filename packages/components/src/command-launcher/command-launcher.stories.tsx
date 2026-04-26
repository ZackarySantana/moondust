import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { CommandLauncher } from "./command-launcher";

const meta = {
    title: "Layout/CommandLauncher",
    component: CommandLauncher,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof CommandLauncher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <div class="bg-void-900 border border-void-700 max-w-[260px] p-2">
            <CommandLauncher onClick={() => alert("open palette")} />
        </div>
    ),
};

export const CustomPlaceholder: Story = {
    render: () => (
        <div class="bg-void-900 border border-void-700 max-w-[260px] p-2">
            <CommandLauncher
                placeholder="Jump anywhere…"
                shortcut={["⌘", "P"]}
            />
        </div>
    ),
};
