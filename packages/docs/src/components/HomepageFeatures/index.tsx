import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
    title: string;
    Svg: React.ComponentType<React.ComponentProps<"svg">>;
    description: ReactNode;
};

const FeatureList: FeatureItem[] = [
    {
        title: "Your providers",
        Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
        description: (
            <>
                OpenRouter in the app, or drive <strong>Cursor</strong> and{" "}
                <strong>Claude</strong> via their CLIs, plus a separate utility
                model for helpers (commit text, review, Git wizard).
            </>
        ),
    },
    {
        title: "Desktop command center",
        Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
        description: (
            <>
                Workspaces, threads, a full <strong>Git and review sidebar</strong>
                (diffs, graph, branch review), and a terminal, without turning
                Moondust into a second IDE.
            </>
        ),
    },
    {
        title: "Quick launch",
        Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
        description: (
            <>
                <code>bunx moondust</code> or <code>npx moondust</code> runs the
                same launcher and fetches a build for your OS.
            </>
        ),
    },
];

function Feature({ title, Svg, description }: FeatureItem) {
    return (
        <div className={clsx("col col--4")}>
            <div className="text--center">
                <Svg className={styles.featureSvg} role="img" />
            </div>
            <div className="text--center padding-horiz--md">
                <Heading as="h3">{title}</Heading>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default function HomepageFeatures(): ReactNode {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
