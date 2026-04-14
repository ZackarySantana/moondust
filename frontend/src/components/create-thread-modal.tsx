import type { Component } from "solid-js";
import { CreateThreadPromptView } from "@/components/create-thread-prompt-view";
import type { DefaultWorktreePref } from "@/lib/default-worktree";
import { useCreateThreadModal } from "@/hooks/use-create-thread-modal";

export interface CreateThreadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectID: string;
    /** From settings (`default_worktree`); parent should query GetSettings once (e.g. app shell). */
    defaultWorktreePref: DefaultWorktreePref;
}

export const CreateThreadModal: Component<CreateThreadModalProps> = (props) => {
    const t = useCreateThreadModal({
        open: () => props.open,
        projectID: () => props.projectID,
        defaultWorktreePref: () => props.defaultWorktreePref,
        onOpenChange: props.onOpenChange,
    });

    return (
        <CreateThreadPromptView
            open={props.open}
            phase={t.phase()}
            useWorktree={t.useWorktree()}
            error={t.error()}
            pending={t.createMutation.isPending}
            onWorktreeChange={t.setUseWorktree}
            onConfirm={() => t.submit(t.useWorktree())}
            onCancel={() => props.onOpenChange(false)}
            onOverlayClick={() => {
                if (t.canClose()) props.onOpenChange(false);
            }}
        />
    );
};
