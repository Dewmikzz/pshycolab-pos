import { create } from "zustand";
import { Order, Product, CartItem, Table } from "@/types";
import { subscribeToOrders, updateOrderItems, clearTableOrder, subscribeToTables } from "@/services/orderService";

interface PosState {
    activeTableId: string;
    viewMode: 'tables' | 'order';
    isMenuOpen: boolean;
    orders: Record<string, Order>; // Synced from Firebase
    tables: Table[];

    // Actions
    setActiveTable: (id: string) => void;
    setViewMode: (mode: 'tables' | 'order') => void;
    toggleMenu: () => void;
    setMenuOpen: (isOpen: boolean) => void;
    initializeSubscription: () => () => void; // Returns unsubscribe function

    // Async Actions (that update Firebase)
    addToOrder: (product: Product, modifiers?: Record<string, import("@/types").ModifierOption[]>, status?: 'pending' | 'sent') => void;
    removeFromOrder: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, delta: number) => void;
    clearOrder: (tableId: string) => void;
    sendToKitchen: (tableId: string) => void;
    moveTable: (fromId: string, toId: string) => void;
    applyDiscount: (tableId: string, discount: number) => void;
}

export const usePosStore = create<PosState>((set, get) => ({
    activeTableId: "1",
    viewMode: 'tables', // Default to tables view
    isMenuOpen: false,
    orders: {},
    tables: [],

    setActiveTable: (id) => set({ activeTableId: id, viewMode: 'order' }), // Auto switch to order mode
    setViewMode: (mode) => set({ viewMode: mode }),
    toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
    setMenuOpen: (isOpen) => set({ isMenuOpen: isOpen }),

    initializeSubscription: () => {
        const unsubscribeOrders = subscribeToOrders((orders) => {
            set({ orders });
        });
        const unsubscribeTables = subscribeToTables((tables) => {
            // @ts-ignore
            set({ tables });
        });
        return () => {
            unsubscribeOrders();
            unsubscribeTables();
        };
    },

    addToOrder: async (product, modifiers = {}, status = 'pending') => {
        const { activeTableId, orders } = get();
        const currentOrder = orders[activeTableId];
        const items = currentOrder?.items || [];
        const discount = currentOrder?.discount || 0;

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

        // Find existing item with same Product ID AND same Modifiers AND same Status
        const existingItemIndex = items.findIndex((i) =>
            i.id === product.id &&
            areModifiersEqual(i.selectedModifiers, modifiers) &&
            i.status === status
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
                selectedModifiers: modifiers,
                status: status
            });
        }

        await updateOrderItems(activeTableId, newItems, discount);
    },

    removeFromOrder: async (cartItemId) => {
        const { activeTableId, orders } = get();
        const currentOrder = orders[activeTableId];
        if (!currentOrder) return;

        const discount = currentOrder.discount || 0;
        const newItems = currentOrder.items.filter((i) => i.cartItemId !== cartItemId);
        await updateOrderItems(activeTableId, newItems, discount);
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

        const discount = currentOrder.discount || 0;
        await updateOrderItems(activeTableId, newItems, discount);
    },

    clearOrder: async (tableId) => {
        await clearTableOrder(tableId);
    },

    sendToKitchen: async (tableId) => {
        const { orders } = get();
        const currentOrder = orders[tableId];
        if (!currentOrder) return;

        const newItems = currentOrder.items.map(item => ({
            ...item,
            status: item.status === 'pending' ? 'sent' : item.status
        }));

        // Count as "sent" typing
        const discount = currentOrder.discount || 0;
        await updateOrderItems(tableId, newItems as CartItem[], discount);
    },

    moveTable: async (fromId, toId) => {
        const { orders } = get();
        const sourceOrder = orders[fromId];
        if (!sourceOrder) return;

        // Get target order items to merge if any (optional, but good UX)
        // For now, let's assume simple move (target should be empty or we merge)
        const targetOrder = orders[toId];
        const targetItems = targetOrder?.items || [];

        const mergedItems = [...targetItems, ...sourceOrder.items];
        const discount = sourceOrder.discount || 0; // Carry over discount? Or reset? Let's carry over.

        // Update target
        await updateOrderItems(toId, mergedItems, discount);

        // Clear source
        await clearTableOrder(fromId);
    },

    applyDiscount: async (tableId, discount) => {
        const { orders } = get();
        const currentOrder = orders[tableId];
        if (!currentOrder) return;

        await updateOrderItems(tableId, currentOrder.items, discount);
    }
}));
