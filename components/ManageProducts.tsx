"use client";

import { useState } from "react";
import { Product, Category, ModifierGroup } from "@/types";
import { useMenuStore } from "@/store/useMenuStore";
import { addProduct, updateProduct, deleteProduct } from "@/services/menuService";
import { ConfirmModal } from "./ConfirmModal";
import { useToast } from "./Toast";
import { Plus, Trash2, Edit, X, Package, CheckSquare, Square, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { formatCurrency } from "@/lib/utils";

export function ManageProducts() {
    const { products, categories, modifierGroups } = useMenuStore();
    const { showToast } = useToast();

    // UI State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");

    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const handleSave = async () => {
        if (!editingProduct?.name) return showToast("Name is required", "error");
        if (!editingProduct?.category) return showToast("Category is required", "error");
        if (editingProduct.price === undefined) return showToast("Price is required", "error");

        try {
            if (editingProduct.id) {
                await updateProduct(editingProduct as Product);
                showToast("Product updated", "success");
            } else {
                await addProduct(editingProduct as Omit<Product, "id">);
                showToast("Product created", "success");
            }
            setEditingProduct(null);
        } catch (e: any) {
            showToast("Failed to save: " + e.message, "error");
        }
    };

    const handleDelete = async () => {
        if (!confirmDeleteId) return;
        try {
            await deleteProduct(confirmDeleteId);
            showToast("Product deleted", "success");
        } catch (e: any) {
            showToast("Failed to delete", "error");
        }
        setConfirmDeleteId(null);
    };

    const toggleModifierGroup = (groupId: string) => {
        if (!editingProduct) return;
        const currentGroups = editingProduct.modifierGroups || [];
        if (currentGroups.includes(groupId)) {
            setEditingProduct({
                ...editingProduct,
                modifierGroups: currentGroups.filter(id => id !== groupId)
            });
        } else {
            setEditingProduct({
                ...editingProduct,
                modifierGroups: [...currentGroups, groupId]
            });
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = filterCategory === "all" || p.category === filterCategory;
        return matchesSearch && matchesCat;
    });

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-white">Products</h2>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-pos-text-secondary" />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search products..."
                            className="w-full bg-pos-panel border border-pos-border rounded-lg pl-10 pr-4 py-2 text-white focus:border-pos-accent outline-none"
                        />
                    </div>
                    <button
                        onClick={() => setEditingProduct({ name: "", price: 0, category: categories[0]?.id || "", modifierGroups: [] })}
                        className="px-4 py-2 bg-pos-accent text-white rounded-lg flex items-center gap-2 hover:brightness-110 shrink-0"
                    >
                        <Plus size={18} /> New
                    </button>
                </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                    onClick={() => setFilterCategory("all")}
                    className={clsx(
                        "px-4 py-2 rounded-full text-sm font-bold border transition-colors whitespace-nowrap",
                        filterCategory === "all"
                            ? "bg-pos-accent text-white border-pos-accent"
                            : "bg-pos-panel text-pos-text-secondary border-pos-border hover:text-white"
                    )}
                >
                    All Items
                </button>
                {categories.map(c => (
                    <button
                        key={c.id}
                        onClick={() => setFilterCategory(c.id)}
                        className={clsx(
                            "px-4 py-2 rounded-full text-sm font-bold border transition-colors whitespace-nowrap",
                            filterCategory === c.id
                                ? "bg-pos-accent text-white border-pos-accent"
                                : "bg-pos-panel text-pos-text-secondary border-pos-border hover:text-white"
                        )}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pb-20">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-pos-panel text-pos-text-secondary text-xs uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-4 rounded-tl-xl">Product</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Modifiers</th>
                            <th className="p-4 text-right rounded-tr-xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-pos-border bg-pos-panel/50">
                        {filteredProducts.map(p => {
                            const cat = categories.find(c => c.id === p.category);
                            return (
                                <tr key={p.id} className="hover:bg-pos-bg transition-colors">
                                    <td className="p-4 font-bold text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-pos-bg flex items-center justify-center text-2xl">
                                                🍽️
                                            </div>
                                            <div>
                                                <div>{p.name}</div>
                                                <div className="text-xs text-pos-text-secondary font-normal line-clamp-1">{p.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-pos-text-secondary">
                                        <span className="px-2 py-1 rounded bg-pos-bg border border-pos-border text-xs">
                                            {cat?.label || "Unknown"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-white font-mono">{formatCurrency(p.price)}</td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                            {/* Inherited */}
                                            {cat?.modifierGroups?.map(gid => (
                                                <span key={`cat-${gid}`} className="w-2 h-2 rounded-full bg-pos-text-secondary/50" title="Inherited from Category" />
                                            ))}
                                            {/* Specific */}
                                            {p.modifierGroups?.map(gid => (
                                                <span key={`prod-${gid}`} className="w-2 h-2 rounded-full bg-pos-accent" title="Product Specific" />
                                            ))}
                                            {(!cat?.modifierGroups?.length && !p.modifierGroups?.length) && (
                                                <span className="text-xs text-pos-text-secondary italic">-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setEditingProduct(p)} className="p-2 bg-pos-bg rounded text-pos-text-secondary hover:text-white hover:bg-pos-border">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => setConfirmDeleteId(p.id)} className="p-2 bg-red-500/10 rounded text-red-500 hover:bg-red-500 hover:text-white">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Edit/Create Modal */}
            <AnimatePresence>
                {editingProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-pos-panel w-full max-w-2xl max-h-[90vh] rounded-2xl flex flex-col border border-pos-border shadow-2xl"
                        >
                            <div className="p-4 border-b border-pos-border flex justify-between items-center bg-pos-bg rounded-t-2xl">
                                <h3 className="text-xl font-bold text-white">{editingProduct.id ? "Edit Product" : "New Product"}</h3>
                                <button onClick={() => setEditingProduct(null)}><X size={24} className="text-pos-text-secondary hover:text-white" /></button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs uppercase text-pos-text-secondary font-bold mb-1">Product Name</label>
                                        <input
                                            value={editingProduct.name}
                                            onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                            className="w-full bg-pos-bg border border-pos-border rounded-lg p-3 text-white focus:border-pos-accent outline-none"
                                            placeholder="e.g. Burger"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs uppercase text-pos-text-secondary font-bold mb-1">Description (Optional)</label>
                                        <textarea
                                            value={editingProduct.description || ""}
                                            onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                            className="w-full bg-pos-bg border border-pos-border rounded-lg p-3 text-white focus:border-pos-accent outline-none"
                                            rows={2}
                                            placeholder="Tasty details..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase text-pos-text-secondary font-bold mb-1">Category</label>
                                        <select
                                            value={editingProduct.category}
                                            onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                            className="w-full bg-pos-bg border border-pos-border rounded-lg p-3 text-white focus:border-pos-accent outline-none appearance-none"
                                        >
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <label className="block text-xs uppercase text-pos-text-secondary font-bold mb-1">Price</label>
                                        <span className="absolute left-3 top-[34px] text-pos-text-secondary">$</span>
                                        <input
                                            type="number"
                                            value={editingProduct.price}
                                            onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                                            className="w-full bg-pos-bg border border-pos-border rounded-lg p-3 pl-6 text-white focus:border-pos-accent outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Modifier Overrides */}
                                <div>
                                    <label className="block text-xs uppercase text-pos-text-secondary font-bold mb-2">
                                        Additional Modifiers (Overrides Category defaults)
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar bg-pos-bg rounded-lg p-3 border border-pos-border">
                                        {modifierGroups.map(group => {
                                            const isSelected = editingProduct.modifierGroups?.includes(group.id);
                                            // Check if inherited
                                            const category = categories.find(c => c.id === editingProduct.category);
                                            const isInherited = category?.modifierGroups?.includes(group.id);

                                            if (isInherited) {
                                                return (
                                                    <div key={group.id} className="flex items-center gap-3 p-2 rounded-lg opacity-50 cursor-not-allowed">
                                                        <CheckSquare size={18} className="text-pos-text-secondary" />
                                                        <span className="text-sm font-medium text-pos-text-secondary">{group.label} (Inherited)</span>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <button
                                                    key={group.id}
                                                    onClick={() => toggleModifierGroup(group.id)}
                                                    className={clsx(
                                                        "flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                                                        isSelected ? "bg-pos-accent/20 text-white" : "hover:bg-pos-panel text-pos-text-secondary"
                                                    )}
                                                >
                                                    {isSelected ? <CheckSquare size={18} className="text-pos-accent" /> : <Square size={18} />}
                                                    <span className="text-sm font-medium">{group.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-pos-border bg-pos-bg rounded-b-2xl flex justify-end gap-3">
                                <button onClick={() => setEditingProduct(null)} className="px-6 py-3 rounded-xl border border-pos-border text-pos-text-secondary font-bold hover:bg-pos-border">
                                    Cancel
                                </button>
                                <button onClick={handleSave} className="px-6 py-3 rounded-xl bg-pos-accent text-white font-bold hover:brightness-110 shadow-lg shadow-pos-accent/20">
                                    Save Product
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={!!confirmDeleteId}
                title="Delete Product?"
                message="This action cannot be undone."
                isDanger
                onConfirm={handleDelete}
                onCancel={() => setConfirmDeleteId(null)}
            />
        </div>
    );
}
