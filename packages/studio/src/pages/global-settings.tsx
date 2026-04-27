import { A, Navigate, useLocation, useParams } from "@solidjs/router";
import {
    EmptyState,
    FieldRow,
    Label,
    SaveButton,
    Section,
    Select,
    Text,
    VerticalNav,
    VerticalNavMain,
    VerticalNavRail,
    VerticalNavSplit,
} from "@moondust/components";
import {
    Match,
    Show,
    Switch,
    batch,
    createEffect,
    createMemo,
    createResource,
    createSignal,
    type Component,
} from "solid-js";
import {
    GLOBAL_SETTINGS_FLAT_SECTION_IDS,
    GLOBAL_SETTINGS_NAV,
    type GitSettingsSubsection,
} from "@/lib/global-settings/sections";
import { cn } from "@/lib/cn";
import { GetGlobalSettings, SaveGlobalSettings } from "@/lib/wails";
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
    const location = useLocation();

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

    /** From pathname so the sidebar active state updates with navigation immediately. */
    const activeNavId = createMemo(() => {
        const path = location.pathname;
        if (path.startsWith("/settings/git")) return "git";
        const m = path.match(/^\/settings\/([^/]+)$/);
        if (m) {
            const seg = m[1];
            if (GLOBAL_SETTINGS_FLAT_SECTION_IDS.has(seg)) return seg;
        }
        if (path === "/settings" || path === "/settings/") return "general";
        return "general";
    });

    const [newThreadWorktree, setNewThreadWorktree] = createSignal<
        "always" | "ask" | "never"
    >("always");
    const [sshAuthSock, setSshAuthSock] = createSignal("");
    const [utilityProvider, setUtilityProvider] = createSignal("openrouter");
    const [initialWt, setInitialWt] = createSignal<"always" | "ask" | "never">(
        "always",
    );
    const [initialSsh, setInitialSsh] = createSignal("");
    const [savePending, setSavePending] = createSignal(false);
    const [saveError, setSaveError] = createSignal<string | null>(null);

    const [gitSettings] = createResource(
        () => activeNavId() === "git",
        async (isGit) => {
            if (!isGit) return null;
            return GetGlobalSettings();
        },
    );

    createEffect(() => {
        if (activeNavId() !== "git") return;
        const d = gitSettings();
        if (d == null) return;
        const wt = worktreeFromStore(d.DefaultWorktree);
        const ssh = d.SSHAuthsocket ?? "";
        const util = d.UtilityProvider ?? "openrouter";
        batch(() => {
            setNewThreadWorktree(wt);
            setSshAuthSock(ssh);
            setUtilityProvider(util);
            setInitialWt(wt);
            setInitialSsh(ssh);
            setSaveError(null);
        });
    });

    const gitDirty = createMemo(() => {
        if (activeNavId() !== "git") return false;
        if (gitSettings.loading) return false;
        const d = gitSettings();
        if (d == null) return false;
        return (
            newThreadWorktree() !== initialWt() ||
            sshAuthSock() !== initialSsh()
        );
    });

    async function saveGitSettings() {
        setSaveError(null);
        setSavePending(true);
        try {
            await SaveGlobalSettings({
                SSHAuthsocket: sshAuthSock(),
                DefaultWorktree: worktreeToStore(newThreadWorktree()),
                UtilityProvider: utilityProvider(),
            });
            batch(() => {
                setInitialWt(newThreadWorktree());
                setInitialSsh(sshAuthSock());
            });
        } catch (e) {
            const msg =
                e instanceof Error ? e.message : "Could not save settings.";
            setSaveError(msg);
        } finally {
            setSavePending(false);
        }
    }

    const gitNavLinkClass = (tab: GitSettingsSubsection) => {
        const v = view();
        const on = v?.kind === "git" && v.tab === tab;
        return cn(
            "flex w-full items-center rounded-md border-l-2 py-2 pr-2 pl-3 text-left text-[13px] font-medium no-underline transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-starlight-400/60",
            on
                ? "border-starlight-400 bg-void-800/90 text-void-50"
                : "border-transparent text-void-400 hover:bg-void-800/55 hover:text-void-100",
        );
    };

    const gitFormDisabled = () => gitSettings.loading || !!gitSettings.error;

    return (
        <Show
            when={view()}
            fallback={<Navigate href={paths.globalSettings()} />}
        >
            <div class="min-h-0 min-w-0 flex-1 overflow-y-auto">
                <div class="mx-auto max-w-5xl px-8 py-10">
                    <header class="mb-8 flex flex-col gap-2">
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

                    <VerticalNavSplit>
                        <VerticalNavRail>
                            <VerticalNav
                                embedded
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
                        </VerticalNavRail>
                        <VerticalNavMain>
                            <Switch>
                            <Match when={view()!.kind === "git"}>
                                <VerticalNavSplit class="gap-10">
                                    <VerticalNavRail class="lg:w-44">
                                        <nav
                                            class="flex flex-col gap-0.5"
                                            aria-label="Git settings"
                                        >
                                            <A
                                                href={paths.globalSettingsGit(
                                                    "worktrees",
                                                )}
                                                class={gitNavLinkClass(
                                                    "worktrees",
                                                )}
                                                end
                                                inactiveClass=""
                                                activeClass=""
                                            >
                                                Worktrees
                                            </A>
                                            <A
                                                href={paths.globalSettingsGit(
                                                    "authentication",
                                                )}
                                                class={gitNavLinkClass(
                                                    "authentication",
                                                )}
                                                end
                                                inactiveClass=""
                                                activeClass=""
                                            >
                                                Authentication
                                            </A>
                                        </nav>
                                    </VerticalNavRail>
                                    <VerticalNavMain class="space-y-6">
                                        <div class="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end">
                                            <Show when={saveError()}>
                                                {(msg) => (
                                                    <p class="max-w-md text-right text-[13px] text-red-400">
                                                        {msg()}
                                                    </p>
                                                )}
                                            </Show>
                                            <SaveButton
                                                dirty={gitDirty()}
                                                isPending={savePending()}
                                                onClick={() =>
                                                    void saveGitSettings()
                                                }
                                                disabled={gitFormDisabled()}
                                            />
                                        </div>
                                        <Show when={gitSettings.error}>
                                            <p class="text-[13px] text-red-400">
                                                Could not load Git settings.
                                            </p>
                                        </Show>
                                        <Show
                                            when={
                                                gitSettings.loading &&
                                                activeNavId() === "git"
                                            }
                                        >
                                            <p class="text-[13px] text-void-400">
                                                Loading…
                                            </p>
                                        </Show>
                                        <Switch>
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
                                                                disabled={gitFormDisabled()}
                                                                onChange={(e) =>
                                                                    setNewThreadWorktree(
                                                                        e
                                                                            .currentTarget
                                                                            .value as
                                                                            | "always"
                                                                            | "ask"
                                                                            | "never",
                                                                    )
                                                                }
                                                            >
                                                                <option value="always">
                                                                    Always use
                                                                    worktree
                                                                </option>
                                                                <option value="ask">
                                                                    Ask every
                                                                    time
                                                                </option>
                                                                <option value="never">
                                                                    Never use
                                                                    worktree
                                                                </option>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </Section>
                                            </Match>
                                            <Match
                                                when={
                                                    view()!.kind === "git" &&
                                                    view()!.tab ===
                                                        "authentication"
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
                                                        disabled={gitFormDisabled()}
                                                        onInput={(e) =>
                                                            setSshAuthSock(
                                                                e.currentTarget
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </Section>
                                            </Match>
                                        </Switch>
                                    </VerticalNavMain>
                                </VerticalNavSplit>
                            </Match>
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
                            </Switch>
                        </VerticalNavMain>
                    </VerticalNavSplit>
                </div>
            </div>
        </Show>
    );
};

function worktreeFromStore(v: string | undefined): "always" | "ask" | "never" {
    switch (String(v ?? "on").toLowerCase()) {
        case "off":
            return "never";
        case "ask":
            return "ask";
        default:
            return "always";
    }
}

function worktreeToStore(u: "always" | "ask" | "never"): string {
    if (u === "never") return "off";
    if (u === "ask") return "ask";
    return "on";
}

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
