import type { Preview } from "storybook-solidjs-vite";
import { create } from "storybook/theming/create";
import "../src/style.css";
import "./preview.css";

/** Docs UI theme: force dark (not `themes.normal` / system) and align with app surfaces from `src/style.css` @theme. */
const docsTheme = create({
    base: "dark",
    appBg: "rgb(8 12 10)",
    appContentBg: "rgb(8 12 10)",
    appPreviewBg: "rgb(12 17 15)",
    appHoverBg: "rgb(18 24 21)",
    appBorderColor: "rgba(42 52 47 / 0.45)",
    textColor: "rgb(203 210 206)",
    textMutedColor: "rgb(131 144 137)",
    barBg: "rgb(12 17 15)",
    barTextColor: "rgb(131 144 137)",
    inputBg: "rgb(16 22 19)",
    inputBorder: "rgba(42 52 47 / 0.5)",
    inputTextColor: "rgb(203 210 206)",
    buttonBg: "rgb(16 22 19)",
});

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        docs: {
            theme: docsTheme,
            /**
             * Inline docs embed stories in the MDX flow. `position: fixed` (dialog overlays)
             * then resolves against a transformed/clipped wrapper, so modal previews often
             * disappear on Docs while Canvas is fine. Iframe stories match Canvas behavior.
             *
             * @see https://storybook.js.org/docs/api/doc-blocks/doc-block-story — `inline`, `height`
             */
            story: {
                inline: false,
                height: "520px",
            },
        },
    },
};

export default preview;
