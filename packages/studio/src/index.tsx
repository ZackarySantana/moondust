import { QueryClientProvider } from "@tanstack/solid-query";
import { render } from "solid-js/web";
import "./style.css";
import { queryClient } from "./lib/query-client";

render(
    () => (
        <QueryClientProvider client={queryClient}>
            <div>Hello World</div>
        </QueryClientProvider>
    ),
    document.getElementById("root")!,
);
