import { QueryClientProvider } from "@tanstack/solid-query";
import { render } from "solid-js/web";
import "./style.css";
import { queryClient } from "./lib/query-client";
import { Button } from "@moondust/components";
import { Route, Router } from "@solidjs/router";
import { AppShell } from "./layouts/app-shell";

// import { List } from "@moondust/wails-app/project";

// try {
//     let projects = await List();
//     console.log(projects);
// } catch (error) {
//     console.error(error);
// }

const HomePage = () => {
    return (
        <>
            <div>Hello World</div>
            <Button>Click me</Button>
        </>
    );
};

render(
    () => (
        <QueryClientProvider client={queryClient}>
            <Router root={AppShell}>
                <Route
                    path="/"
                    component={HomePage}
                />
            </Router>
        </QueryClientProvider>
    ),
    document.getElementById("root")!,
);
