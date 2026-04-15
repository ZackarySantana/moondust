/**
 * Stacks Escape handlers so nested modals close in order (topmost first).
 * Uses capture phase so the active modal wins before other handlers.
 */

type Entry = { id: number; onEscape: () => void };

const stack: Entry[] = [];
let nextId = 0;
let listening = false;

function onDocumentKeyDown(e: KeyboardEvent) {
    if (e.key !== "Escape") return;
    const top = stack[stack.length - 1];
    if (!top) return;
    e.preventDefault();
    e.stopPropagation();
    top.onEscape();
}

function ensureListener() {
    if (listening) return;
    document.addEventListener("keydown", onDocumentKeyDown, true);
    listening = true;
}

function syncListener() {
    if (stack.length === 0 && listening) {
        document.removeEventListener("keydown", onDocumentKeyDown, true);
        listening = false;
    }
}

/** Registers an Escape handler while the returned function has not been called. */
export function pushModalEscapeHandler(onEscape: () => void): () => void {
    ensureListener();
    const id = nextId++;
    stack.push({ id, onEscape });
    return () => {
        const i = stack.findIndex((x) => x.id === id);
        if (i >= 0) stack.splice(i, 1);
        syncListener();
    };
}
