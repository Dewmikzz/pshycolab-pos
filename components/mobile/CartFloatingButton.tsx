"use client";

import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";

interface CartFloatingButtonProps {
    itemCount: number;
    total: number;
    onViewCart: () => void;
}

export function CartFloatingButton({ itemCount, total, onViewCart }: CartFloatingButtonProps) {
    return (
        <AnimatePresence>
            {itemCount > 0 && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-0 right-0 z-30 flex justify-center px-6 pointer-events-none"
                >
                    <button
                        onClick={onViewCart}
                        className="pointer-events-auto w-full max-w-sm bg-slate-900 text-white h-16 rounded-full shadow-2xl shadow-slate-900/30 flex items-center justify-between px-2 pl-6 pr-2 active:scale-[0.98] transition-transform backdrop-blur-md"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white text-slate-900 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                {itemCount}
                            </div>
                            <span className="font-bold text-lg">View Order</span>
                        </div>
                        <div className="bg-white/20 text-white px-6 py-3 rounded-full font-bold">
                            {formatCurrency(total)}
                        </div>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
