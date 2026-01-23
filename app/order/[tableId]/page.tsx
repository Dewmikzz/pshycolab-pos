"use client";

import { useState, use, useEffect, useRef } from "react";
import { ProductDrawer } from "@/components/mobile/ProductDrawer";
import { CartFloatingButton } from "@/components/mobile/CartFloatingButton";
import { OrderSuccess } from "@/components/mobile/OrderSuccess";
import { ConfirmModal } from "@/components/ConfirmModal";
import { DebugMenu } from "@/components/mobile/DebugMenu";
import { usePosStore } from "@/store/usePosStore";
import { useMenuStore } from "@/store/useMenuStore";
import { formatCurrency } from "@/lib/utils";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Plus, Search, Star } from "lucide-react";
import { Product } from "@/types";
import { clsx } from "clsx";

export default function OrderPage({ params }: { params: Promise<{ tableId: string }> }) {
    const resolvedParams = use(params);
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({ container: scrollRef });

    // Header Animations
    const headerHeight = useTransform(scrollY, [0, 100], [240, 100]);
    const headerOpacity = useTransform(scrollY, [0, 80], [1, 0]);
    const headerY = useTransform(scrollY, [0, 100], [0, -50]);
    const miniHeaderOpacity = useTransform(scrollY, [120, 160], [0, 1]);

    // Store integration
    const { addToOrder, orders, setActiveTable } = usePosStore();
    const { products, categories, isLoading } = useMenuStore();

    // Stats
    const currentOrder = orders[resolvedParams.tableId];
    const itemCount = currentOrder?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
    const total = currentOrder?.total || 0;

    useEffect(() => {
        if (!isLoading && categories.length > 0 && activeCategory === "all") {
            // Keep "all" or defaulting to first is fine, but "All" is better for scrolling
            // Let's rely on filter
        }
    }, [categories, isLoading]);

    const handleAddToOrder = (product: Product, quantity: number) => {
        setActiveTable(resolvedParams.tableId);
        for (let i = 0; i < quantity; i++) {
            addToOrder(product, {}, 'sent');
        }
    };

    const handleConfirmOrder = () => {
        setIsConfirmOpen(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const filteredProducts = activeCategory === "all"
        ? products
        : products.filter(p => p.category === activeCategory);

    const recommendedProduct = products[0]; // Just picking first for hero

    if (isLoading) return (
        <div className="h-screen w-full bg-slate-50 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400 font-medium">Loading Menu...</span>
        </div>
    );

    return (
        <div className="h-screen bg-slate-50 text-slate-900 overflow-hidden relative font-sans selection:bg-orange-100 selection:text-orange-900">
            <DebugMenu />

            {/* Success Overlay */}
            {showSuccess && <OrderSuccess />}

            <ConfirmModal
                isOpen={isConfirmOpen}
                title="Confirm Order"
                message={`Are you sure you want to place this order? Total: ${formatCurrency(total)}`}
                confirmText="Place Order"
                cancelText="Makan More"
                onConfirm={handleConfirmOrder}
                onCancel={() => setIsConfirmOpen(false)}
            />

            {/* Fixed Mini Header (Appears on Scroll) */}
            <motion.div
                style={{ opacity: miniHeaderOpacity }}
                className="fixed top-0 left-0 right-0 h-[5.5rem] bg-white/80 backdrop-blur-xl z-30 flex items-end pb-3 px-6 shadow-sm pointer-events-none"
            >
                <span className="text-lg font-bold text-slate-800">Menu</span>
            </motion.div>

            {/* Scroll Container */}
            <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden relative pb-32 no-scrollbar scroll-smooth">

                {/* Hero / Welcome */}
                <motion.div
                    style={{ height: headerHeight, y: headerY }}
                    className="w-full relative px-6 pt-12 flex flex-col justify-start z-10"
                >
                    <motion.div style={{ opacity: headerOpacity }} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider">
                                Table {resolvedParams.tableId}
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 leading-[0.95] tracking-tight">
                            Selamat<br />Makan! 🍽️
                        </h1>
                        <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-[250px]">
                            Ready to explore the best local flavors?
                        </p>
                    </motion.div>
                </motion.div>

                {/* Search Bar (Fake) */}
                <div className="px-6 -mt-8 mb-6 relative z-20">
                    <div className="w-full h-12 bg-white rounded-2xl shadow-xl shadow-slate-200/50 flex items-center px-4 gap-3 text-slate-400">
                        <Search size={20} />
                        <span className="text-sm font-medium">Search for "Nasi Lemak"...</span>
                    </div>
                </div>

                {/* Category Pills (Sticky) */}
                <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm py-2 pl-6 mb-4 overflow-x-auto no-scrollbar mask-gradient-right">
                    <div className="flex gap-3 pr-6">
                        <CategoryPill
                            label="All"
                            active={activeCategory === "all"}
                            onClick={() => setActiveCategory("all")}
                        />
                        {categories.map(cat => (
                            <CategoryPill
                                key={cat.id}
                                label={cat.label}
                                active={activeCategory === cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Featured Item (Only if 'all' selected) */}
                {activeCategory === "all" && recommendedProduct && (
                    <div className="px-6 mb-8">
                        <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
                            <Star size={18} className="fill-yellow-400 text-yellow-400" /> Must Try
                        </h3>
                        <div
                            onClick={() => setSelectedProduct(recommendedProduct)}
                            className="h-64 w-full rounded-[2rem] bg-white shadow-xl shadow-orange-500/10 overflow-hidden relative cursor-pointer group"
                        >
                            <img src={recommendedProduct.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="featured" />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-20">
                                <h4 className="text-white font-black text-2xl">{recommendedProduct.name}</h4>
                                <p className="text-white/80 text-sm line-clamp-1">{recommendedProduct.description}</p>
                                <span className="absolute bottom-6 right-6 bg-white text-slate-900 px-3 py-1 rounded-full font-bold text-sm">
                                    {formatCurrency(recommendedProduct.price)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Product List (Masonry-ish) */}
                <div className="px-6 min-h-[500px]">
                    <h3 className="text-lg font-black text-slate-800 mb-4 ml-1">
                        {activeCategory === "all" ? "Full Menu" : categories.find(c => c.id === activeCategory)?.label}
                    </h3>

                    <div className="grid grid-cols-1 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((product, i) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onClick={() => setSelectedProduct(product)}
                                    index={i}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="py-20 text-center opacity-50">
                            <p>No items found.</p>
                        </div>
                    )}
                </div>

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

function CategoryPill({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all active:scale-95",
                active
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                    : "bg-white text-slate-500 hover:text-slate-800 border border-slate-100"
            )}
        >
            {label}
        </button>
    )
}

function ProductCard({ product, onClick, index }: { product: Product, onClick: () => void, index: number }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className="flex gap-4 p-4 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-orange-500/5 transition-all cursor-pointer active:scale-[0.98]"
        >
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                {product.image && <img src={product.image} className="w-full h-full object-cover" alt={product.name} />}
            </div>

            <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                    <h4 className="font-bold text-slate-800 text-lg leading-tight">{product.name}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{product.description}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <span className="font-black text-slate-900 text-lg">{formatCurrency(product.price)}</span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                        <Plus size={16} />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
