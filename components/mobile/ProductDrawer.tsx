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
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2.5rem] overflow-hidden max-w-md mx-auto shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-4 pb-2">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                        </div>

                        {/* Content */}
                        <div className="p-8 pt-2 pb-10">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-3xl font-black text-slate-800 pr-4 leading-none tracking-tight">{product.name}</h2>
                                <button
                                    onClick={onClose}
                                    className="bg-gray-100 p-2 rounded-full text-slate-500 hover:bg-gray-200 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="w-full aspect-video bg-gray-50 rounded-3xl mb-8 relative overflow-hidden shadow-inner border border-gray-100">
                                {product.image && <img src={product.image} className="w-full h-full object-cover" />}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                    <p className="text-white/90 font-medium text-sm leading-relaxed">
                                        {product.description || "Freshly prepared with premium ingredients. Enjoy the taste of quality."}
                                    </p>
                                </div>
                            </div>

                            {/* Quantity & Action */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-gray-100 rounded-full p-1.5 border border-gray-200 shadow-inner">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-slate-900 shadow-sm active:scale-90 transition-all border border-gray-100"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <span className="w-14 text-center font-black text-2xl text-slate-800">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/20 active:scale-90 transition-all"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <button
                                    onClick={() => {
                                        onAddToOrder(product, quantity);
                                        onClose();
                                    }}
                                    className="flex-1 bg-orange-600 h-16 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-xl shadow-orange-600/30 active:scale-[0.98] transition-all hover:bg-orange-500"
                                >
                                    Add <span className="mx-2 opacity-50">|</span> {formatCurrency(product.price * quantity)}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
