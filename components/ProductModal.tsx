"use client";

import { useState, useMemo } from "react";
import { Product, ModifierGroup, ModifierOption, CartItem } from "@/types";
import { useMenuStore } from "@/store/useMenuStore";
import { usePosStore } from "@/store/usePosStore";
import { formatCurrency } from "@/lib/utils";
import { X, Check, ShoppingCart } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";

interface ProductModalProps {
    product: Product;
    onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
    const { getModifiersForProduct } = useMenuStore();
    const { addToOrder } = usePosStore();

    const modifierGroups = useMemo(() => getModifiersForProduct(product), [product, getModifiersForProduct]);

    // State to track selected options: { groupId: [option1, option2] }
    const [selectedModifiers, setSelectedModifiers] = useState<Record<string, ModifierOption[]>>(() => {
        // Initialize required singles (optional but good UX to pre-select first if required? Maybe not)
        return {};
    });

    const handleToggleOption = (group: ModifierGroup, option: ModifierOption) => {
        setSelectedModifiers(prev => {
            const current = prev[group.id] || [];
            const isSelected = current.some(o => o.id === option.id);

            if (group.selectionType === 'single') {
                // If single, replace current (or toggle off if allowed? usually single required = forced switch)
                return { ...prev, [group.id]: [option] };
            } else {
                // Multiple
                if (isSelected) {
                    return { ...prev, [group.id]: current.filter(o => o.id !== option.id) };
                } else {
                    if (group.maxSelection !== -1 && current.length >= group.maxSelection) {
                        return prev; // Max limit reached
                    }
                    return { ...prev, [group.id]: [...current, option] };
                }
            }
        });
    };

    // Calculate total price
    const unitPrice = product.price + Object.values(selectedModifiers).flat().reduce((sum, opt) => sum + opt.price, 0);

    // Validation
    const isValid = modifierGroups.every(group => {
        const selected = selectedModifiers[group.id] || [];
        if (group.minSelection > 0 && selected.length < group.minSelection) return false;
        return true;
    });

    const handleAddToCart = () => {
        if (!isValid) return;

        // Construct item with modifiers
        const finalProduct: Product = { ...product }; // logic in store handles cart item creation, we just need to pass modifiers?
        // Actually addToOrder takes a Product currently. We need to pass modifiers too.
        // We will update addToOrder store signature next.
        // For now, assume we can pass an enhanced object or a second arg. 
        // Let's pass the modifiers in a way the store can support.
        addToOrder(product, selectedModifiers);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-pos-panel w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-pos-border"
            >
                {/* Header */}
                <div className="relative h-48 bg-pos-bg shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">🍽️</div>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 md:hidden">
                        <X size={20} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-pos-panel to-transparent">
                        <h2 className="text-3xl font-bold text-white">{product.name}</h2>
                        <p className="text-pos-pos-text-secondary line-clamp-2">{product.description || "Freshly prepared for you."}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {modifierGroups.length === 0 && (
                        <p className="text-pos-text-secondary text-center italic">No options available for this item.</p>
                    )}

                    {modifierGroups.map(group => {
                        const currentSelected = selectedModifiers[group.id] || [];
                        const isSatisfied = group.minSelection === 0 || currentSelected.length >= group.minSelection;

                        return (
                            <div key={group.id} className="space-y-3">
                                <div className="flex justify-between items-center sticky top-0 bg-pos-panel py-2 z-10">
                                    <div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            {group.label}
                                            {!isSatisfied && <span className="text-red-500 text-xs px-2 py-0.5 bg-red-500/10 rounded-full font-bold">Required</span>}
                                        </h3>
                                        <p className="text-xs text-pos-text-secondary">
                                            {group.selectionType === 'single' ? 'Pick 1' : `Select up to ${group.maxSelection === -1 ? 'unlimited' : group.maxSelection}`}
                                        </p>
                                    </div>
                                    <div className="bg-pos-bg px-3 py-1 rounded-full text-xs font-bold text-pos-text-secondary border border-pos-border">
                                        {currentSelected.length} selected
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {group.options.map(option => {
                                        const isSelected = currentSelected.some(o => o.id === option.id);
                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => handleToggleOption(group, option)}
                                                className={clsx(
                                                    "flex items-center justify-between p-4 rounded-xl border transition-all text-left group",
                                                    isSelected
                                                        ? "bg-pos-accent text-white border-pos-accent shadow-lg shadow-pos-accent/20"
                                                        : "bg-pos-bg text-pos-text-secondary border-pos-border hover:border-pos-text-secondary/50"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={clsx(
                                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                                        isSelected ? "border-white bg-white text-pos-accent" : "border-pos-text-secondary/50"
                                                    )}>
                                                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                                                    </div>
                                                    <span className={clsx("font-medium", isSelected ? "text-white" : "text-white")}>{option.label}</span>
                                                </div>
                                                {option.price > 0 && (
                                                    <span className={clsx("text-sm font-bold", isSelected ? "text-white/90" : "text-pos-text-primary")}>
                                                        +{formatCurrency(option.price)}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-pos-border bg-pos-bg/50">
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-4 rounded-xl font-bold bg-pos-panel border border-pos-border text-white hover:bg-pos-border transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddToCart}
                            disabled={!isValid}
                            className={clsx(
                                "flex-1 rounded-xl font-bold flex items-center justify-between px-8 py-4 transition-all shadow-lg",
                                isValid
                                    ? "bg-pos-accent text-white hover:brightness-110 shadow-pos-accent/25"
                                    : "bg-pos-border text-pos-text-secondary cursor-not-allowed opacity-50"
                            )}
                        >
                            <span>Add to Order</span>
                            <span className="bg-black/20 px-3 py-1 rounded-lg">
                                {formatCurrency(unitPrice)}
                            </span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
