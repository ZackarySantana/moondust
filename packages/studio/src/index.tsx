import { QueryClientProvider } from "@tanstack/solid-query";
import { render } from "solid-js/web";
import "./style.css";
import { queryClient } from "./lib/query-client";
import { Button } from "@moondust/components";

// import { CancelCreateProject } from "@moondust/wails-app/app";
// await CancelCreateProject();

import { List } from "@moondust/wails-app/project";

try {
    let projects = await List();
    console.log(projects);
} catch (error) {
    console.error(error);
}

render(
    () => (
        <QueryClientProvider client={queryClient}>
            <div>Hello World</div>
            <Button>Click me</Button>
        </QueryClientProvider>
    ),
    document.getElementById("root")!,
);
