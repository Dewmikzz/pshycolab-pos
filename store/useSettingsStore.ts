import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ReceiptSettings {
    businessName: string;
    addressLine1: string;
    addressLine2: string;
    contactPhone: string;
    footerMessage: string;
}

export interface PrinterConfig {
    id: string;
    name: string;
    type: 'main' | 'kitchen' | 'bar';
    connection: 'lan' | 'ip'; // Both use IP logic in backend, mainly for labeling
    ip: string;
    port: number;
}

interface SettingsState {
    // Security
    lockPassword: string; // Stored as plain text for simplicity in this demo, ideally hashed
    isLocked: boolean;

    // Receipt
    receiptSettings: ReceiptSettings;

    // Printers
    printers: PrinterConfig[];

    // Actions
    setLockPassword: (password: string) => void;
    setLocked: (locked: boolean) => void;
    updateReceiptSettings: (settings: Partial<ReceiptSettings>) => void;

    // Printer Actions
    addPrinter: (printer: PrinterConfig) => void;
    updatePrinter: (id: string, updates: Partial<PrinterConfig>) => void;
    removePrinter: (id: string) => void;
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

            printers: [],

            setLockPassword: (password) => set({ lockPassword: password }),
            setLocked: (locked) => set({ isLocked: locked }),
            updateReceiptSettings: (settings) => set((state) => ({
                receiptSettings: { ...state.receiptSettings, ...settings }
            })),

            addPrinter: (printer) => set((state) => ({ printers: [...state.printers, printer] })),
            updatePrinter: (id, updates) => set((state) => ({
                printers: state.printers.map(p => p.id === id ? { ...p, ...updates } : p)
            })),
            removePrinter: (id) => set((state) => ({
                printers: state.printers.filter(p => p.id !== id)
            })),
        }),
        {
            name: "pos-settings-storage", // local storage key
        }
    )
);
