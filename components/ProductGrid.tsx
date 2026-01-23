"use client";

import { useState, useEffect } from "react";
import { usePosStore } from "@/store/usePosStore";
import { useMenuStore } from "@/store/useMenuStore";
import { formatCurrency } from "@/lib/utils";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { ProductModal } from "./ProductModal";
import { Product } from "@/types";

export function ProductGrid() {
    const { addToOrder } = usePosStore();
    const { products, categories, isLoading } = useMenuStore();

    // Default to first category if available, else "all" or explicit check
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Effect to set active category once loaded
    useEffect(() => {
        if (!isLoading && categories.length > 0 && activeCategory === "all") {
            setActiveCategory(categories[0].id);
        }
    }, [categories, isLoading, activeCategory]);

    const filteredProducts = activeCategory === "all"
        ? products
        : products.filter((p) => p.category === activeCategory);

    if (isLoading) {
        return <div className="flex-1 flex items-center justify-center p-8 text-pos-text-secondary" suppressHydrationWarning>Loading Menu...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-pos-bg">
            {/* Category Tabs */}
            <div className="flex overflow-x-auto gap-2 p-4 border-b border-pos-border no-scrollbar bg-pos-bg">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={clsx(
                            "px-6 py-3 rounded-full text-base font-bold whitespace-nowrap transition-all",
                            activeCategory === cat.id
                                ? "bg-pos-text-primary text-pos-bg shadow-md"
                                : "bg-pos-panel text-pos-text-secondary hover:bg-pos-border hover:text-white"
                        )}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start">
                {filteredProducts.map((product) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className="group bg-pos-panel rounded-2xl p-4 cursor-pointer hover:bg-pos-border active:scale-95 transition-all flex flex-col items-center text-center gap-3 border border-transparent hover:border-pos-text-secondary/20"
                    >
                        <div className="w-full aspect-square bg-pos-bg rounded-xl flex items-center justify-center text-pos-text-secondary text-4xl overflow-hidden relative">
                            {/* Image placeholder or real image */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/0" />
                            <span className="group-hover:scale-110 transition-transform duration-300">🍽️</span>
                        </div>
                        <div className="w-full">
                            <h3 className="font-bold text-white leading-tight truncate px-1">{product.name}</h3>
                            <p className="text-pos-accent font-bold mt-1">{formatCurrency(product.price)}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {selectedProduct && (
                    <ProductModal
                        product={selectedProduct}
                        onClose={() => setSelectedProduct(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
