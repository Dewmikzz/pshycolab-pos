import { db } from "@/lib/firebase";
import { ref, onValue, set, get, update, remove } from "firebase/database";
import { Order, CartItem } from "@/types";

// Subscribe to all orders (for POS)
export function subscribeToOrders(callback: (orders: Record<string, Order>) => void) {
    const ordersRef = ref(db, "orders");
    return onValue(ordersRef, (snapshot) => {
        const data = snapshot.val() || {};
        callback(data);
    });
}

// Subscribe to specific table order (for Mobile)
export function subscribeToTableOrder(tableId: string, callback: (order: Order | null) => void) {
    const orderRef = ref(db, `orders/${tableId}`);
    return onValue(orderRef, (snapshot) => {
        const data = snapshot.val();
        callback(data || null);
    });
}

// Subscribe to all tables
export function subscribeToTables(callback: (tables: any[]) => void) {
    const tablesRef = ref(db, "tables");
    return onValue(tablesRef, (snapshot) => {
        const data = snapshot.val() || {};
        // Convert object to array
        const tablesArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));
        callback(tablesArray);
    });
}

// Subscribe to table config (for Token validation)
export function subscribeToTableConfig(tableId: string, callback: (data: { token?: string } | null) => void) {
    const tableRef = ref(db, `tables/${tableId}`);
    return onValue(tableRef, (snapshot) => {
        const data = snapshot.val();
        callback(data || null);
    });
}

// Helper to calculate totals
const calculateTotals = (items: CartItem[], discount: number = 0) => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = taxableAmount * 0.05;
    const total = taxableAmount + tax;
    return { subtotal, tax, total };
};

// Generic Order Update
export async function updateOrderItems(tableId: string, newItems: CartItem[], discount: number = 0) {
    const { subtotal, tax, total } = calculateTotals(newItems, discount);

    const orderRef = ref(db, `orders/${tableId}`);
    await update(orderRef, {
        tableId,
        items: newItems,
        subtotal,
        discount,
        tax,
        total,
        updatedAt: Date.now()
    });
}

export async function clearTableOrder(tableId: string) {
    const orderRef = ref(db, `orders/${tableId}`);
    await remove(orderRef);
}

// One-time script to seed tables with tokens
export async function seedTables(tables: { id: string, label: string }[]) {
    // Check if tables already exist
    const tablesSnap = await get(ref(db, "tables"));
    if (tablesSnap.exists()) return;

    const updates: Record<string, any> = {};
    tables.forEach(t => {
        updates[`tables/${t.id}`] = {
            ...t,
            token: Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10) // Simple random token
        };
    });
    await update(ref(db), updates);
}
