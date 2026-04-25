import type { Component } from "solid-js";
import { createSignal } from "solid-js";
import { cn } from "../utils";

export interface ResizeHandleProps {
    /** "horizontal" resizes width (drag left/right), "vertical" resizes height (drag up/down) */
    direction: "horizontal" | "vertical";
    onResize: (delta: number) => void;
    class?: string;
}

export const ResizeHandle: Component<ResizeHandleProps> = (props) => {
    const [dragging, setDragging] = createSignal(false);

    function onPointerDown(e: PointerEvent) {
        e.preventDefault();
        setDragging(true);
        const target = e.currentTarget as HTMLElement;
        target.setPointerCapture(e.pointerId);

        let last = props.direction === "vertical" ? e.clientY : e.clientX;

        function onMove(ev: PointerEvent) {
            const current =
                props.direction === "vertical" ? ev.clientY : ev.clientX;
            const delta = last - current;
            if (delta !== 0) {
                props.onResize(delta);
                last = current;
            }
        }

        function onUp() {
            setDragging(false);
            target.removeEventListener("pointermove", onMove);
            target.removeEventListener("pointerup", onUp);
        }

        target.addEventListener("pointermove", onMove);
        target.addEventListener("pointerup", onUp);
    }

    const isVertical = () => props.direction === "vertical";

    return (
        <div
            class={cn(
                "group/handle relative z-10 flex shrink-0 items-center justify-center transition-colors duration-100",
                isVertical()
                    ? "h-1.5 cursor-row-resize"
                    : "w-1.5 cursor-col-resize",
                dragging()
                    ? "bg-starlight-400/25"
                    : "hover:bg-starlight-400/15",
                props.class,
            )}
            onPointerDown={onPointerDown}
        >
            <div
                class={cn(
                    "bg-void-600 transition-colors duration-100 group-hover/handle:bg-starlight-400/70",
                    isVertical() ? "h-0.5 w-8" : "h-8 w-0.5",
                    dragging() && "bg-starlight-400",
                )}
            />
        </div>
    );
};
