import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { DiffViewer } from "./diff-viewer";

const meta = {
    title: "Review/DiffViewer",
    parameters: { layout: "fullscreen" },
    tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const original = `export function greet(name: string) {
  return "Hello, " + name;
}
`;

const modified = `export function greet(name: string) {
  return \`Hello, \${name}\`;
}
`;

export const TypeScriptDiff: Story = {
    render: () => (
        <div class="h-[min(480px,70vh)] w-full min-w-[320px] bg-slate-950 p-4">
            <DiffViewer
                original={original}
                modified={modified}
                language="typescript"
                path="src/greet.ts"
            />
        </div>
    ),
};
