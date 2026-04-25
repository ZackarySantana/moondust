import type { RouteSectionProps } from "@solidjs/router";
import type { Component } from "solid-js";

export const AppShell: Component<RouteSectionProps> = (props) => {
    return (
        // <ShortcutProvider>
        //     <CurrentThreadProvider>
        //         <AppShellInner {...props} />
        //     </CurrentThreadProvider>
        // </ShortcutProvider>
        <div>
            App shell
            {props.children}
        </div>
    );
};
