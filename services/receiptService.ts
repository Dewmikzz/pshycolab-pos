import { db } from "@/lib/firebase";
import { ref, push, update, onValue, remove } from "firebase/database";
import { Receipt } from "@/types";

export async function addReceipt(receiptData: Omit<Receipt, "id" | "receiptNumber">) {
    const receiptRef = ref(db, "receipts");
    const newRef = push(receiptRef);

    // Generate a simple receipt number based on timestamp or random
    // In a real app, this would be a counter. For now, use timestamp suffix.
    const receiptNumber = `RC-${Date.now().toString().slice(-6)}`;

    const finalReceipt = {
        ...receiptData,
        id: newRef.key,
        receiptNumber,
        timestamp: Date.now()
    };

    await update(newRef, finalReceipt);
}

export function subscribeToReceipts(callback: (receipts: Receipt[]) => void) {
    const receiptRef = ref(db, "receipts");
    return onValue(receiptRef, (snapshot) => {
        const data = snapshot.val();
        const receipts = data ? Object.values(data) as Receipt[] : [];
        // Sort by newest first
        callback(receipts.sort((a, b) => b.timestamp - a.timestamp));
    });
}

export async function clearAllReceipts() {
    const receiptRef = ref(db, "receipts");
    await remove(receiptRef);
}
