import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ReceiptSettings {
    businessName: string;
    addressLine1: string;
    addressLine2: string;
    contactPhone: string;
    footerMessage: string;
}

interface SettingsState {
    // Security
    lockPassword: string; // Stored as plain text for simplicity in this demo, ideally hashed
    isLocked: boolean;

    // Receipt
    receiptSettings: ReceiptSettings;

    // Actions
    setLockPassword: (password: string) => void;
    setLocked: (locked: boolean) => void;
    updateReceiptSettings: (settings: Partial<ReceiptSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            lockPassword: "1234",
            isLocked: true, // Default to locked on load

            receiptSettings: {
                businessName: "PSYCHOLAB POS",
                addressLine1: "123 Food Street, Tech City",
                addressLine2: "Innovation District",
                contactPhone: "+1 234 567 890",
                footerMessage: "Thank you for dining with us!"
            },

            setLockPassword: (password) => set({ lockPassword: password }),
            setLocked: (locked) => set({ isLocked: locked }),
            updateReceiptSettings: (settings) => set((state) => ({
                receiptSettings: { ...state.receiptSettings, ...settings }
            })),
        }),
        {
            name: "pos-settings-storage", // local storage key
        }
    )
);
