"use client";

import { useEffect } from "react";
import { usePosStore } from "@/store/usePosStore";
import { useMenuStore } from "@/store/useMenuStore";
import { useSettingsStore } from "@/store/useSettingsStore";

export function StoreInitializer() {
    const { initializeSubscription } = usePosStore();
    const { initializeMenuSubscription } = useMenuStore();

    useEffect(() => {
        const unsubPos = initializeSubscription();
        const unsubMenu = initializeMenuSubscription();
        return () => {
            unsubPos();
            unsubMenu();
        };
    }, [initializeSubscription, initializeMenuSubscription]);

    return null;
}
