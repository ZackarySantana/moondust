import {
    createContext,
    createMemo,
    createSignal,
    useContext,
    type Accessor,
    type ParentComponent,
    type Setter,
} from "solid-js";
import type { ThreadViewId } from "@/lib/shortcuts";

const STORAGE_KEY = "moondust.studio.ui-state.v1";

interface PersistedUIState {
    leftRailWidth: number;
    rightRailWidth: number;
    bottomDockHeight: number;
    contextRailVisible: boolean;
    bottomDockVisible: boolean;
}

const DEFAULTS: PersistedUIState = {
    leftRailWidth: 244,
    rightRailWidth: 320,
    bottomDockHeight: 240,
    contextRailVisible: true,
    bottomDockVisible: false,
};

function readPersisted(): PersistedUIState {
    if (typeof localStorage === "undefined") return { ...DEFAULTS };
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...DEFAULTS };
        const parsed = JSON.parse(raw) as Partial<PersistedUIState>;
        return { ...DEFAULTS, ...parsed };
    } catch {
        return { ...DEFAULTS };
    }
}

function writePersisted(value: PersistedUIState) {
    if (typeof localStorage === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
        // ignore quota / private mode errors
    }
}

export type FocusRegion = "rail" | "main" | "context" | "dock";

export interface UIStateContextValue {
    leftRailWidth: Accessor<number>;
    setLeftRailWidth: Setter<number>;

    rightRailWidth: Accessor<number>;
    setRightRailWidth: Setter<number>;

    bottomDockHeight: Accessor<number>;
    setBottomDockHeight: Setter<number>;

    contextRailVisible: Accessor<boolean>;
    toggleContextRail: () => void;
    setContextRailVisible: Setter<boolean>;

    bottomDockVisible: Accessor<boolean>;
    toggleBottomDock: () => void;
    setBottomDockVisible: Setter<boolean>;

    activeView: Accessor<ThreadViewId>;
    setActiveView: Setter<ThreadViewId>;

    commandPaletteOpen: Accessor<boolean>;
    openCommandPalette: () => void;
    closeCommandPalette: () => void;

    focusRegion: Accessor<FocusRegion>;
    setFocusRegion: Setter<FocusRegion>;
    cycleFocusRegion: () => void;

    /** Latest persisted snapshot for debugging / cheatsheet rendering. */
    snapshot: Accessor<PersistedUIState>;
}

const UIStateContext = createContext<UIStateContextValue>();

const FOCUS_ORDER: FocusRegion[] = ["rail", "main", "context", "dock"];

export const UIStateProvider: ParentComponent = (props) => {
    const initial = readPersisted();

    const [leftRailWidth, setLeftRailWidth] = createSignal(
        initial.leftRailWidth,
    );
    const [rightRailWidth, setRightRailWidth] = createSignal(
        initial.rightRailWidth,
    );
    const [bottomDockHeight, setBottomDockHeight] = createSignal(
        initial.bottomDockHeight,
    );
    const [contextRailVisible, setContextRailVisible] = createSignal(
        initial.contextRailVisible,
    );
    const [bottomDockVisible, setBottomDockVisible] = createSignal(
        initial.bottomDockVisible,
    );
    const [activeView, setActiveView] = createSignal<ThreadViewId>("chat");
    const [commandPaletteOpen, setCommandPaletteOpen] = createSignal(false);
    const [focusRegion, setFocusRegion] = createSignal<FocusRegion>("main");

    const snapshot = createMemo<PersistedUIState>(() => ({
        leftRailWidth: leftRailWidth(),
        rightRailWidth: rightRailWidth(),
        bottomDockHeight: bottomDockHeight(),
        contextRailVisible: contextRailVisible(),
        bottomDockVisible: bottomDockVisible(),
    }));

    let persistFrame = 0;
    const persistAfterTick = () => {
        if (persistFrame) cancelAnimationFrame(persistFrame);
        persistFrame = requestAnimationFrame(() => {
            writePersisted(snapshot());
            persistFrame = 0;
        });
    };

    const wrapPersistGetter =
        <T,>(get: Accessor<T>): Accessor<T> =>
        () => {
            const v = get();
            persistAfterTick();
            return v;
        };

    void wrapPersistGetter; // (kept for future composition; today we persist on snapshot read below)

    // Persist whenever the memoized snapshot changes.
    createMemo(() => {
        snapshot();
        persistAfterTick();
    });

    const value: UIStateContextValue = {
        leftRailWidth,
        setLeftRailWidth,
        rightRailWidth,
        setRightRailWidth,
        bottomDockHeight,
        setBottomDockHeight,
        contextRailVisible,
        toggleContextRail: () => setContextRailVisible((v) => !v),
        setContextRailVisible,
        bottomDockVisible,
        toggleBottomDock: () => setBottomDockVisible((v) => !v),
        setBottomDockVisible,
        activeView,
        setActiveView,
        commandPaletteOpen,
        openCommandPalette: () => setCommandPaletteOpen(true),
        closeCommandPalette: () => setCommandPaletteOpen(false),
        focusRegion,
        setFocusRegion,
        cycleFocusRegion: () =>
            setFocusRegion((cur) => {
                const idx = FOCUS_ORDER.indexOf(cur);
                return FOCUS_ORDER[(idx + 1) % FOCUS_ORDER.length];
            }),
        snapshot,
    };

    return (
        <UIStateContext.Provider value={value}>
            {props.children}
        </UIStateContext.Provider>
    );
};

export function useUIState(): UIStateContextValue {
    const ctx = useContext(UIStateContext);
    if (!ctx) {
        throw new Error("useUIState must be used inside <UIStateProvider>");
    }
    return ctx;
}
