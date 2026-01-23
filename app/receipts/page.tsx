"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { clsx } from "clsx";
import { Receipt as ReceiptIcon, RotateCcw, Printer, Mail, Trash2 } from "lucide-react";
import { subscribeToReceipts, clearAllReceipts } from "@/services/receiptService";
import { Receipt } from "@/types";

export default function ReceiptsPage() {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);

    // Subscribe to real receipts
    useEffect(() => {
        const unsubscribe = subscribeToReceipts((data) => {
            setReceipts(data);
            if (data.length > 0 && !selectedReceiptId) {
                // Auto select first
                setSelectedReceiptId(data[0].id);
            }
        });
        return () => unsubscribe();
    }, [selectedReceiptId]);

    const selectedReceipt = receipts.find(r => r.id === selectedReceiptId);

    const handleClearHistory = async () => {
        if (confirm("Are you sure you want to delete ALL receipt history? This cannot be undone.")) {
            await clearAllReceipts();
            setSelectedReceiptId(null);
        }
    }

    return (
        <div className="flex h-full w-full">
            {/* List */}
            <div className="w-1/3 border-r border-pos-border bg-pos-panel flex flex-col">
                <div className="p-4 border-b border-pos-border flex justify-between items-center">
                    <h1 className="text-xl font-bold text-white">Receipts</h1>
                    <button
                        onClick={handleClearHistory}
                        className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1"
                    >
                        <Trash2 size={12} /> Clear History
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-2">
                    {receipts.length === 0 && (
                        <div className="text-center text-pos-text-secondary py-10 opacity-50">
                            No receipts found.
                        </div>
                    )}
                    {receipts.map((receipt) => (
                        <button
                            key={receipt.id}
                            onClick={() => setSelectedReceiptId(receipt.id)}
                            className={clsx(
                                "w-full text-left p-4 rounded-xl border border-transparent transition-all",
                                selectedReceiptId === receipt.id
                                    ? "bg-pos-accent text-white shadow-md"
                                    : "bg-pos-bg text-pos-text-secondary hover:bg-pos-border hover:text-pos-text-primary"
                            )}
                        >
                            <div className="flex justify-between font-bold mb-1">
                                <span>{receipt.receiptNumber}</span>
                                <span>{formatCurrency(receipt.total)}</span>
                            </div>
                            <div className="flex justify-between text-sm opacity-80">
                                <span>{new Date(receipt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                    {receipt.paymentMethod}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Details */}
            <div className="flex-1 bg-pos-bg flex flex-col p-8 items-center justify-center">
                {selectedReceipt ? (
                    <div className="bg-white text-black p-8 rounded-lg shadow-2xl w-[400px] flex flex-col relative overflow-hidden max-h-full overflow-y-auto">
                        <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                            <h2 className="text-xl font-bold">RESTAURANT NAME</h2>
                            <p className="text-xs text-gray-500">123 Food Street, City</p>
                            <p className="text-xs text-gray-500">{new Date(selectedReceipt.timestamp).toLocaleString()}</p>
                        </div>

                        <div className="flex-1 space-y-1 mb-4">
                            <div className="flex justify-between mb-2 text-xs font-bold border-b border-black pb-1">
                                <span>ITEM</span>
                                <span>AMT</span>
                            </div>
                            {selectedReceipt.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span className="line-clamp-1 flex-1 pr-2">{item.quantity} x {item.name}</span>
                                    <span className="whitespace-nowrap">{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t-2 border-dashed border-gray-300 pt-2 space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatCurrency(selectedReceipt.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Rounding</span>
                                <span>{formatCurrency(selectedReceipt.rounding || 0)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-xl pt-2">
                                <span>TOTAL</span>
                                <span>{formatCurrency(selectedReceipt.total)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-100 mt-2">
                                <span className="uppercase">{selectedReceipt.paymentMethod}</span>
                                <span>{formatCurrency(selectedReceipt.paidAmount)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>CHANGE</span>
                                <span>{formatCurrency(selectedReceipt.change)}</span>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-3 gap-2 noprint">
                            <button className="flex flex-col items-center justify-center gap-1 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm">
                                <RotateCcw size={16} /> Refund
                            </button>
                            <button className="flex flex-col items-center justify-center gap-1 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm">
                                <Printer size={16} /> Print
                            </button>
                            <button className="flex flex-col items-center justify-center gap-1 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm">
                                <Mail size={16} /> Email
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-pos-text-secondary flex flex-col items-center">
                        <ReceiptIcon size={64} className="mb-4 opacity-20" />
                        <p>Select a transaction to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}
