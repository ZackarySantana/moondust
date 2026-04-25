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
    if (typeof document === "undefined") return;
    document.addEventListener("keydown", onDocumentKeyDown, true);
    listening = true;
}

function syncListener() {
    if (stack.length === 0 && listening) {
        document.removeEventListener("keydown", onDocumentKeyDown, true);
        listening = false;
    }
}

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
