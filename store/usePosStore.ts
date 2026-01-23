import { create } from "zustand";
import { Order, Product, CartItem } from "@/types";
import { subscribeToOrders, updateOrderItems, clearTableOrder } from "@/services/orderService";

interface PosState {
    activeTableId: string;
    orders: Record<string, Order>; // Synced from Firebase

    // Actions
    setActiveTable: (id: string) => void;
    initializeSubscription: () => () => void; // Returns unsubscribe function

    // Async Actions (that update Firebase)
    addToOrder: (product: Product, modifiers?: Record<string, import("@/types").ModifierOption[]>) => void;
    removeFromOrder: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, delta: number) => void;
    clearOrder: (tableId: string) => void;
}

export const usePosStore = create<PosState>((set, get) => ({
    activeTableId: "1",
    orders: {},

    setActiveTable: (id) => set({ activeTableId: id }),

    initializeSubscription: () => {
        const unsubscribe = subscribeToOrders((orders) => {
            set({ orders });
        });
        return unsubscribe;
    },

    addToOrder: async (product, modifiers = {}) => {
        const { activeTableId, orders } = get();
        const currentOrder = orders[activeTableId];
        const items = currentOrder?.items || [];

        // Helper to check deep equality of modifiers
        const areModifiersEqual = (a: Record<string, any[]> = {}, b: Record<string, any[]> = {}) => {
            const keysA = Object.keys(a).sort();
            const keysB = Object.keys(b).sort();
            if (keysA.length !== keysB.length) return false;
            if (!keysA.every((k, i) => k === keysB[i])) return false;

            return keysA.every(key => {
                const valsA = a[key].map(v => v.id).sort();
                const valsB = b[key].map(v => v.id).sort();
                return JSON.stringify(valsA) === JSON.stringify(valsB);
            });
        };

        // Find existing item with same Product ID AND same Modifiers
        const existingItemIndex = items.findIndex((i) =>
            i.id === product.id && areModifiersEqual(i.selectedModifiers, modifiers)
        );

        let newItems = [...items];

        if (existingItemIndex > -1) {
            newItems[existingItemIndex] = {
                ...newItems[existingItemIndex],
                quantity: newItems[existingItemIndex].quantity + 1
            };
        } else {
            newItems.push({
                ...product,
                cartItemId: `${product.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                quantity: 1,
                selectedModifiers: modifiers
            });
        }

        await updateOrderItems(activeTableId, newItems);
    },

    removeFromOrder: async (cartItemId) => {
        const { activeTableId, orders } = get();
        const currentOrder = orders[activeTableId];
        if (!currentOrder) return;

        const newItems = currentOrder.items.filter((i) => i.cartItemId !== cartItemId);
        await updateOrderItems(activeTableId, newItems);
    },

    updateQuantity: async (cartItemId, delta) => {
        const { activeTableId, orders } = get();
        const currentOrder = orders[activeTableId];
        if (!currentOrder) return;

        const newItems = currentOrder.items.map((item) => {
            if (item.cartItemId === cartItemId) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        }).filter(i => i.quantity > 0);

        await updateOrderItems(activeTableId, newItems);
    },

    clearOrder: async (tableId) => {
        await clearTableOrder(tableId);
    },
}));
