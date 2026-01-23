"use client";

import { usePosStore } from "@/store/usePosStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { formatCurrency, roundToNearestFiveCents, calculateRoundingAdjustment } from "@/lib/utils";
import { Trash2, AlertCircle, ArrowRightLeft, Percent, Wallet, PauseCircle, XCircle, Printer } from "lucide-react";
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
    const { addNotification } = useNotificationStore();
    const [showPayment, setShowPayment] = useState(false);
    const [showMoveTable, setShowMoveTable] = useState(false);
    const [showDiscount, setShowDiscount] = useState(false);
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

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

    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrintBill = async () => {
        if (items.length === 0) return;

        setIsPrinting(true);
        const { receiptSettings, printers } = useSettingsStore.getState();
        const mainPrinter = printers.find(p => p.type === 'main');

        let mainPrintSuccess = false;

        // 1. MAIN PRINTER (Bill)
        if (mainPrinter) {
            try {
                addNotification('info', `Printing Bill to ${mainPrinter.name}...`);
                const receiptData = {
                    businessName: receiptSettings.businessName,
                    addressLine1: receiptSettings.addressLine1,
                    addressLine2: receiptSettings.addressLine2,
                    contactPhone: receiptSettings.contactPhone,
                    footerMessage: receiptSettings.footerMessage,
                    tableId: activeTableId,
                    items: items,
                    subtotal: rawSubtotal,
                    discount: discount,
                    tax: tax,
                    rounding: roundingAdj,
                    total: finalTotal
                };

                const res = await fetch('/api/print', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'print', printer: mainPrinter, data: receiptData })
                });
                const result = await res.json();

                if (result.success) {
                    mainPrintSuccess = true;
                    addNotification('success', "Bill Printed Successfully");
                } else {
                    addNotification('error', `Main Print Failed: ${result.error}`);
                }
            } catch (error) {
                addNotification('error', "Main Printer Connection Error");
                console.error(error);
            }
        }

        // 2. KITCHEN / BAR PRINTERS (Orders)
        // We iterate through all other printers to see if we have items for them
        const orderPrinters = printers.filter(p => p.type !== 'main');

        for (const printer of orderPrinters) {
            // Filter items for this printer
            const printerCategories = printer.categories || [];
            if (printerCategories.length === 0) continue; // No categories assigned, skip

            const itemsForPrinter = items.filter(item => printerCategories.includes(item.category));

            if (itemsForPrinter.length > 0) {
                try {
                    addNotification('info', `Sending to ${printer.name}...`);
                    const orderData = {
                        tableId: activeTableId,
                        items: itemsForPrinter
                        // No need for totals/prices usually
                    };

                    const res = await fetch('/api/print', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'print', printer: printer, data: orderData })
                    });
                    const result = await res.json();

                    if (result.success) {
                        addNotification('success', `Sent to ${printer.name}`);
                    } else {
                        addNotification('error', `${printer.name} Failed: ${result.error}`);
                    }

                } catch (e) {
                    addNotification('error', `${printer.name} Connection Error`);
                }
            }
        }

        // 3. Fallback / Browser Print Logic
        if (!mainPrinter && !mainPrintSuccess) {
            // Only open system dialog if Main Printer wasn't attempted or failed?
            // User requested "Notification" system, so usually silent failure is preferred with toast.
            // But if they have NO printer setup, we should probably still pop the window.

            if (!mainPrinter) {
                const printWindow = window.open('', '_blank');
                if (!printWindow) {
                    addNotification('error', "Please allow popups to print.");
                    setIsPrinting(false);
                    return;
                }

                const html = `
            <html>
                <head>
                    <title>Bill - Table ${activeTableId}</title>
                    <style>
                        body { font-family: 'Courier New', monospace; padding: 20px; width: 300px; margin: 0 auto; color: #000; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .title { font-size: 1.5em; font-weight: bold; }
                        .subtitle { font-size: 0.9em; margin-bottom: 5px; }
                        .line { border-bottom: 1px dashed #000; margin: 10px 0; }
                        .item { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.9em; }
                        .totals { margin-top: 10px; }
                        .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                        .total-row { font-weight: bold; font-size: 1.2em; border-top: 2px dashed #000; border-bottom: 2px dashed #000; padding: 10px 0; margin-top: 10px; }
                        .footer { text-align: center; margin-top: 20px; font-size: 0.8em; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="title">${receiptSettings.businessName}</div>
                        <div class="subtitle">${receiptSettings.addressLine1}</div>
                        ${receiptSettings.addressLine2 ? `<div class="subtitle">${receiptSettings.addressLine2}</div>` : ''}
                        <div class="subtitle">Tel: ${receiptSettings.contactPhone}</div>
                        <br/>
                        <div>Table: ${activeTableId}</div>
                        <div>Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
                    </div>

                    <div class="line"></div>

                    <div>
                        ${items.map(item => `
                            <div class="item">
                                <span>${item.quantity}x ${item.name}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                            ${item.selectedModifiers ? Object.values(item.selectedModifiers).flat().map(m => `
                                <div class="item" style="color: #666; font-size: 0.8em; padding-left: 10px;">
                                    <span>+ ${m.label}</span>
                                </div>
                            `).join('') : ''}
                        `).join('')}
                    </div>

                    <div class="line"></div>

                    <div class="totals">
                        <div class="row">
                            <span>Subtotal</span>
                            <span>${rawSubtotal.toFixed(2)}</span>
                        </div>
                        ${discount > 0 ? `
                        <div class="row">
                            <span>Discount</span>
                            <span>-${discount.toFixed(2)}</span>
                        </div>
                        ` : ''}
                        <div class="row">
                            <span>Tax (5%)</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div class="row">
                            <span>Rounding</span>
                            <span>${roundingAdj.toFixed(2)}</span>
                        </div>
                        <div class="row total-row">
                            <span>Total</span>
                            <span>${finalTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="footer">
                        <p>${receiptSettings.footerMessage}</p>
                        <p>** THIS IS NOT A RECEIPT **</p>
                    </div>

                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `;

                printWindow.document.write(html);
                printWindow.document.close();
            }
        }

        setIsPrinting(false);
    };

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
                            addNotification('success', "Payment Complete & Saved!");
                        } catch (error: any) {
                            console.error("Payment Error:", error);
                            addNotification('error', `Payment Failed: ${error.message || "Unknown error"}`);
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
                            addNotification('success', "Payment Complete & Saved!");
                        } catch (error: any) {
                            console.error("Payment Error:", error);
                            addNotification('error', `Payment Failed: ${error.message || "Unknown error"}`);
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
                        onClick={handlePrintBill}
                        disabled={isPrinting}
                        className={`p-2 bg-pos-bg rounded-lg text-pos-text-secondary hover:text-white hover:bg-pos-accent/20 transition-colors ${isPrinting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Print Bill"
                    >
                        <Printer size={18} className={isPrinting ? "animate-pulse" : ""} />
                    </button>
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
                            onClick={() => setExpandedItemId(expandedItemId === item.cartItemId ? null : item.cartItemId)}
                            className={`p-3 rounded-xl border flex flex-col gap-2 cursor-pointer transition-colors ${expandedItemId === item.cartItemId
                                ? "bg-pos-panel border-pos-accent/50"
                                : "bg-transparent border-transparent hover:bg-pos-panel/50"
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-pos-accent font-bold text-sm min-w-[1.5rem]">{item.quantity}x</span>
                                        <span className={`font-medium ${item.status === 'sent' ? 'text-pos-text-secondary' : 'text-white'}`}>
                                            {item.name}
                                        </span>
                                    </div>

                                    {/* Status Badges */}
                                    <div className="flex gap-1 ml-8 mt-1">
                                        {item.status === 'sent' && (
                                            <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">
                                                Sent
                                            </span>
                                        )}
                                        {item.status === 'pending' && (
                                            <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">
                                                New
                                            </span>
                                        )}
                                    </div>

                                    {/* Modifiers Display - Minimal text */}
                                    {item.selectedModifiers && Object.values(item.selectedModifiers).flat().length > 0 && (
                                        <div className="text-xs text-pos-text-secondary ml-8 mt-0.5">
                                            {Object.values(item.selectedModifiers).flat().map(m => m.label).join(", ")}
                                        </div>
                                    )}
                                </div>

                                <span className="font-bold text-white text-sm whitespace-nowrap ml-4">
                                    {formatCurrency(item.price * item.quantity)}
                                </span>
                            </div>

                            {/* Expanded Controls */}
                            {expandedItemId === item.cartItemId && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="flex justify-between items-center pt-2 border-t border-pos-border/50 mt-1 ml-8"
                                >
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); updateQuantity(item.cartItemId || item.id, -1); }}
                                            className="w-8 h-8 flex items-center justify-center rounded bg-pos-bg hover:bg-white hover:text-black transition-colors border border-pos-border"
                                        >
                                            -
                                        </button>
                                        <span className="font-bold text-white w-4 text-center">{item.quantity}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); updateQuantity(item.cartItemId || item.id, 1); }}
                                            className="w-8 h-8 flex items-center justify-center rounded bg-pos-bg hover:bg-white hover:text-black transition-colors border border-pos-border"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFromOrder(item.cartItemId || item.id); }}
                                        className="text-red-500 p-2 hover:bg-red-500/20 rounded transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </motion.div>
                            )}
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
