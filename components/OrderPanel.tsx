"use client";

import { usePosStore } from "@/store/usePosStore";
import { formatCurrency, roundToNearestFiveCents, calculateRoundingAdjustment } from "@/lib/utils";
import { Trash2, AlertCircle, ArrowRightLeft, Percent, Wallet, PauseCircle, XCircle } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useState } from "react";
import { PaymentModal } from "./PaymentModal";
import { addReceipt } from "@/services/receiptService";
import { addShiftTransaction } from "@/services/shiftService";

export function OrderPanel() {
    const { activeTableId, orders, removeFromOrder, updateQuantity, clearOrder } = usePosStore();
    const [showPayment, setShowPayment] = useState(false);

    const currentOrder = orders[activeTableId];
    const items = currentOrder?.items || [];

    // Calculations
    const rawSubtotal = currentOrder?.subtotal || 0;
    const tax = currentOrder?.tax || 0;
    const rawTotal = rawSubtotal + tax;

    const roundingAdj = calculateRoundingAdjustment(rawTotal);
    const finalTotal = roundToNearestFiveCents(rawTotal);

    return (
        <div className="flex flex-col h-full relative">
            {/* Payment Modal */}
            {showPayment && (
                <PaymentModal
                    total={finalTotal}
                    onClose={() => setShowPayment(false)}
                    onComplete={async (method, paidAmount) => {
                        try {
                            // Track Sales (All Methods)
                            await addShiftTransaction(finalTotal, method);

                            // Save Receipt
                            await addReceipt({
                                tableId: activeTableId,
                                items: items,
                                subtotal: rawSubtotal,
                                tax: tax,
                                rounding: roundingAdj,
                                total: finalTotal,
                                paymentMethod: method,
                                paidAmount: paidAmount,
                                change: paidAmount - finalTotal,
                                timestamp: Date.now()
                            });

                            // Clear Order
                            clearOrder(activeTableId);
                            setShowPayment(false);
                            alert("Payment Complete & Saved!");
                        } catch (error: any) {
                            console.error("Payment Error:", error);
                            alert(`Payment Failed: ${error.message || "Unknown error"}`);
                        }
                    }}
                />
            )}

            {/* Header */}
            <div className="p-4 border-b border-pos-border bg-pos-panel flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">Table {activeTableId}</h2>
                    <div className="flex gap-2 text-xs text-pos-text-secondary">
                        <span>Dine-in</span>
                        <span>•</span>
                        <span>{items.length} items</span>
                    </div>
                </div>

                {/* Top Actions: Discount & Move */}
                <div className="flex gap-2">
                    <button className="p-2 bg-pos-bg rounded-lg text-pos-text-secondary hover:text-white hover:bg-pos-accent/20 transition-colors" title="Move Table">
                        <ArrowRightLeft size={18} />
                    </button>
                    <button className="p-2 bg-pos-bg rounded-lg text-pos-text-secondary hover:text-white hover:bg-pos-accent/20 transition-colors" title="Add Discount">
                        <Percent size={18} />
                    </button>
                </div>
            </div>

            {/* Order Items List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 no-scrollbar">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-pos-text-secondary opacity-50">
                        <AlertCircle size={48} className="mb-4" />
                        <p>Empty Order</p>
                        <p className="text-sm">Select items from the left</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <motion.div
                            layout
                            key={item.cartItemId || item.id}
                            className="bg-pos-bg p-3 rounded-xl border border-pos-border/50 flex flex-col gap-2"
                        >
                            <div className="flex justify-between items-start">
                                <div className="w-2/3">
                                    <span className="font-medium text-white line-clamp-2">{item.name}</span>
                                    {/* Modifiers Display */}
                                    {item.selectedModifiers && Object.values(item.selectedModifiers).flat().length > 0 && (
                                        <div className="text-xs text-pos-text-secondary mt-1 flex flex-wrap gap-1">
                                            {Object.values(item.selectedModifiers).flat().map((mod, i) => (
                                                <span key={i} className="bg-pos-panel px-1.5 py-0.5 rounded border border-pos-border">
                                                    {mod.label}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="font-bold text-white">{formatCurrency(item.price * item.quantity)}</span>
                                    {/* Show unit price if modded? Maybe overkill for now */}
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3 bg-pos-panel rounded-lg p-1 border border-pos-border">
                                    <button
                                        onClick={() => updateQuantity(item.cartItemId || item.id, -1)}
                                        className="w-8 h-8 flex items-center justify-center rounded bg-pos-bg hover:bg-white hover:text-black transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="font-bold w-4 text-center text-white">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.cartItemId || item.id, 1)}
                                        className="w-8 h-8 flex items-center justify-center rounded bg-pos-bg hover:bg-white hover:text-black transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeFromOrder(item.cartItemId || item.id)}
                                    className="text-red-500 p-2 hover:bg-red-500/20 rounded transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Bill Summary Footer */}
            <div className="bg-pos-bg border-t border-pos-border p-4 space-y-1 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between text-pos-text-secondary text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(rawSubtotal)}</span>
                </div>
                <div className="flex justify-between text-pos-text-secondary text-sm">
                    <span>Tax (5%)</span>
                    <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-pos-text-secondary text-sm italic">
                    <span>Rounding</span>
                    <span>{formatCurrency(roundingAdj)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-white pt-2 border-t border-pos-border mb-4">
                    <span>Total</span>
                    <span className="text-pos-accent">{formatCurrency(finalTotal)}</span>
                </div>

                {/* Primary Actions */}
                <div className="grid grid-cols-4 gap-2 h-14">
                    <button
                        className="col-span-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex flex-col items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-95"
                        onClick={() => { if (confirm("Cancel entire order?")) clearOrder(activeTableId); }}
                    >
                        <XCircle size={20} />
                        <span className="text-[10px] uppercase font-bold mt-1">Cancel</span>
                    </button>
                    <button className="col-span-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl flex flex-col items-center justify-center hover:bg-yellow-500 hover:text-black transition-all active:scale-95">
                        <PauseCircle size={20} />
                        <span className="text-[10px] uppercase font-bold mt-1">Hold</span>
                    </button>
                    <button
                        onClick={() => setShowPayment(true)}
                        disabled={items.length === 0}
                        className="col-span-2 bg-pos-accent text-white rounded-xl flex items-center justify-center gap-2 font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-pos-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Wallet size={24} />
                        <span>PAY</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
