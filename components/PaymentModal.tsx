"use client";

import { useState } from "react";
import { formatCurrency, roundToNearestFiveCents } from "@/lib/utils";
import { X, CreditCard, QrCode, Banknote, MoreHorizontal, Delete, CheckCircle, Car, Utensils } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt } from "@/types";

interface PaymentModalProps {
    total: number;
    onClose: () => void;
    onComplete: (method: Receipt['paymentMethod'], paidAmount: number) => void;
}

export function PaymentModal({ total, onClose, onComplete }: PaymentModalProps) {
    const [method, setMethod] = useState<Receipt['paymentMethod']>("cash");
    const [cashReceived, setCashReceived] = useState<string>("");

    const paidAmount = parseFloat(cashReceived) || 0;
    const change = paidAmount - total;
    const isSufficient = paidAmount >= total;

    const handleNumPad = (val: string) => {
        if (val === "C") {
            setCashReceived("");
            return;
        }
        if (val === ".") {
            if (cashReceived.includes(".")) return;
        }
        setCashReceived((prev) => prev + val);
    };

    // Quick cash buttons
    const suggestions = [Math.ceil(total), Math.ceil(total / 10) * 10, Math.ceil(total / 50) * 50, Math.ceil(total / 100) * 100].filter((v, i, a) => a.indexOf(v) === i && v >= total);

    const methods: { id: Receipt['paymentMethod'], label: string, icon: any }[] = [
        { id: "cash", label: "CASH", icon: Banknote },
        { id: "qr", label: "QR", icon: QrCode },
        { id: "card", label: "CARD", icon: CreditCard },
        { id: "grab_food", label: "GRAB FOOD", icon: Car },
        { id: "grab_dine_out", label: "GRAB DINE OUT", icon: Utensils },
    ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-pos-bg w-full max-w-5xl h-[600px] rounded-3xl shadow-2xl border border-pos-border flex overflow-hidden"
            >
                {/* Validated Sidebar (Methods) */}
                <div className="w-64 bg-pos-panel border-r border-pos-border p-4 flex flex-col gap-2 overflow-y-auto">
                    <h3 className="text-pos-text-secondary text-xs font-bold uppercase tracking-wider mb-2">Payment Method</h3>
                    {methods.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setMethod(m.id)}
                            className={clsx(
                                "flex items-center gap-3 p-4 rounded-xl text-left font-bold transition-all text-sm",
                                method === m.id
                                    ? "bg-pos-accent text-white shadow-lg"
                                    : "bg-pos-bg text-pos-text-secondary hover:bg-white hover:text-black"
                            )}
                        >
                            <m.icon size={20} />
                            {m.label}
                        </button>
                    ))}
                </div>

                {/* Center: Input Area */}
                <div className="flex-1 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-white">
                            {method === "cash" ? "Enter Cash Received" : `Process ${method.replace('_', ' ').toUpperCase()}`}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-red-500/20 text-pos-text-secondary hover:text-red-500 rounded-full">
                            <X size={24} />
                        </button>
                    </div>

                    {method === "cash" ? (
                        <div className="grid grid-cols-2 gap-6 h-full">
                            {/* Numpad */}
                            <div className="grid grid-cols-3 gap-2 h-full">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0, "C"].map((btn) => (
                                    <button
                                        key={btn}
                                        onClick={() => handleNumPad(btn.toString())}
                                        className={clsx(
                                            "rounded-xl text-2xl font-bold transition-active active:scale-95",
                                            btn === "C" ? "bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white" : "bg-pos-panel text-white hover:bg-pos-border"
                                        )}
                                    >
                                        {btn}
                                    </button>
                                ))}
                            </div>
                            {/* Suggestions */}
                            <div className="flex flex-col gap-3">
                                <div className="p-4 bg-pos-panel rounded-2xl border border-pos-border mb-4 text-center">
                                    <span className="text-pos-text-secondary text-sm">Amount Received</span>
                                    <div className="text-4xl font-bold text-white mt-1">
                                        {cashReceived ? `Rs ${cashReceived}` : "Rs 0.00"}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {suggestions.map(amt => (
                                        <button
                                            key={amt}
                                            onClick={() => setCashReceived(amt.toFixed(2))}
                                            className="p-4 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl font-bold hover:bg-green-500 hover:text-white"
                                        >
                                            Rs {amt.toFixed(2)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        (() => {
                            const activeMethod = methods.find(m => m.id === method);
                            const ActiveIcon = activeMethod?.icon;

                            return (
                                <div className="flex-1 flex flex-col items-center justify-center text-pos-text-secondary">
                                    <div className="w-24 h-24 rounded-full bg-pos-panel border border-pos-border flex items-center justify-center mb-6">
                                        {ActiveIcon && <ActiveIcon size={40} />}
                                    </div>
                                    <p className="max-w-xs text-center">
                                        Confirm that the <strong>{activeMethod?.label}</strong> payment of <strong>{formatCurrency(total)}</strong> has been received/verified.
                                    </p>
                                </div>
                            );
                        })()
                    )}
                </div>

                {/* Right: details */}
                <div className="w-80 bg-pos-panel border-l border-pos-border p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <span className="text-pos-text-secondary text-sm">Total Due</span>
                            <div className="text-4xl font-bold text-white">{formatCurrency(total)}</div>
                        </div>
                        {method === "cash" && (
                            <motion.div animate={{ opacity: isSufficient ? 1 : 0.5 }} className="space-y-1">
                                <span className="text-pos-text-secondary text-sm">Change</span>
                                <div className={clsx("text-4xl font-bold", change >= 0 ? "text-green-500" : "text-red-500")}>
                                    {formatCurrency(Math.max(0, change))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <button
                        disabled={method === "cash" && !isSufficient}
                        onClick={() => onComplete(method, method === "cash" ? paidAmount : total)}
                        className="w-full h-16 bg-pos-accent text-white rounded-xl font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:brightness-110"
                    >
                        <CheckCircle size={24} />
                        CONFIRM PAYMENT
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
