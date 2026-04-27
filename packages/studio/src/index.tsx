import { QueryClientProvider } from "@tanstack/solid-query";
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import "./style.css";
import { queryClient } from "@/lib/query-client";
import { installWailsDevMock } from "@/lib/wails";
import { ProvidersLayout } from "@/layouts/providers";
import { HomePage } from "@/pages/home";
import { ThreadPage } from "@/pages/thread";
import { WorkspacePage } from "@/pages/workspace";

installWailsDevMock();

render(
    () => (
        <QueryClientProvider client={queryClient}>
            <Router root={ProvidersLayout}>
                <Route
                    path="/"
                    component={HomePage}
                />
                <Route
                    path="/w/:workspaceId"
                    component={WorkspacePage}
                />
                <Route
                    path="/w/:workspaceId/t/:threadId"
                    component={ThreadPage}
                />
                <Route
                    path="/settings"
                    component={SettingsStubPage}
                />
                <Route
                    path="*"
                    component={NotFoundPage}
                />
            </Router>
        </QueryClientProvider>
    ),
    document.getElementById("root")!,
);

function SettingsStubPage() {
    return (
        <div class="flex min-h-0 min-w-0 flex-1 items-center justify-center p-8 text-center text-void-400">
            <div>
                <p class="text-[13px]">Global settings — coming soon.</p>
            </div>
        </div>
    );
}

function NotFoundPage() {
    return (
        <div class="flex min-h-0 min-w-0 flex-1 items-center justify-center p-8 text-center text-void-400">
            <div>
                <p class="text-[13px]">Nothing here.</p>
            </div>
        </div>
    );
}
