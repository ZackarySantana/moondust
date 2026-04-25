import { createSignal, type JSX } from "solid-js";
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

const Stage = (props: { children: JSX.Element }) => (
    <div class="min-h-screen bg-void-950">
        <div class="border-b border-void-700 bg-void-900 px-6 py-3">
            <div class="flex items-center gap-2">
                <span class="size-1.5 bg-starlight-400" />
                <span class="font-mono text-[11px] uppercase tracking-[0.16em] text-void-300">
                    moondust · projects
                </span>
            </div>
        </div>
        <div class="grid place-items-center px-6 py-12">
            <div class="w-full max-w-md text-center">
                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-void-500">
                    no project selected
                </p>
                <p class="mt-1 text-void-300">
                    Create one to get started.
                </p>
            </div>
        </div>
        {props.children}
    </div>
);

export const UrlTab: Story = {
    render: () => (
        <Stage>
            <CreateProjectFormView
                open
                tab="url"
                urlDraft="https://github.com/moondust-pro/moondust"
                folderPath=""
                folderDefaultBranch=""
                resolvedName="moondust"
                submitting={false}
                canSubmit
                onTabChange={() => {}}
                onUrlDraft={() => {}}
                onFolderDefaultBranch={() => {}}
                onNameInput={() => {}}
                onPickFolder={() => {}}
                onSubmit={(e: Event) => e.preventDefault()}
                onCancel={() => {}}
            />
        </Stage>
    ),
};

export const FolderTab: Story = {
    render: () => (
        <Stage>
            <CreateProjectFormView
                open
                tab="folder"
                urlDraft=""
                folderPath="/Users/me/work/moondust"
                folderDefaultBranch="origin/main"
                resolvedName="moondust"
                submitting={false}
                canSubmit
                onTabChange={() => {}}
                onUrlDraft={() => {}}
                onFolderDefaultBranch={() => {}}
                onNameInput={() => {}}
                onPickFolder={() => {}}
                onSubmit={(e: Event) => e.preventDefault()}
                onCancel={() => {}}
            />
        </Stage>
    ),
};

export const Submitting: Story = {
    render: () => (
        <Stage>
            <CreateProjectFormView
                open
                tab="url"
                urlDraft="https://github.com/moondust-pro/moondust"
                folderPath=""
                folderDefaultBranch=""
                resolvedName="moondust"
                submitting
                canSubmit
                onTabChange={() => {}}
                onUrlDraft={() => {}}
                onFolderDefaultBranch={() => {}}
                onNameInput={() => {}}
                onPickFolder={() => {}}
                onSubmit={(e: Event) => e.preventDefault()}
                onCancel={() => {}}
            />
        </Stage>
    ),
};

export const EmptyCannotSubmit: Story = {
    render: () => (
        <Stage>
            <CreateProjectFormView
                open
                tab="url"
                urlDraft=""
                folderPath=""
                folderDefaultBranch=""
                resolvedName=""
                submitting={false}
                canSubmit={false}
                onTabChange={() => {}}
                onUrlDraft={() => {}}
                onFolderDefaultBranch={() => {}}
                onNameInput={() => {}}
                onPickFolder={() => {}}
                onSubmit={(e: Event) => e.preventDefault()}
                onCancel={() => {}}
            />
        </Stage>
    ),
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
            <Stage>
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
            </Stage>
        );
    },
};
