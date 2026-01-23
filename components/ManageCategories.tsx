"use client";

import { useState } from "react";
import { Category, ModifierGroup } from "@/types";
import { useMenuStore } from "@/store/useMenuStore";
import { addCategory, updateCategory, deleteCategory } from "@/services/menuService";
import { ConfirmModal } from "./ConfirmModal";
import { useToast } from "./Toast";
import { Plus, Trash2, Edit, X, Archive, CheckSquare, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

export function ManageCategories() {
    const { categories, modifierGroups } = useMenuStore();
    const { showToast } = useToast();

    const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const handleSave = async () => {
        if (!editingCategory?.label) return showToast("Label is required", "error");

        try {
            if (editingCategory.id) {
                await updateCategory(editingCategory as Category);
                showToast("Category updated", "success");
            } else {
                await addCategory(editingCategory as Omit<Category, "id">);
                showToast("Category created", "success");
            }
            setEditingCategory(null);
        } catch (e: any) {
            showToast("Failed to save: " + e.message, "error");
        }
    };

    const handleDelete = async () => {
        if (!confirmDeleteId) return;
        try {
            await deleteCategory(confirmDeleteId);
            showToast("Category deleted", "success");
        } catch (e: any) {
            showToast("Failed to delete", "error");
        }
        setConfirmDeleteId(null);
    };

    const toggleModifierGroup = (groupId: string) => {
        if (!editingCategory) return;
        const currentGroups = editingCategory.modifierGroups || [];
        if (currentGroups.includes(groupId)) {
            setEditingCategory({
                ...editingCategory,
                modifierGroups: currentGroups.filter(id => id !== groupId)
            });
        } else {
            setEditingCategory({
                ...editingCategory,
                modifierGroups: [...currentGroups, groupId]
            });
        }
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Categories</h2>
                <button
                    onClick={() => setEditingCategory({ label: "", modifierGroups: [] })}
                    className="px-4 py-2 bg-pos-accent text-white rounded-lg flex items-center gap-2 hover:brightness-110"
                >
                    <Plus size={18} /> New Category
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-20">
                {categories.map(category => (
                    <motion.div
                        layout
                        key={category.id}
                        className="bg-pos-panel border border-pos-border p-4 rounded-xl space-y-3"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-pos-bg flex items-center justify-center text-pos-accent">
                                    <Archive size={20} />
                                </div>
                                <h3 className="font-bold text-white text-lg">{category.label}</h3>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingCategory(category)} className="p-2 bg-pos-bg rounded text-pos-text-secondary hover:text-white">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => setConfirmDeleteId(category.id)} className="p-2 bg-red-500/10 rounded text-red-500 hover:bg-red-500 hover:text-white">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-pos-bg/50 rounded-lg p-3">
                            <p className="text-xs text-pos-text-secondary font-bold mb-2 uppercase">Effective Modifiers</p>
                            <div className="flex flex-wrap gap-2">
                                {category.modifierGroups && category.modifierGroups.length > 0 ? (
                                    category.modifierGroups.map(gid => {
                                        const group = modifierGroups.find(g => g.id === gid);
                                        return group ? (
                                            <span key={gid} className="px-2 py-1 bg-pos-panel border border-pos-border rounded text-xs text-white">
                                                {group.label}
                                            </span>
                                        ) : null;
                                    })
                                ) : (
                                    <span className="text-xs text-pos-text-secondary italic">None assigned</span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Edit/Create Modal */}
            <AnimatePresence>
                {editingCategory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-pos-panel w-full max-w-lg rounded-2xl flex flex-col border border-pos-border shadow-2xl"
                        >
                            <div className="p-4 border-b border-pos-border flex justify-between items-center bg-pos-bg rounded-t-2xl">
                                <h3 className="text-xl font-bold text-white">{editingCategory.id ? "Edit Category" : "New Category"}</h3>
                                <button onClick={() => setEditingCategory(null)}><X size={24} className="text-pos-text-secondary hover:text-white" /></button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-xs uppercase text-pos-text-secondary font-bold mb-1">Label</label>
                                    <input
                                        value={editingCategory.label}
                                        onChange={e => setEditingCategory({ ...editingCategory, label: e.target.value })}
                                        className="w-full bg-pos-bg border border-pos-border rounded-lg p-3 text-white focus:border-pos-accent outline-none"
                                        placeholder="Category Name"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase text-pos-text-secondary font-bold mb-2">Apply Modifier Groups</label>
                                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar bg-pos-bg rounded-lg p-2 border border-pos-border">
                                        {modifierGroups.map(group => {
                                            const isSelected = editingCategory.modifierGroups?.includes(group.id);
                                            return (
                                                <button
                                                    key={group.id}
                                                    onClick={() => toggleModifierGroup(group.id)}
                                                    className={clsx(
                                                        "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                                                        isSelected ? "bg-pos-accent/20 text-white" : "hover:bg-pos-panel text-pos-text-secondary"
                                                    )}
                                                >
                                                    {isSelected ? <CheckSquare size={18} className="text-pos-accent" /> : <Square size={18} />}
                                                    <span className="text-sm font-medium">{group.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-pos-text-secondary mt-2">
                                        Products in this category will automatically inherit these modifier options.
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 border-t border-pos-border bg-pos-bg rounded-b-2xl flex justify-end gap-3">
                                <button onClick={() => setEditingCategory(null)} className="px-6 py-3 rounded-xl border border-pos-border text-pos-text-secondary font-bold hover:bg-pos-border">
                                    Cancel
                                </button>
                                <button onClick={handleSave} className="px-6 py-3 rounded-xl bg-pos-accent text-white font-bold hover:brightness-110 shadow-lg shadow-pos-accent/20">
                                    Save Category
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={!!confirmDeleteId}
                title="Delete Category?"
                message="Products in this category will need reassignment."
                isDanger
                onConfirm={handleDelete}
                onCancel={() => setConfirmDeleteId(null)}
            />
        </div>
    );
}
