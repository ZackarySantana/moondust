import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import {
    CreateProjectFormView,
    type CreateProjectTab,
} from "./create-project-form-view";

const meta = {
    title: "Modals/CreateProjectFormView",
    component: CreateProjectFormView,
    parameters: { layout: "fullscreen" },
    tags: ["autodocs"],
} satisfies Meta<typeof CreateProjectFormView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UrlTab: Story = {
    args: {
        open: true,
        tab: "url",
        urlDraft: "https://github.com/moondust-pro/moondust",
        folderPath: "",
        folderDefaultBranch: "",
        resolvedName: "moondust",
        submitting: false,
        canSubmit: true,
        onTabChange: () => {},
        onUrlDraft: () => {},
        onFolderDefaultBranch: () => {},
        onNameInput: () => {},
        onPickFolder: () => {},
        onSubmit: (e: Event) => e.preventDefault(),
        onCancel: () => {},
    },
};

export const FolderTab: Story = {
    args: {
        open: true,
        tab: "folder",
        urlDraft: "",
        folderPath: "/Users/me/work/moondust",
        folderDefaultBranch: "origin/main",
        resolvedName: "moondust",
        submitting: false,
        canSubmit: true,
        onTabChange: () => {},
        onUrlDraft: () => {},
        onFolderDefaultBranch: () => {},
        onNameInput: () => {},
        onPickFolder: () => {},
        onSubmit: (e: Event) => e.preventDefault(),
        onCancel: () => {},
    },
};

export const Submitting: Story = {
    args: {
        open: true,
        tab: "url",
        urlDraft: "https://github.com/moondust-pro/moondust",
        folderPath: "",
        folderDefaultBranch: "",
        resolvedName: "moondust",
        submitting: true,
        canSubmit: true,
        onTabChange: () => {},
        onUrlDraft: () => {},
        onFolderDefaultBranch: () => {},
        onNameInput: () => {},
        onPickFolder: () => {},
        onSubmit: (e: Event) => e.preventDefault(),
        onCancel: () => {},
    },
};

export const EmptyCannotSubmit: Story = {
    args: {
        open: true,
        tab: "url",
        urlDraft: "",
        folderPath: "",
        folderDefaultBranch: "",
        resolvedName: "",
        submitting: false,
        canSubmit: false,
        onTabChange: () => {},
        onUrlDraft: () => {},
        onFolderDefaultBranch: () => {},
        onNameInput: () => {},
        onPickFolder: () => {},
        onSubmit: (e: Event) => e.preventDefault(),
        onCancel: () => {},
    },
};

export const Interactive: Story = {
    render: () => {
        const [tab, setTab] = createSignal<CreateProjectTab>("url");
        const [url, setUrl] = createSignal("");
        const [folder, setFolder] = createSignal("");
        const [branch, setBranch] = createSignal("origin/main");
        const [name, setName] = createSignal("");

        const canSubmit = () => {
            if (tab() === "url") return url().trim().length > 0;
            return folder().trim().length > 0;
        };

        return (
            <CreateProjectFormView
                open
                tab={tab()}
                urlDraft={url()}
                folderPath={folder()}
                folderDefaultBranch={branch()}
                resolvedName={name() || (url().split("/").pop() ?? "")}
                submitting={false}
                canSubmit={canSubmit()}
                onTabChange={setTab}
                onUrlDraft={setUrl}
                onFolderDefaultBranch={setBranch}
                onNameInput={(e) => setName(e.currentTarget.value)}
                onPickFolder={() =>
                    setFolder("/Users/me/work/picked-from-storybook")
                }
                onSubmit={(e) => e.preventDefault()}
                onCancel={() => {}}
            />
        );
    },
};
