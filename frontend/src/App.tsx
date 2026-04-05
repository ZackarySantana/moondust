import {
    ArrowUpDown,
    Folder,
    Globe,
    Plus,
    Search,
    Settings,
} from "lucide-solid";
import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import { SelectProjectFolder } from "../wailsjs/go/main/App";

const iconButtonClass =
    "inline-flex cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-1.5 text-slate-300 hover:bg-slate-700/55 hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400/60 focus-visible:outline-offset-2";

const ghostButtonClass =
    "flex w-full cursor-pointer items-center gap-2 rounded-md border border-transparent bg-transparent px-2 py-2 text-left text-sm font-medium text-slate-300 hover:bg-slate-700/45 hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400/60 focus-visible:outline-offset-2";

const addMenuItemClass =
    "flex w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700/55 focus:bg-slate-700/55 focus:outline-none";

function App() {
    const [addMenuOpen, setAddMenuOpen] = createSignal(false);
    let addMenuRoot: HTMLDivElement | undefined;

    function toggleAddMenu(e: MouseEvent) {
        e.stopPropagation();
        setAddMenuOpen((open) => !open);
    }

    async function addProjectFromFolder() {
        setAddMenuOpen(false);
        try {
            const folder = await SelectProjectFolder();
            if (folder) {
                alert(`you opened folder: ${folder}`);
            }
        } catch {
            /* dialog failed */
        }
    }

    createEffect(() => {
        if (!addMenuOpen()) return;

        const onDocPointerDown = (e: PointerEvent) => {
            const t = e.target as Node;
            if (addMenuRoot?.contains(t)) return;
            setAddMenuOpen(false);
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setAddMenuOpen(false);
        };

        const id = window.setTimeout(() => {
            document.addEventListener("pointerdown", onDocPointerDown);
            document.addEventListener("keydown", onKeyDown);
        }, 0);

        onCleanup(() => {
            window.clearTimeout(id);
            document.removeEventListener("pointerdown", onDocPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        });
    });

    return (
        <div class="flex h-full w-full bg-[rgb(20,26,35)] text-slate-200">
            <aside class="flex w-64 shrink-0 flex-col border-r border-slate-700/80 bg-[rgb(24,31,42)]">
                <header class="flex items-center gap-2 border-b border-slate-700/60 px-4 py-3">
                    <h1 class="flex min-w-0 flex-1 items-center gap-2 truncate text-base font-semibold tracking-tight">
                        <Folder
                            class="size-4.5 shrink-0 text-slate-400"
                            stroke-width={2}
                            aria-hidden
                        />
                        <span class="truncate">Projects</span>
                    </h1>
                    <div class="flex shrink-0 items-center gap-0.5">
                        <button
                            type="button"
                            class={iconButtonClass}
                            aria-label="Sort projects"
                        >
                            <ArrowUpDown
                                class="size-4"
                                stroke-width={2}
                            />
                        </button>
                        <div
                            class="relative"
                            ref={(el) => {
                                addMenuRoot = el;
                            }}
                        >
                            <button
                                type="button"
                                class={iconButtonClass}
                                aria-label="New project"
                                aria-expanded={addMenuOpen()}
                                aria-haspopup="true"
                                onClick={toggleAddMenu}
                            >
                                <Plus
                                    class="size-4"
                                    stroke-width={2}
                                />
                            </button>
                            <Show when={addMenuOpen()}>
                                <div
                                    class="absolute top-0 left-full z-50 ml-1 min-w-54 rounded-md border border-slate-700/80 bg-[rgb(28,36,48)] py-1 shadow-lg ring-1 ring-black/20"
                                    role="menu"
                                    aria-label="Add project"
                                >
                                    <button
                                        type="button"
                                        class={addMenuItemClass}
                                        role="menuitem"
                                        onClick={() =>
                                            void addProjectFromFolder()
                                        }
                                    >
                                        <Folder
                                            class="size-4 shrink-0 text-slate-400"
                                            stroke-width={2}
                                            aria-hidden
                                        />
                                        <span>Add project from folder</span>
                                    </button>
                                    <button
                                        type="button"
                                        class={addMenuItemClass}
                                        role="menuitem"
                                        onClick={() => setAddMenuOpen(false)}
                                    >
                                        <Globe
                                            class="size-4 shrink-0 text-slate-400"
                                            stroke-width={2}
                                            aria-hidden
                                        />
                                        <span>Add project from URL</span>
                                    </button>
                                </div>
                            </Show>
                        </div>
                        <button
                            type="button"
                            class={iconButtonClass}
                            aria-label="Search projects"
                        >
                            <Search
                                class="size-4"
                                stroke-width={2}
                            />
                        </button>
                    </div>
                </header>
                <div class="min-h-0 flex-1" />
                <footer class="mt-auto space-y-3 border-t border-slate-700/60 px-4 py-3">
                    <button
                        type="button"
                        class={ghostButtonClass}
                    >
                        <Settings
                            class="size-4 shrink-0"
                            stroke-width={2}
                        />
                        <span>Settings</span>
                    </button>
                    <div class="space-y-1.5">
                        <div class="flex items-baseline gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                            <span>Usage</span>
                            <span class="text-[10px] font-normal normal-case text-slate-600">
                                (40%)
                            </span>
                        </div>
                        <div
                            class="h-2 w-full overflow-hidden rounded-full bg-slate-700/90"
                            role="progressbar"
                            aria-valuenow={40}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        >
                            <div class="h-full w-[40%] rounded-full bg-sky-500/90" />
                        </div>
                    </div>
                </footer>
            </aside>
            <main class="min-w-0 flex-1" />
        </div>
    );
}

export default App;
