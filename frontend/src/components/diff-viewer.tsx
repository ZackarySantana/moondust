import * as monaco from "monaco-editor";
import type { Component } from "solid-js";
import { createEffect, on, onCleanup, onMount } from "solid-js";

self.MonacoEnvironment = {
    getWorker() {
        return new Worker(
            new URL(
                "monaco-editor/esm/vs/editor/editor.worker.js",
                import.meta.url,
            ),
            { type: "module" },
        );
    },
};

export interface DiffNav {
    goNext: () => void;
    goPrev: () => void;
}

export interface DiffViewerProps {
    original: string;
    modified: string;
    language: string;
    path: string;
    sideBySide?: boolean;
    onReady?: (nav: DiffNav) => void;
}

export const DiffViewer: Component<DiffViewerProps> = (props) => {
    let containerRef!: HTMLDivElement;
    let editor: monaco.editor.IStandaloneDiffEditor | undefined;

    const theme: monaco.editor.IStandaloneThemeData = {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
            "editor.background": "#0a0e0c",
            "editor.lineHighlightBackground": "#121815",
            "editorLineNumber.foreground": "#404c46",
            "editorLineNumber.activeForeground": "#5b6a62",
            "diffEditor.insertedTextBackground": "#10b98120",
            "diffEditor.removedTextBackground": "#ef444420",
            "diffEditor.insertedLineBackground": "#10b98110",
            "diffEditor.removedLineBackground": "#ef444410",
            "editorGutter.addedBackground": "#10b98140",
            "editorGutter.deletedBackground": "#ef444440",
            "editorOverviewRuler.addedForeground": "#10b98160",
            "editorOverviewRuler.deletedForeground": "#ef444460",
            "editorOverviewRuler.modifiedForeground": "#f59e0b60",
            "scrollbar.shadow": "#00000000",
            "scrollbarSlider.background": "#2a342f60",
            "scrollbarSlider.hoverBackground": "#2a342f90",
            "scrollbarSlider.activeBackground": "#2a342fb0",
        },
    };

    monaco.editor.defineTheme("moondust", theme);

    onMount(() => {
        const originalModel = monaco.editor.createModel(
            props.original,
            props.language,
        );
        const modifiedModel = monaco.editor.createModel(
            props.modified,
            props.language,
        );

        editor = monaco.editor.createDiffEditor(containerRef, {
            theme: "moondust",
            originalEditable: false,
            readOnly: true,
            renderSideBySide: props.sideBySide ?? true,
            scrollBeyondLastLine: false,
            minimap: { enabled: false },
            lineNumbers: "on",
            glyphMargin: true,
            folding: true,
            renderOverviewRuler: true,
            overviewRulerLanes: 3,
            scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
                useShadows: false,
            },
            fontSize: 12,
            lineHeight: 20,
            fontFamily:
                "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace",
            padding: { top: 8 },
            automaticLayout: true,
            renderMarginRevertIcon: false,
        });

        editor.setModel({ original: originalModel, modified: modifiedModel });

        props.onReady?.({
            goNext: () => editor?.goToDiff("next"),
            goPrev: () => editor?.goToDiff("previous"),
        });
    });

    createEffect(
        on(
            () => [props.original, props.modified, props.language] as const,
            ([original, modified, language]) => {
                if (!editor) return;
                const model = editor.getModel();
                if (model) {
                    monaco.editor.setModelLanguage(model.original, language);
                    monaco.editor.setModelLanguage(model.modified, language);
                    model.original.setValue(original);
                    model.modified.setValue(modified);
                }
            },
        ),
    );

    createEffect(
        on(
            () => props.sideBySide,
            (sbs) => {
                editor?.updateOptions({ renderSideBySide: sbs ?? true });
            },
        ),
    );

    onCleanup(() => {
        const model = editor?.getModel();
        editor?.dispose();
        model?.original.dispose();
        model?.modified.dispose();
    });

    return (
        <div
            ref={containerRef}
            class="h-full w-full overflow-hidden rounded-md border border-slate-800/40"
        />
    );
};
