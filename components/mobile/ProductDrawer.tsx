"use client";

import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { useState, useEffect } from "react";

interface ProductDrawerProps {
    product: Product | null;
    onClose: () => void;
    onAddToOrder: (product: Product, quantity: number) => void;
}

export function ProductDrawer({ product, onClose, onAddToOrder }: ProductDrawerProps) {
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (product) setQuantity(1);
    }, [product]);

    return (
        <AnimatePresence>
            {product && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-pos-panel rounded-t-[32px] overflow-hidden max-w-md mx-auto"
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-12 h-1.5 bg-pos-border rounded-full" />
                        </div>

                        {/* Content */}
                        <div className="p-6 pt-2 pb-8">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold text-white pr-4">{product.name}</h2>
                                <button
                                    onClick={onClose}
                                    className="bg-pos-bg p-2 rounded-full text-pos-text-secondary"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="w-full aspect-video bg-pos-bg rounded-2xl mb-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                                    <p className="text-pos-text-secondary text-sm">Delicious food description here...</p>
                                </div>
                            </div>

                            {/* Quantity & Action */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-pos-bg rounded-full p-1 border border-pos-border">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-pos-panel text-white active:scale-95 transition-transform"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <span className="w-12 text-center font-bold text-xl text-white">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black active:scale-95 transition-transform"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>

                                <button
                                    onClick={() => {
                                        onAddToOrder(product, quantity);
                                        onClose();
                                    }}
                                    className="flex-1 bg-pos-accent h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg shadow-pos-accent/30 active:scale-[0.98] transition-all"
                                >
                                    Add {formatCurrency(product.price * quantity)}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
