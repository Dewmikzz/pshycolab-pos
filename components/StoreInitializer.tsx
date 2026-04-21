"use client";

import { useEffect } from "react";
import { usePosStore } from "@/store/usePosStore";
import { useMenuStore } from "@/store/useMenuStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { seedMenuData } from "@/services/menuService";
import { seedTables } from "@/services/orderService";
import { TABLES } from "@/data/mockData";

export function StoreInitializer() {
    const { initializeSubscription } = usePosStore();
    const { initializeMenuSubscription } = useMenuStore();

    useEffect(() => {
        // Seed tables and menu if Firebase is empty (safe — only writes if nodes don't exist)
        const init = async () => {
            try {
                await seedTables(TABLES);
                await seedMenuData();
            } catch (e) {
                console.error("Auto-seed failed:", e);
            }
        };
        init();

        const unsubPos = initializeSubscription();
        const unsubMenu = initializeMenuSubscription();
        return () => {
            unsubPos();
            unsubMenu();
        };
    }, [initializeSubscription, initializeMenuSubscription]);

    return null;
}

