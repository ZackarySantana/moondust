import { createMemoryHistory, MemoryRouter, Route } from "@solidjs/router";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal } from "solid-js";
import { ThreadHeader } from "./thread-header";

function memoryAt(path: string) {
    const h = createMemoryHistory();
    h.set({ value: path, replace: true, scroll: false });
    return h;
}

function HeaderDemo() {
    const [editing, setEditing] = createSignal(false);
    const [draft, setDraft] = createSignal("Feature: Storybook");

    return (
        <ThreadHeader
            editingTitle={() => editing()}
            titleDraft={() => draft()}
            setTitleDraft={setDraft}
            threadTitle={() => "Feature: Storybook"}
            projectName={() => "moondust"}
            workingDir={() => "/home/dev/moondust"}
            titleInputRef={() => {}}
            onStartEditTitle={() => {
                setDraft("Feature: Storybook");
                setEditing(true);
            }}
            onCommitTitle={() => {
                setEditing(false);
            }}
            onCancelEditTitle={() => setEditing(false)}
            terminalOpen={() => false}
            onToggleTerminal={() => {}}
            sidebarOpen={() => true}
            onToggleSidebar={() => {}}
            formatKey={(id) =>
                id === "toggle_terminal"
                    ? "⌃`"
                    : id === "toggle_sidebar"
                      ? "⌘⇧G"
                      : "?"
            }
            hasWorktree={() => true}
            threadSettingsHref="/project/demo/thread/t1/settings/general"
            onDeleteThread={async () => {}}
        />
    );
}

const meta = {
    title: "Thread/ThreadHeader",
    parameters: { layout: "fullscreen" },
    tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <MemoryRouter history={memoryAt("/project/demo/thread/t1")}>
            <Route
                path="/project/:projectId/thread/:threadId"
                component={HeaderDemo}
            />
        </MemoryRouter>
    ),
};
