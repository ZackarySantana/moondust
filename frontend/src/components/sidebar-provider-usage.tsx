import { useQuery } from "@tanstack/solid-query";
import ChevronDown from "lucide-solid/icons/chevron-down";
import type { Accessor, Component, JSX } from "solid-js";
import { createSignal, Show } from "solid-js";
import { GetCursorCLIInfo } from "@wails/go/app/App";
import { ExternalAnchor } from "@/components/external-anchor";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/lib/query-client";
import { ClaudeLocalUsageBars } from "@/components/claude-local-usage-bars";
import { UsageBarRow, UsageBarRowLoading } from "@/components/usage-bar-row";
import { useClaudeCliInfo } from "@/hooks/use-claude-cli-info";
import {
    CLAUDE_CODE_INSTALL_URL,
    CLAUDE_LOGIN_COMMAND,
    CLAUDE_NOT_INSTALLED_HINT,
    friendlyClaudeAuthErrorMessage,
} from "@/lib/claude-auth-display";
import type { store } from "@wails/go/models";

const CursorSection: Component<{
    usage: store.CursorUsageSnapshot | undefined;
    loading: boolean;
}> = (props) => {
    return (
        <div class="space-y-2">
            <Show
                when={!props.loading}
                fallback={
                    <>
                        <UsageBarRowLoading
                            label="Auto"
                            fillClass="bg-emerald-600/80"
                        />
                        <UsageBarRowLoading
                            label="API"
                            fillClass="bg-sky-600/75"
                        />
                    </>
                }
            >
                <>
                    <UsageBarRow
                        label="Auto"
                        value={props.usage?.auto_percent_used}
                        fillClass="bg-emerald-600/80"
                    />
                    <UsageBarRow
                        label="API"
                        value={props.usage?.api_percent_used}
                        fillClass="bg-sky-600/75"
                    />
                </>
            </Show>
        </div>
    );
};

const ClaudeSection: Component<{
    loading: boolean;
    info: store.ClaudeCLIInfo | undefined;
}> = (props) => {
    return (
        <div class="space-y-2">
            <Show when={props.loading}>
                <ClaudeLocalUsageBars
                    loading
                    usage={undefined}
                    usageError={undefined}
                />
            </Show>
            <Show when={!props.loading && props.info}>
                {(info) => (
                    <>
                        <Show when={!info().installed}>
                            <p class="text-[10px] leading-snug text-slate-500">
                                <ExternalAnchor
                                    href={CLAUDE_CODE_INSTALL_URL}
                                    class="cursor-pointer text-slate-500 underline-offset-2 hover:text-slate-400 hover:underline"
                                >
                                    {info().probe_error ||
                                        CLAUDE_NOT_INSTALLED_HINT}
                                </ExternalAnchor>
                            </p>
                        </Show>
                        <Show when={info().installed && info().auth_error}>
                            <p class="mb-1 text-[10px] leading-snug text-amber-500/85">
                                {friendlyClaudeAuthErrorMessage(
                                    info().auth_error,
                                )}
                            </p>
                        </Show>
                        <Show
                            when={
                                info().installed &&
                                info().auth != null &&
                                info().auth_error == null &&
                                info().auth?.logged_in === false
                            }
                        >
                            <p class="mb-1 text-[10px] leading-snug text-slate-500">
                                Not signed in. Run{" "}
                                <code class="rounded bg-slate-900/80 px-1 py-0.5 font-mono text-[9px] text-slate-400">
                                    {CLAUDE_LOGIN_COMMAND}
                                </code>{" "}
                                in a terminal.
                            </p>
                        </Show>
                        <Show when={info().installed}>
                            <ClaudeLocalUsageBars
                                loading={false}
                                usage={info().local_usage}
                                usageError={info().local_usage_error}
                                suppressEmptyUsageMessage={
                                    !!(
                                        info().auth_error ||
                                        info().auth?.logged_in === false
                                    )
                                }
                            />
                        </Show>
                    </>
                )}
            </Show>
        </div>
    );
};

const ghostToggleClass =
    "flex w-full cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-left text-[10px] font-medium uppercase tracking-wide text-slate-500/85 transition-colors hover:bg-slate-800/35 hover:text-slate-400";

const CollapsibleUsageSection: Component<{
    title: string;
    expanded: Accessor<boolean>;
    onToggle: () => void;
    sectionClass?: string;
    children: JSX.Element;
}> = (props) => {
    return (
        <div class={cn("space-y-0", props.sectionClass)}>
            <button
                type="button"
                class={ghostToggleClass}
                aria-expanded={props.expanded()}
                aria-controls={`usage-section-${props.title.toLowerCase()}`}
                id={`usage-toggle-${props.title.toLowerCase()}`}
                onClick={() => props.onToggle()}
            >
                <ChevronDown
                    class={cn(
                        "size-3 shrink-0 text-slate-500 transition-transform duration-150",
                        !props.expanded() && "-rotate-90",
                    )}
                    stroke-width={2}
                    aria-hidden
                />
                <span>{props.title}</span>
            </button>
            <Show when={props.expanded()}>
                <div
                    id={`usage-section-${props.title.toLowerCase()}`}
                    class="mt-1.5 space-y-2"
                    role="region"
                    aria-labelledby={`usage-toggle-${props.title.toLowerCase()}`}
                >
                    {props.children}
                </div>
            </Show>
        </div>
    );
};

/** In-flow footer block: Cursor (live usage) + Claude (local JSONL usage). */
export const SidebarProviderUsage: Component = () => {
    const [cursorOpen, setCursorOpen] = createSignal(true);
    const [claudeOpen, setClaudeOpen] = createSignal(true);

    const cursorCliQuery = useQuery(() => ({
        queryKey: queryKeys.cursorCLI,
        queryFn: GetCursorCLIInfo,
        staleTime: 60_000,
    }));

    const { claudeQuery } = useClaudeCliInfo();

    const usageLoading = () => cursorCliQuery.isLoading && !cursorCliQuery.data;

    const claudeLoading = () => claudeQuery.isLoading && !claudeQuery.data;

    /** Probe finished: hide the whole block when `agent` is not on PATH. */
    const hideBecauseCliMissing = () =>
        !cursorCliQuery.isLoading &&
        cursorCliQuery.data != null &&
        cursorCliQuery.data.installed === false;

    return (
        <Show when={!hideBecauseCliMissing()}>
            <div
                class="space-y-1.5 pl-2.5 pr-2"
                aria-label="Provider usage"
                aria-busy={usageLoading() || claudeLoading()}
            >
                <CollapsibleUsageSection
                    title="Cursor"
                    expanded={cursorOpen}
                    onToggle={() => setCursorOpen((v) => !v)}
                >
                    <CursorSection
                        usage={cursorCliQuery.data?.usage}
                        loading={usageLoading()}
                    />
                    <Show when={cursorCliQuery.data?.usage_error}>
                        <p class="text-[10px] leading-snug text-amber-500/85">
                            {cursorCliQuery.data?.usage_error}
                        </p>
                    </Show>
                </CollapsibleUsageSection>

                <CollapsibleUsageSection
                    title="Claude (LOCAL)"
                    expanded={claudeOpen}
                    onToggle={() => setClaudeOpen((v) => !v)}
                    sectionClass="mt-3 border-t border-slate-800/50 pt-3"
                >
                    <ClaudeSection
                        loading={claudeLoading()}
                        info={claudeQuery.data ?? undefined}
                    />
                </CollapsibleUsageSection>
            </div>
        </Show>
    );
};
