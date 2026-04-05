import { createSignal } from "solid-js";
import { AppSidebar } from "@/components/app-sidebar";
import { CreateProjectModal } from "@/components/create-project-modal";

function App() {
    const [createProjectOpen, setCreateProjectOpen] = createSignal(false);

    return (
        <div class="flex h-full w-full bg-[rgb(20,26,35)] text-slate-200">
            <AppSidebar onNewProject={() => setCreateProjectOpen(true)} />
            <main class="min-w-0 flex-1" />
            <CreateProjectModal
                open={createProjectOpen()}
                onOpenChange={setCreateProjectOpen}
            />
        </div>
    );
}

export default App;
