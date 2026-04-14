import type { Component } from "solid-js";
import { CreateProjectFormView } from "@/components/create-project-form-view";
import { useCreateProjectModal } from "@/hooks/use-create-project-modal";

export interface CreateProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated?: () => void;
}

export const CreateProjectModal: Component<CreateProjectModalProps> = (
    props,
) => {
    const m = useCreateProjectModal({
        open: () => props.open,
        onOpenChange: props.onOpenChange,
        onCreated: props.onCreated,
    });

    return (
        <CreateProjectFormView
            open={props.open}
            tab={m.createTab()}
            urlDraft={m.urlDraft()}
            folderPath={m.folderPath()}
            folderDefaultBranch={m.folderDefaultBranch()}
            resolvedName={m.resolvedName()}
            submitting={m.submitting()}
            canSubmit={m.canSubmit()}
            onTabChange={m.onTabChange}
            onUrlDraft={m.setUrlDraft}
            onFolderDefaultBranch={m.setFolderDefaultBranch}
            onNameInput={m.onNameInput}
            onPickFolder={() => void m.pickFolder()}
            onSubmit={(e) => {
                e.preventDefault();
                void m.submitCreateProject();
            }}
            onCancel={() => m.close()}
            setUrlInputRef={m.setUrlInputRef}
        />
    );
};
