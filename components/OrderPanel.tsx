"use client";

import { usePosStore } from "@/store/usePosStore";
import { formatCurrency, roundToNearestFiveCents, calculateRoundingAdjustment } from "@/lib/utils";
import { Trash2, AlertCircle, ArrowRightLeft, Percent, Wallet, PauseCircle, XCircle } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useState } from "react";
import { PaymentModal } from "./PaymentModal";
import { MoveTableModal } from "./MoveTableModal";
import { DiscountModal } from "./DiscountModal";
import { addReceipt } from "@/services/receiptService";
import { addShiftTransaction } from "@/services/shiftService";
import { Send } from "lucide-react";

export function OrderPanel() {
    const { activeTableId, orders, removeFromOrder, updateQuantity, clearOrder, sendToKitchen } = usePosStore();
    const [showPayment, setShowPayment] = useState(false);
    const [showMoveTable, setShowMoveTable] = useState(false);
    const [showDiscount, setShowDiscount] = useState(false);

    const currentOrder = orders[activeTableId];
    const items = currentOrder?.items || [];

    // Calculations
    const rawSubtotal = currentOrder?.subtotal || 0;
    const discount = currentOrder?.discount || 0;
    const taxableAmount = Math.max(0, rawSubtotal - discount);
    const tax = currentOrder?.tax || 0;
    const rawTotal = taxableAmount + tax;

    // Check for pending items
    const hasPendingItems = items.some(i => i.status === 'pending');

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
            {/* Modals */}
            <MoveTableModal
                isOpen={showMoveTable}
                onClose={() => setShowMoveTable(false)}
                currentTableId={activeTableId}
            />
            <DiscountModal
                isOpen={showDiscount}
                onClose={() => setShowDiscount(false)}
                currentTotal={rawSubtotal}
                currentDiscount={discount}
            />
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
                                discount: discount, // Add discount to receipt
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
                    <button
                        onClick={() => setShowMoveTable(true)}
                        className="p-2 bg-pos-bg rounded-lg text-pos-text-secondary hover:text-white hover:bg-pos-accent/20 transition-colors"
                        title="Move Table"
                    >
                        <ArrowRightLeft size={18} />
                    </button>
                    <button
                        onClick={() => setShowDiscount(true)}
                        className={`p-2 rounded-lg transition-colors ${discount > 0 ? 'bg-pos-accent text-white' : 'bg-pos-bg text-pos-text-secondary hover:text-white hover:bg-pos-accent/20'}`}
                        title="Add Discount"
                    >
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
                                    <div className="flex items-center gap-2">
                                        <span className={`font-medium line-clamp-2 ${item.status === 'sent' ? 'text-pos-text-secondary' : 'text-white'}`}>
                                            {item.name}
                                        </span>
                                        {item.status === 'sent' && (
                                            <span className="text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded border border-green-500/20 uppercase font-bold">
                                                Sent
                                            </span>
                                        )}
                                        {item.status === 'pending' && (
                                            <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20 uppercase font-bold">
                                                New
                                            </span>
                                        )}
                                    </div>
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
                {discount > 0 && (
                    <div className="flex justify-between text-pos-accent text-sm">
                        <span>Discount</span>
                        <span>-{formatCurrency(discount)}</span>
                    </div>
                )}
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
                <div className="grid grid-cols-1 gap-2 h-14">
                    {items.length > 0 && hasPendingItems ? (
                        <button
                            onClick={() => sendToKitchen(activeTableId)}
                            className="w-full bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20"
                        >
                            <Send size={24} />
                            <span>SEND TO KITCHEN</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowPayment(true)}
                            disabled={items.length === 0}
                            className="w-full bg-pos-accent text-white rounded-xl flex items-center justify-center gap-2 font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-pos-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Wallet size={24} />
                            <span>PAY {formatCurrency(finalTotal)}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
