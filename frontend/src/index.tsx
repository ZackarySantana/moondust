import { QueryClientProvider } from "@tanstack/solid-query";
import { render } from "solid-js/web";
import App from "./App";
import { ChatStreamQuerySync } from "@/lib/chat-stream-query-sync";
import { queryClient } from "@/lib/query-client";
import "./style.css";

render(
    () => (
        <QueryClientProvider client={queryClient}>
            <ChatStreamQuerySync />
            <App />
        </QueryClientProvider>
    ),
    document.getElementById("root")!,
);
