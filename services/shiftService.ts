import { db } from "@/lib/firebase";
import { ref, push, update, onValue, query, orderByChild, equalTo, get, remove } from "firebase/database";
import { Shift, Receipt } from "@/types";

// Get reference to the active shift (if any)
export function subscribeToCurrentShift(callback: (shift: Shift | null) => void) {
    const shiftsRef = ref(db, "shifts");
    const activeShiftQuery = query(shiftsRef, orderByChild("status"), equalTo("open"));

    return onValue(activeShiftQuery, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            callback(null);
            return;
        }
        // Should only be one open shift, but take the first if multiple
        const shift = Object.values(data)[0] as Shift;
        callback(shift);
    });
}

export function subscribeToShiftHistory(callback: (shifts: Shift[]) => void) {
    const shiftsRef = ref(db, "shifts");
    return onValue(shiftsRef, (snapshot) => {
        const data = snapshot.val();
        const shifts = data ? Object.values(data) as Shift[] : [];
        // Sort by newest first
        callback(shifts.sort((a, b) => b.openedAt - a.openedAt));
    });
}

export async function openShift(startCash: number) {
    const shiftsRef = ref(db, "shifts");
    const activeShiftQuery = query(shiftsRef, orderByChild("status"), equalTo("open"));
    const snapshot = await get(activeShiftQuery);
    if (snapshot.exists()) {
        throw new Error("A shift is already open.");
    }

    const newRef = push(shiftsRef);
    const shift: Shift = {
        id: newRef.key!,
        openedAt: Date.now(),
        startCash,
        cashPayments: 0,
        cashDrops: 0,
        expectedCash: startCash,

        totalSales: 0,
        cardSales: 0,
        qrSales: 0,
        grabFoodSales: 0,
        grabDineOutSales: 0,
        customSales: 0,

        status: 'open'
    };
    await update(newRef, shift);
}

export async function closeShift(shiftId: string, actualCash: number, notes?: string) {
    const shiftRef = ref(db, `shifts/${shiftId}`);
    await update(shiftRef, {
        status: 'closed',
        closedAt: Date.now(),
        actualCash,
        notes: notes || null
    });
}

export async function addShiftTransaction(amount: number, method: Receipt['paymentMethod']) {
    const shiftsRef = ref(db, "shifts");
    const activeShiftQuery = query(shiftsRef, orderByChild("status"), equalTo("open"));
    const snapshot = await get(activeShiftQuery);

    if (snapshot.exists()) {
        const shiftData = snapshot.val();
        const shiftKey = Object.keys(shiftData)[0];
        const shift = shiftData[shiftKey] as Shift;

        const updates: Partial<Shift> = {};

        // Always update total sales
        updates.totalSales = (shift.totalSales || 0) + amount;

        // Update specific method
        if (method === 'card') {
            updates.cardSales = (shift.cardSales || 0) + amount;
        } else if (method === 'qr') {
            updates.qrSales = (shift.qrSales || 0) + amount;
        } else if (method === 'grab_food') {
            updates.grabFoodSales = (shift.grabFoodSales || 0) + amount;
        } else if (method === 'grab_dine_out') {
            updates.grabDineOutSales = (shift.grabDineOutSales || 0) + amount;
        } else if (method === 'custom') {
            updates.customSales = (shift.customSales || 0) + amount;
        } else if (method === 'cash') {
            // Cash logic affects drawer
            const newCashPayments = (shift.cashPayments || 0) + amount;
            updates.cashPayments = newCashPayments;
            updates.expectedCash = (shift.startCash || 0) + newCashPayments + (shift.cashDrops || 0);
        }

        await update(ref(db, `shifts/${shiftKey}`), updates);
    }
}

export async function clearAllShifts() {
    await remove(ref(db, "shifts"));
}
