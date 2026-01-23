"use client";

import { motion } from "framer-motion";
import { Percent, DollarSign, Delete } from "lucide-react";
import { useState } from "react";
import { usePosStore } from "@/store/usePosStore";
import { formatCurrency } from "@/lib/utils";

interface DiscountModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTotal: number;
    currentDiscount: number;
}

export function DiscountModal({ isOpen, onClose, currentTotal, currentDiscount }: DiscountModalProps) {
    const { activeTableId, applyDiscount } = usePosStore();
    const [mode, setMode] = useState<'amount' | 'percent'>('amount');
    const [value, setValue] = useState<string>("");

    if (!isOpen) return null;

    const handleApply = () => {
        let discountAmount = 0;
        const numVal = parseFloat(value);
        if (isNaN(numVal)) return;

        if (mode === 'amount') {
            discountAmount = numVal;
        } else {
            discountAmount = currentTotal * (numVal / 100);
        }

        applyDiscount(activeTableId, discountAmount);
        onClose();
    };

    const handleClear = () => {
        applyDiscount(activeTableId, 0);
        onClose();
    }

    // Quick keys
    const percentages = [5, 10, 15, 20, 25, 50];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-pos-panel w-full max-w-md rounded-2xl border border-pos-border shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-pos-border">
                    <h2 className="text-xl font-bold text-white">Apply Discount</h2>
                    <p className="text-pos-text-secondary">Current Total: {formatCurrency(currentTotal)}</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Mode Toggle */}
                    <div className="flex bg-pos-bg p-1 rounded-xl border border-pos-border">
                        <button
                            onClick={() => setMode('amount')}
                            className={`flex-1 py-2 rounded-lg font-bold transition-all ${mode === 'amount' ? 'bg-pos-panel text-white shadow' : 'text-pos-text-secondary'}`}
                        >
                            Fixed Amount ($)
                        </button>
                        <button
                            onClick={() => setMode('percent')}
                            className={`flex-1 py-2 rounded-lg font-bold transition-all ${mode === 'percent' ? 'bg-pos-panel text-white shadow' : 'text-pos-text-secondary'}`}
                        >
                            Percentage (%)
                        </button>
                    </div>

                    {/* Input */}
                    <div>
                        <div className="relative">
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={mode === 'amount' ? "0.00" : "0"}
                                className="w-full bg-pos-bg border border-pos-border rounded-xl px-4 py-3 text-2xl font-bold text-white focus:outline-none focus:border-pos-accent"
                                autoFocus
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-pos-text-secondary font-bold">
                                {mode === 'amount' ? '' : '%'}
                            </span>
                        </div>
                    </div>

                    {/* Quick Percentages */}
                    {mode === 'percent' && (
                        <div className="grid grid-cols-3 gap-2">
                            {percentages.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setValue(p.toString())}
                                    className="py-2 bg-pos-bg border border-pos-border rounded-lg text-pos-text-secondary hover:text-white hover:bg-pos-border transition-colors font-bold"
                                >
                                    {p}%
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Current Discount Display */}
                    {currentDiscount > 0 && (
                        <div className="flex justify-between items-center p-3 bg-pos-accent/10 rounded-xl border border-pos-accent/20">
                            <span className="text-pos-accent font-bold">Current Discount</span>
                            <div className="flex items-center gap-2">
                                <span className="text-white font-bold">{formatCurrency(currentDiscount)}</span>
                                <button onClick={handleClear} className="p-1 hover:bg-pos-accent/20 rounded text-pos-accent">
                                    <Delete size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-pos-border flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-xl bg-pos-bg border border-pos-border text-pos-text-secondary font-bold hover:bg-pos-border transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 py-4 rounded-xl bg-pos-accent text-white font-bold hover:brightness-110 transition-all"
                    >
                        Apply Discount
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
