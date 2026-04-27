import { A, Navigate, useParams } from "@solidjs/router";
import {
    EmptyState,
    FieldRow,
    Label,
    Section,
    Select,
    Text,
    VerticalNav,
} from "@moondust/components";
import {
    Match,
    Show,
    Switch,
    createMemo,
    createSignal,
    type Component,
} from "solid-js";
import {
    GLOBAL_SETTINGS_FLAT_SECTION_IDS,
    GLOBAL_SETTINGS_NAV,
    type GitSettingsSubsection,
} from "@/lib/global-settings/sections";
import { paths } from "@/lib/workspace";

/** `/settings` → first tab */
export const GlobalSettingsRedirect: Component = () => (
    <Navigate href={paths.globalSettings()} />
);

/** `/settings/git` → default Git tab */
export const GitSettingsRedirect: Component = () => (
    <Navigate href={paths.globalSettingsGit("worktrees")} />
);

export const GlobalSettingsPage: Component = () => {
    const params = useParams<{ section?: string; gitSection?: string }>();

    const view = createMemo(() => {
        const g = params.gitSection;
        if (g === "worktrees" || g === "authentication") {
            return { kind: "git" as const, tab: g };
        }
        const s = params.section;
        if (s && GLOBAL_SETTINGS_FLAT_SECTION_IDS.has(s)) {
            return { kind: "flat" as const, section: s };
        }
        return null;
    });

    const activeNavId = createMemo(() => {
        const v = view();
        if (!v) return "general";
        return v.kind === "git" ? "git" : v.section;
    });

    const [newThreadWorktree, setNewThreadWorktree] = createSignal<
        "always" | "ask" | "never"
    >("ask");
    const [sshAuthSock, setSshAuthSock] = createSignal("");

    return (
        <Show
            when={view()}
            fallback={<Navigate href={paths.globalSettings()} />}
        >
            <div class="flex min-h-0 min-w-0 flex-1">
                <aside class="shrink-0 border-r border-void-700/80 bg-void-900/40 py-8 pl-6 pr-2">
                    <VerticalNav
                        items={GLOBAL_SETTINGS_NAV}
                        baseHref="/settings"
                        activeId={activeNavId()}
                        navLabel="Global settings sections"
                        renderLink={(p) => (
                            <A
                                href={p.href}
                                class={p.class}
                                end
                                inactiveClass=""
                                activeClass=""
                            >
                                {p.children}
                            </A>
                        )}
                    />
                </aside>
                <div class="min-h-0 min-w-0 flex-1 overflow-y-auto">
                    <div class="mx-auto flex max-w-5xl flex-col gap-8 px-8 py-10">
                        <header class="flex flex-col gap-2">
                            <Text variant="eyebrow">Settings</Text>
                            <h1 class="text-2xl font-semibold tracking-tight text-void-50">
                                {view()!.kind === "git"
                                    ? "Git"
                                    : sectionTitle(view()!.section!)}
                            </h1>
                            <p class="text-[13px] text-void-400">
                                {view()!.kind === "git"
                                    ? sectionBlurb("git")
                                    : sectionBlurb(view()!.section!)}
                            </p>
                        </header>

                        <Show when={view()!.kind === "git"}>
                            <GitSubNav
                                active={view()!.tab as GitSettingsSubsection}
                            />
                        </Show>

                        <Switch>
                            <Match
                                when={
                                    view()!.kind === "flat" &&
                                    view()!.section === "general"
                                }
                            >
                                <Section
                                    title="Appearance & behavior"
                                    description="Preferences that apply everywhere in Moondust."
                                >
                                    <FieldRow
                                        id="gs-theme"
                                        label="Theme"
                                        value="System"
                                        description="Follow OS light/dark. Per-theme controls will land with the design system pass."
                                    />
                                    <FieldRow
                                        id="gs-locale"
                                        label="Language"
                                        value="English (US)"
                                        description="Locale for dates and UI copy."
                                    />
                                </Section>
                                <Section
                                    title="Shortcuts"
                                    description="Keyboard bindings are defined in the shortcut registry; user overrides will sync here once settings storage is wired."
                                >
                                    <EmptyState
                                        size="sm"
                                        title="No overrides yet"
                                        description="Open the command palette (⌘K) to see actions. Custom keymaps are coming soon."
                                        bordered
                                    />
                                </Section>
                            </Match>
                            <Match
                                when={
                                    view()!.kind === "flat" &&
                                    view()!.section === "cursor"
                                }
                            >
                                <Section
                                    title="Cursor Agent CLI"
                                    description="Moondust shells out to the Cursor Agent CLI (`agent`) when a thread uses Cursor."
                                >
                                    <FieldRow
                                        id="gs-cursor-path"
                                        label="CLI detection"
                                        value="PATH (auto)"
                                        description="Install from cursor.com/install. The app probes `agent` on startup."
                                    />
                                    <FieldRow
                                        id="gs-cursor-default-model"
                                        label="Default model"
                                        value="From Cursor defaults"
                                        description="Per-thread model picks will stay in the thread composer once the catalog is connected."
                                    />
                                </Section>
                            </Match>
                            <Match
                                when={
                                    view()!.kind === "flat" &&
                                    view()!.section === "claude"
                                }
                            >
                                <Section
                                    title="Claude Code"
                                    description="Anthropic Claude via the Claude Code integration."
                                >
                                    <FieldRow
                                        id="gs-claude-auth"
                                        label="Authentication"
                                        value="Not configured"
                                        description="API keys and `claude` CLI login will be managed here."
                                    />
                                    <FieldRow
                                        id="gs-claude-model"
                                        label="Default model"
                                        value="claude-sonnet-4.6"
                                        description="Matches new thread defaults in the backend; editable once persistence exists."
                                    />
                                </Section>
                            </Match>
                            <Match
                                when={
                                    view()!.kind === "flat" &&
                                    view()!.section === "openrouter"
                                }
                            >
                                <Section
                                    title="OpenRouter"
                                    description="Route requests through OpenRouter for multi-model access."
                                >
                                    <FieldRow
                                        id="gs-or-key"
                                        label="API key"
                                        value=""
                                        placeholder="sk-or-…"
                                        description="Stored securely on disk in a later milestone; this row is a placeholder."
                                    />
                                    <FieldRow
                                        id="gs-or-default"
                                        label="Default model"
                                        value="anthropic/claude-sonnet-4.6"
                                        description="Used when a thread picks OpenRouter without an explicit model."
                                    />
                                </Section>
                            </Match>
                            <Match
                                when={
                                    view()!.kind === "git" &&
                                    view()!.tab === "worktrees"
                                }
                            >
                                <Section
                                    title="Worktrees"
                                    description="How new threads use Git worktrees."
                                >
                                    <div class="grid grid-cols-[11rem_1fr] items-start gap-4">
                                        <Label
                                            for="gs-git-new-thread-default"
                                            class="mb-0 pt-2 text-right text-[13px] text-void-400"
                                        >
                                            New thread default
                                        </Label>
                                        <div class="space-y-1">
                                            <Select
                                                id="gs-git-new-thread-default"
                                                value={newThreadWorktree()}
                                                onChange={(e) =>
                                                    setNewThreadWorktree(
                                                        e.currentTarget
                                                            .value as
                                                            | "always"
                                                            | "ask"
                                                            | "never",
                                                    )
                                                }
                                            >
                                                <option value="always">
                                                    Always use worktree
                                                </option>
                                                <option value="ask">
                                                    Ask every time
                                                </option>
                                                <option value="never">
                                                    Never use worktree
                                                </option>
                                            </Select>
                                        </div>
                                    </div>
                                </Section>
                            </Match>
                            <Match
                                when={
                                    view()!.kind === "git" &&
                                    view()!.tab === "authentication"
                                }
                            >
                                <Section
                                    title="Authentication"
                                    description="Environment used when Moondust runs Git and SSH."
                                >
                                    <FieldRow
                                        id="gs-git-ssh-auth-sock"
                                        label="SSH_AUTH_SOCK"
                                        value={sshAuthSock()}
                                        placeholder=""
                                        description="Path to SSH agent socket, e.g. ~/.1password/agent.sock for 1Password."
                                        onInput={(e) =>
                                            setSshAuthSock(
                                                e.currentTarget.value,
                                            )
                                        }
                                    />
                                </Section>
                            </Match>
                        </Switch>
                    </div>
                </div>
            </div>
        </Show>
    );
};

const GitSubNav: Component<{ active: GitSettingsSubsection }> = (props) => {
    const linkCls = (tab: GitSettingsSubsection) =>
        props.active === tab
            ? "rounded-md px-3 py-1.5 text-[13px] font-medium no-underline transition-colors bg-void-800 text-void-50"
            : "rounded-md px-3 py-1.5 text-[13px] font-medium no-underline transition-colors text-void-400 hover:bg-void-800/60 hover:text-void-100";
    return (
        <nav
            class="flex flex-wrap gap-1 border-b border-void-700 pb-3"
            aria-label="Git settings sections"
        >
            <A
                href={paths.globalSettingsGit("worktrees")}
                class={linkCls("worktrees")}
                end
                inactiveClass=""
                activeClass=""
            >
                Worktrees
            </A>
            <A
                href={paths.globalSettingsGit("authentication")}
                class={linkCls("authentication")}
                end
                inactiveClass=""
                activeClass=""
            >
                Authentication
            </A>
        </nav>
    );
};

function sectionTitle(id: string): string {
    switch (id) {
        case "general":
            return "General";
        case "cursor":
            return "Cursor Agent";
        case "claude":
            return "Claude Code";
        case "openrouter":
            return "OpenRouter";
        case "git":
            return "Git";
        default:
            return "Settings";
    }
}

function sectionBlurb(id: string): string {
    switch (id) {
        case "general":
            return "App-wide preferences and shortcuts.";
        case "cursor":
            return "Configure how Moondust invokes the Cursor Agent CLI.";
        case "claude":
            return "Claude Code credentials and defaults.";
        case "openrouter":
            return "OpenRouter API access and routing defaults.";
        case "git":
            return "Worktrees, SSH, and Git defaults for threads and repos.";
        default:
            return "";
    }
}
