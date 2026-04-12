import { Navigate, Route, Router } from "@solidjs/router";
import { AppShell } from "@/layouts/app-shell";
import { HomePage } from "@/pages/home";
import { ProjectSettingsLayout } from "@/pages/project-settings/layout";
import { ProjectGeneralPage } from "@/pages/project-settings/general";
import { ProjectGitPage } from "@/pages/project-settings/git";
import { ProjectAgentPage } from "@/pages/project-settings/agent";
import { ProjectEnvironmentPage } from "@/pages/project-settings/environment";
import { ProjectDangerPage } from "@/pages/project-settings/danger";
import { SettingsAboutPage } from "@/pages/settings/about";
import { SettingsEnvironmentsPage } from "@/pages/settings/environments";
import { SettingsFeaturesPage } from "@/pages/settings/features";
import { SettingsGitPage } from "@/pages/settings/git";
import { SettingsLayout } from "@/pages/settings/layout";
import { SettingsLogsPage } from "@/pages/settings/logs";
import { SettingsNotificationsPage } from "@/pages/settings/notifications";
import { SettingsTerminalPage } from "@/pages/settings/terminal";
import { SettingsProjectsPage } from "@/pages/settings/projects";
import { SettingsProvidersPage } from "@/pages/settings/providers";
import { SettingsShortcutsPage } from "@/pages/settings/shortcuts";
import { ThreadPage } from "@/pages/thread";

export default function App() {
    return (
        <Router root={AppShell}>
            <Route
                path="/"
                component={HomePage}
            />
            <Route
                path="/project/:projectId/thread/:threadId"
                component={ThreadPage}
            />
            <Route
                path="/project/:id/settings"
                component={ProjectSettingsLayout}
            >
                <Route
                    path="/"
                    component={() => <Navigate href="general" />}
                />
                <Route
                    path="/general"
                    component={ProjectGeneralPage}
                />
                <Route
                    path="/git"
                    component={ProjectGitPage}
                />
                <Route
                    path="/agent"
                    component={ProjectAgentPage}
                />
                <Route
                    path="/environment"
                    component={ProjectEnvironmentPage}
                />
                <Route
                    path="/danger"
                    component={ProjectDangerPage}
                />
            </Route>
            <Route
                path="/settings"
                component={SettingsLayout}
            >
                <Route
                    path="/"
                    component={() => <Navigate href="/settings/projects" />}
                />
                <Route
                    path="/projects"
                    component={SettingsProjectsPage}
                />
                <Route
                    path="/providers"
                    component={SettingsProvidersPage}
                />
                <Route
                    path="/git"
                    component={SettingsGitPage}
                />
                <Route
                    path="/notifications"
                    component={SettingsNotificationsPage}
                />
                <Route
                    path="/shortcuts"
                    component={SettingsShortcutsPage}
                />
                <Route
                    path="/environments"
                    component={SettingsEnvironmentsPage}
                />
                <Route
                    path="/features"
                    component={SettingsFeaturesPage}
                />
                <Route
                    path="/about"
                    component={SettingsAboutPage}
                />
                <Route
                    path="/logs"
                    component={SettingsLogsPage}
                />
                <Route
                    path="/terminal"
                    component={SettingsTerminalPage}
                />
            </Route>
        </Router>
    );
}
