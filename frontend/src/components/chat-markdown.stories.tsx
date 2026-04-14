import {
    createJSXDecorator,
    type Meta,
    type StoryObj,
} from "storybook-solidjs-vite";
import { ChatMarkdown } from "./chat-markdown";

const assistantPanel = createJSXDecorator((Story) => (
    <div class="max-w-xl rounded-lg border border-slate-800/60 bg-slate-950/50 p-4">
        <Story />
    </div>
));

const userPanel = createJSXDecorator((Story) => (
    <div class="max-w-xl rounded-lg border border-emerald-900/40 bg-emerald-950/30 p-4">
        <Story />
    </div>
));

const sample = `## Summary

- Bullet one
- Bullet two with **bold** and a [link](https://example.com)

\`\`\`ts
const x = 1;
\`\`\`

> A short quote
`;

const meta = {
    title: "Chat/ChatMarkdown",
    component: ChatMarkdown,
    parameters: { layout: "padded" },
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: ["assistant", "user"],
        },
    },
} satisfies Meta<typeof ChatMarkdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Assistant: Story = {
    args: {
        source: sample,
        variant: "assistant",
    },
    decorators: [assistantPanel],
};

export const User: Story = {
    args: {
        source: "Try `inline code` and a [link](https://github.com).",
        variant: "user",
    },
    decorators: [userPanel],
};

export const Empty: Story = {
    args: {
        source: "",
        variant: "assistant",
    },
};
