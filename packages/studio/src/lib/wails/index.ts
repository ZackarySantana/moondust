/**
 * Single import surface for everything that crosses the Wails IPC boundary.
 *
 * - In a real Wails build, the `@wails/*` aliases resolve to the generated
 *   bindings in `packages/wails-app/wailsjs/...` which in turn call into
 *   `window.go.app.*`.
 * - In dev (web preview / Storybook), `installWailsDevMock()` patches
 *   `window.go` with deterministic stub data so the same code paths work.
 */

export { Get as GetProject, List as ListProjects } from "@wails/go/app/Project";
export {
    Get as GetThread,
    List as ListThreads,
    ListByProject as ListThreadsByProject,
    Rename as RenameThread,
} from "@wails/go/app/Thread";

export { store } from "@wails/go/models";

export { installWailsDevMock, isWailsDevMock } from "./dev-mock";
