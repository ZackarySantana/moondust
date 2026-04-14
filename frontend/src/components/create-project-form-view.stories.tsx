import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import type { CreateProjectTab } from "@/lib/create-project";
import { CreateProjectFormView } from "./create-project-form-view";

function CreateProjectFormViewDemo(props: { initialTab: CreateProjectTab }) {
    const [open] = createSignal(true);
    const [tab, setTab] = createSignal<CreateProjectTab>(props.initialTab);
    const [urlDraft, setUrlDraft] = createSignal("https://github.com/org/repo");
    const [folderPath, setFolderPath] = createSignal("/home/user/repo");
    const [folderDefaultBranch, setFolderDefaultBranch] = createSignal("main");
    const [resolvedName, setResolvedName] = createSignal("repo");
    const [submitting] = createSignal(false);

    return (
        <CreateProjectFormView
            open={open()}
            tab={tab()}
            urlDraft={urlDraft()}
            folderPath={folderPath()}
            folderDefaultBranch={folderDefaultBranch()}
            resolvedName={resolvedName()}
            submitting={submitting()}
            canSubmit={resolvedName().trim().length > 0}
            onTabChange={setTab}
            onUrlDraft={setUrlDraft}
            onFolderDefaultBranch={setFolderDefaultBranch}
            onNameInput={(e) => setResolvedName(e.currentTarget.value)}
            onPickFolder={() => setFolderPath("/picked/path")}
            onSubmit={(e) => e.preventDefault()}
            onCancel={() => {}}
            setUrlInputRef={() => {}}
        />
    );
}

const meta = {
    title: "Modals/CreateProjectFormView",
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const UrlTab: Story = {
    render: () => <CreateProjectFormViewDemo initialTab="url" />,
};

export const FolderTab: Story = {
    render: () => <CreateProjectFormViewDemo initialTab="folder" />,
};
