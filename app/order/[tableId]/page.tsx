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
            addToOrder(product, {}, 'sent');
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
        <div className="pb-32 min-h-screen bg-gray-50 text-slate-900">
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
            <div className="px-6 pt-12 pb-4 flex justify-between items-end bg-white/50 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h2 className="text-orange-600 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        Table {resolvedParams.tableId}
                    </h2>
                    <h1 className="text-3xl font-black leading-none text-slate-800 tracking-tight">
                        What are you<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">craving?</span>
                    </h1>
                </motion.div>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-xl shadow-orange-500/10 flex items-center justify-center overflow-hidden"
                >
                    <img src="https://ui-avatars.com/api/?name=Guest&background=random" alt="Guest" />
                </motion.div>
            </div>

            {/* Categories */}
            <CategoryStories activeCategory={activeCategory} onSelect={setActiveCategory} />

            {/* Product List */}
            <div className="px-4 space-y-4 pt-2">
                {currentCategoryLabel && (
                    <div className="flex items-center gap-4 px-2 py-4">
                        <h3 className="text-xl font-bold text-slate-800">
                            {currentCategoryLabel}
                        </h3>
                        <div className="h-px flex-1 bg-gray-200"></div>
                    </div>
                )}

                {filteredProducts.map((product, i) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedProduct(product)}
                        className="bg-white rounded-[2rem] p-4 flex gap-4 relative overflow-hidden group active:scale-[0.98] transition-all cursor-pointer shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-orange-500/5"
                    >
                        <div className="w-28 h-28 bg-gray-100 rounded-3xl flex-shrink-0 relative overflow-hidden shadow-inner">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300"></div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 py-1 flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold text-lg leading-tight mb-2 text-slate-800">{product.name}</h4>
                                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                                    {product.description || "Freshly prepared with premium ingredients."}
                                </p>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                                <span className="font-bold text-slate-900 text-lg">{formatCurrency(product.price)}</span>
                                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20 group-hover:bg-orange-500 group-hover:scale-110 transition-all">
                                    <Plus size={20} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {filteredProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full mb-4 animate-pulse"></div>
                        <p>No items in this category.</p>
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
