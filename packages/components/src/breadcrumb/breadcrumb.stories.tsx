import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Breadcrumb } from "./breadcrumb";

const meta = {
    title: "Layout/Breadcrumb",
    component: Breadcrumb,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoSegments: Story = {
    render: () => (
        <Breadcrumb
            segments={[
                { id: "ws", label: "moondust", href: "#" },
                { id: "view", label: "Hub" },
            ]}
        />
    ),
};

export const FourSegments: Story = {
    render: () => (
        <Breadcrumb
            segments={[
                { id: "ws", label: "moondust", href: "#" },
                { id: "thread", label: "Refactor router", href: "#" },
                { id: "view", label: "Chat" },
            ]}
        />
    ),
};

export const WithPickerTrigger: Story = {
    render: () => (
        <Breadcrumb
            segments={[
                {
                    id: "ws",
                    label: "moondust",
                    onClick: () => alert("workspace picker"),
                },
                {
                    id: "thread",
                    label: "Refactor router",
                    onClick: () => alert("thread picker"),
                },
                {
                    id: "view",
                    label: "Chat",
                    onClick: () => alert("view picker"),
                },
            ]}
        />
    ),
};

export const LongLabels: Story = {
    render: () => (
        <div class="max-w-md">
            <Breadcrumb
                segments={[
                    {
                        id: "ws",
                        label: "an-extremely-long-workspace-name-here",
                        href: "#",
                    },
                    {
                        id: "thread",
                        label: "Refactor router and replace floating-ui at the same time",
                        href: "#",
                    },
                    { id: "view", label: "Diff" },
                ]}
            />
        </div>
    ),
};
