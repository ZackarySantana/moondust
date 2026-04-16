import type { Component } from "solid-js";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FieldRow, Section } from "@/components/settings-form";
import { useProjectSettings } from "./layout";

export const ProjectGitPage: Component = () => {
    const { markDirty, fields } = useProjectSettings();

    function handleInput(setter: (v: string) => void) {
        return (e: InputEvent & { currentTarget: HTMLInputElement }) => {
            setter(e.currentTarget.value);
            markDirty();
        };
    }

    return (
        <Section
            title="Git"
            description="Default branch and fetch behavior for this project repository."
        >
            <FieldRow
                id="proj-git-default-branch"
                label="Default branch"
                value={fields.defaultBranch()}
                placeholder="origin/main"
                description="Required. The remote ref for the main line of development (e.g. origin/main or origin/master). Must contain a '/'."
                onInput={handleInput(fields.setDefaultBranch)}
            />
            <div class="grid grid-cols-[11rem_1fr] items-start gap-4">
                <Label
                    for="proj-auto-fetch"
                    class="mb-0 pt-2 text-right text-[13px] text-slate-400"
                >
                    Auto-fetch
                </Label>
                <div class="space-y-1">
                    <Select
                        id="proj-auto-fetch"
                        value={fields.autoFetch()}
                        onChange={(e) => {
                            fields.setAutoFetch(e.currentTarget.value);
                            markDirty();
                        }}
                    >
                        <option value="off">Never</option>
                        <option value="new_thread">
                            When creating a thread
                        </option>
                        <option value="fork">When forking a thread</option>
                        <option value="both">
                            When creating or forking a thread
                        </option>
                    </Select>
                    <p class="text-xs text-slate-600">
                        Runs{" "}
                        <span class="font-mono text-slate-500">
                            git fetch origin
                        </span>{" "}
                        in the project folder before the operation (updates
                        remote refs; does not merge or pull into your working
                        tree).
                    </p>
                </div>
            </div>
        </Section>
    );
};
