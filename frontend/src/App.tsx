import { Navigate, Route, Router } from "@solidjs/router";
import { AppShell } from "@/layouts/app-shell";
import { HomePage } from "@/pages/home";
import { ProjectSettingsPage } from "@/pages/project-settings";
import { SettingsAboutPage } from "@/pages/settings/about";
import { SettingsEnvironmentsPage } from "@/pages/settings/environments";
import { SettingsFeaturesPage } from "@/pages/settings/features";
import { SettingsGitPage } from "@/pages/settings/git";
import { SettingsLayout } from "@/pages/settings/layout";
import { SettingsLogsPage } from "@/pages/settings/logs";
import { SettingsTerminalPage } from "@/pages/settings/terminal";
import { SettingsProjectsPage } from "@/pages/settings/projects";
import { SettingsProvidersPage } from "@/pages/settings/providers";
import { ThreadPage } from "@/pages/thread";

export default function App() {
    return (
        <Router root={AppShell}>
            <Route
                path="/"
                component={HomePage}
            />
            <Route
                path="/project/:id/settings"
                component={ProjectSettingsPage}
            />
            <Route
                path="/project/:projectId/thread/:threadId"
                component={ThreadPage}
            />
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
