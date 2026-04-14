import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createSignal, onCleanup, onMount } from "solid-js";
import { queryKeys } from "@/lib/query-client";
import {
    ClearOpenRouterAPIKey,
    ConnectOpenRouterOAuth,
    GetSettings,
    SaveSettings,
} from "@wails/go/app/App";
import { store } from "@wails/go/models";
import { EventsOn } from "@wails/runtime/runtime";

const BANNER_MS = 4000;

/**
 * OpenRouter tab: settings query, OAuth event bridge, manual key save, clear key.
 */
export function useOpenRouterSettings() {
    const queryClient = useQueryClient();

    const settingsQuery = useQuery(() => ({
        queryKey: queryKeys.settings,
        queryFn: GetSettings,
    }));

    const [manualKey, setManualKey] = createSignal("");
    const [oauthBusy, setOauthBusy] = createSignal(false);
    const [oauthError, setOauthError] = createSignal("");
    const [banner, setBanner] = createSignal<"saved" | "cleared" | "">("");

    const hasKey = () => !!settingsQuery.data?.has_openrouter_api_key;

    onMount(() => {
        const off = EventsOn("openrouter:oauth", (...args: unknown[]) => {
            setOauthBusy(false);
            const payload = args[0] as { error?: string; status?: string };
            if (payload?.error) {
                setOauthError(payload.error);
                return;
            }
            if (payload?.status === "ok") {
                setOauthError("");
                setBanner("saved");
                void queryClient.invalidateQueries({
                    queryKey: queryKeys.settings,
                });
                setTimeout(() => setBanner(""), BANNER_MS);
            }
        });
        onCleanup(off);
    });

    const saveKeyMutation = useMutation(() => ({
        mutationFn: async () => {
            const current = settingsQuery.data;
            if (!current) return;
            const key = manualKey().trim();
            if (!key) return;
            await SaveSettings(
                new store.Settings({
                    ...current,
                    openrouter_api_key: key,
                }),
            );
        },
        onSuccess: () => {
            setManualKey("");
            setBanner("saved");
            void queryClient.invalidateQueries({
                queryKey: queryKeys.settings,
            });
            setTimeout(() => setBanner(""), BANNER_MS);
        },
    }));

    const clearMutation = useMutation(() => ({
        mutationFn: async () => {
            await ClearOpenRouterAPIKey();
        },
        onSuccess: () => {
            setManualKey("");
            setBanner("cleared");
            void queryClient.invalidateQueries({
                queryKey: queryKeys.settings,
            });
            setTimeout(() => setBanner(""), BANNER_MS);
        },
    }));

    function startOAuth() {
        setOauthError("");
        setOauthBusy(true);
        void ConnectOpenRouterOAuth();
    }

    return {
        manualKey,
        setManualKey,
        oauthBusy,
        oauthError,
        banner,
        hasKey,
        saveKeyMutation,
        clearMutation,
        startOAuth,
    };
}
