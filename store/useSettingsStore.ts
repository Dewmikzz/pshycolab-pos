import { create } from "zustand";
import { RestaurantSettings, PrinterSettings } from "@/types";
import { db } from "@/lib/firebase";
import { ref, onValue, update } from "firebase/database";

interface SettingsState {
    restaurant: RestaurantSettings;
    printer: PrinterSettings;
    isLoading: boolean;

    // Print Queue
    printReceiptData: import("@/types").Receipt | null;
    printReceipt: (receipt: import("@/types").Receipt) => void;
    clearPrintQueue: () => void;

    // Actions
    updateRestaurantSettings: (settings: Partial<RestaurantSettings>) => Promise<void>;
    updatePrinterSettings: (settings: Partial<PrinterSettings>) => Promise<void>;
    initializeSettingsSubscription: () => () => void;
}

const DEFAULT_RESTAURANT: RestaurantSettings = {
    name: "Psycho Lab POS",
    address: "123 Tech Street, Digital City",
    phone: "+1 234 567 890",
    footerMessage: "Thank you for dining with us!",
};

const DEFAULT_PRINTER: PrinterSettings = {
    paperWidth: '80mm',
    autoPrint: false,
    printerType: 'browser'
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
    restaurant: DEFAULT_RESTAURANT,
    printer: DEFAULT_PRINTER,
    isLoading: true,
    printReceiptData: null,

    printReceipt: (receipt) => {
        set({ printReceiptData: receipt });
        // Small delay to allow render, then print
        setTimeout(() => {
            window.print();
            set({ printReceiptData: null });
        }, 100);
    },

    clearPrintQueue: () => set({ printReceiptData: null }),

    initializeSettingsSubscription: () => {
        const settingsRef = ref(db, "settings");

        const unsubscribe = onValue(settingsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                set({
                    restaurant: { ...DEFAULT_RESTAURANT, ...data.restaurant },
                    printer: { ...DEFAULT_PRINTER, ...data.printer },
                    isLoading: false
                });
            } else {
                set({ isLoading: false });
            }
        });

        return unsubscribe;
    },

    updateRestaurantSettings: async (newSettings) => {
        const { restaurant } = get();
        const updated = { ...restaurant, ...newSettings };
        // Optimistic update
        set({ restaurant: updated });

        await update(ref(db, "settings/restaurant"), updated);
    },

    updatePrinterSettings: async (newSettings) => {
        const { printer } = get();
        const updated = { ...printer, ...newSettings };
        // Optimistic update
        set({ printer: updated });

        await update(ref(db, "settings/printer"), updated);
    }
}));
