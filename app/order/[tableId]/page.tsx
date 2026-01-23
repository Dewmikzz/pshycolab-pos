"use client";

import { useState, use, useEffect } from "react";
import { CategoryStories } from "@/components/mobile/CategoryStories";
import { ProductDrawer } from "@/components/mobile/ProductDrawer";
import { CartFloatingButton } from "@/components/mobile/CartFloatingButton";
import { OrderSuccess } from "@/components/mobile/OrderSuccess";
import { ConfirmModal } from "@/components/ConfirmModal";
import { usePosStore } from "@/store/usePosStore";
import { useMenuStore } from "@/store/useMenuStore";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Product } from "@/types";

export default function OrderPage({ params }: { params: Promise<{ tableId: string }> }) {
    const resolvedParams = use(params);
    const [activeCategory, setActiveCategory] = useState<string>("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Store integration
    const { addToOrder, orders, setActiveTable } = usePosStore();
    const { products, categories, isLoading } = useMenuStore();

    // Set initial category
    useEffect(() => {
        if (!isLoading && categories.length > 0 && !activeCategory) {
            setActiveCategory(categories[0].id);
        }
    }, [categories, isLoading, activeCategory]);

    const currentOrder = orders[resolvedParams.tableId];
    const itemCount = currentOrder?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
    const total = currentOrder?.total || 0;

    const handleAddToOrder = (product: Product, quantity: number) => {
        setActiveTable(resolvedParams.tableId); // Set context
        for (let i = 0; i < quantity; i++) {
            addToOrder(product);
        }
    };

    const handleConfirmOrder = () => {
        setIsConfirmOpen(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const filteredProducts = products.filter(p => p.category === activeCategory);

    const currentCategoryLabel = categories.find(c => c.id === activeCategory)?.label || "";

    if (isLoading) return <div className="h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="pb-32 min-h-screen bg-pos-bg text-white">
            {/* Success Overlay */}
            {showSuccess && <OrderSuccess />}

            <ConfirmModal
                isOpen={isConfirmOpen}
                title="Confirm Order"
                message={`Are you sure you want to place this order? Total: ${formatCurrency(total)}`}
                confirmText="Place Order"
                cancelText="Keep Ordering"
                onConfirm={handleConfirmOrder}
                onCancel={() => setIsConfirmOpen(false)}
            />

            {/* Header */}
            <div className="px-6 pt-8 pb-2 flex justify-between items-end">
                <div>
                    <h2 className="text-pos-text-secondary text-sm font-medium uppercase tracking-wider mb-1">Table {resolvedParams.tableId}</h2>
                    <h1 className="text-3xl font-bold leading-none">What are you<br />craving?</h1>
                </div>
                <div className="w-10 h-10 rounded-full bg-pos-panel border border-pos-border flex items-center justify-center">
                    <span className="text-xl">🙂</span>
                </div>
            </div>

            {/* Categories */}
            <CategoryStories activeCategory={activeCategory} onSelect={setActiveCategory} />

            {/* Product List */}
            <div className="px-4 space-y-4">
                {currentCategoryLabel && (
                    <h3 className="text-lg font-bold px-2 sticky top-0 bg-pos-bg/80 backdrop-blur z-10 py-4">
                        {currentCategoryLabel}
                    </h3>
                )}

                {filteredProducts.map((product) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setSelectedProduct(product)}
                        className="bg-pos-panel rounded-3xl p-4 flex gap-4 relative overflow-hidden group active:scale-[0.98] transition-all cursor-pointer"
                    >
                        <div className="w-24 h-24 bg-pos-bg rounded-2xl flex-shrink-0 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-pos-border/50 to-transparent" />
                        </div>

                        <div className="flex-1 py-1 flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold text-lg leading-tight mb-1">{product.name}</h4>
                                <p className="text-pos-text-secondary text-xs line-clamp-2">Delicious item description...</p>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="font-bold text-pos-accent text-lg">{formatCurrency(product.price)}</span>
                                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                                    <Plus size={18} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {filteredProducts.length === 0 && (
                    <div className="text-center text-pos-text-secondary py-10">
                        No items in this category.
                    </div>
                )}
            </div>

            {/* Floating Cart Button */}
            <CartFloatingButton
                itemCount={itemCount}
                total={total}
                onViewCart={() => {
                    if (itemCount > 0) {
                        setIsConfirmOpen(true);
                    }
                }}
            />

            {/* Product Drawer */}
            <ProductDrawer
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onAddToOrder={handleAddToOrder}
            />
        </div>
    );
}
