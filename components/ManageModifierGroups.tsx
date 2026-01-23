"use client";

import { useState } from "react";
import { ModifierGroup, ModifierOption } from "@/types";
import { useMenuStore } from "@/store/useMenuStore";
import { addModifierGroup, updateModifierGroup, deleteModifierGroup } from "@/services/menuService";
import { ConfirmModal } from "./ConfirmModal";
import { useToast } from "./Toast";
import { Plus, Trash2, Edit, Save, X, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

export function ManageModifierGroups() {
    const { modifierGroups } = useMenuStore();
    const { showToast } = useToast();

    const [editingGroup, setEditingGroup] = useState<Partial<ModifierGroup> | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const handleSave = async () => {
        if (!editingGroup?.label) return showToast("Label is required", "error");

        // Ensure options exist
        const groupToSave = {
            ...editingGroup,
            options: editingGroup.options || [],
            selectionType: editingGroup.selectionType || 'single',
            minSelection: editingGroup.minSelection ?? 0,
            maxSelection: editingGroup.maxSelection ?? 1
        } as ModifierGroup; // Cast for now, ignoring ID check for new items

        try {
            if (groupToSave.id) {
                await updateModifierGroup(groupToSave);
                showToast("Modifier Group updated", "success");
            } else {
                await addModifierGroup(groupToSave);
                showToast("Modifier Group created", "success");
            }
            setEditingGroup(null);
        } catch (e: any) {
            showToast("Failed to save: " + e.message, "error");
        }
    };

    const handleDelete = async () => {
        if (!confirmDeleteId) return;
        try {
            await deleteModifierGroup(confirmDeleteId);
            showToast("Modifier Group deleted", "success");
        } catch (e: any) {
            showToast("Failed to delete", "error");
        }
        setConfirmDeleteId(null);
    };

    // Helper to update options in the edit form
    const updateOption = (index: number, field: keyof ModifierOption, value: any) => {
        if (!editingGroup?.options) return;
        const newOptions = [...editingGroup.options];
        newOptions[index] = { ...newOptions[index], [field]: value };
        setEditingGroup({ ...editingGroup, options: newOptions });
    };

    const addOption = () => {
        const option: ModifierOption = { id: Date.now().toString(), label: "New Option", price: 0 };
        setEditingGroup({ ...editingGroup, options: [...(editingGroup?.options || []), option] });
    };

    const removeOption = (index: number) => {
        if (!editingGroup?.options) return;
        const newOptions = editingGroup.options.filter((_, i) => i !== index);
        setEditingGroup({ ...editingGroup, options: newOptions });
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Modifier Groups</h2>
                <button
                    onClick={() => setEditingGroup({
                        label: "",
                        selectionType: 'single',
                        minSelection: 1,
                        maxSelection: 1,
                        options: []
                    })}
                    className="px-4 py-2 bg-pos-accent text-white rounded-lg flex items-center gap-2 hover:brightness-110"
                >
                    <Plus size={18} /> New Group
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-20">
                {modifierGroups.map(group => (
                    <motion.div
                        layout
                        key={group.id}
                        className="bg-pos-panel border border-pos-border p-4 rounded-xl space-y-3"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-white text-lg">{group.label}</h3>
                                <p className="text-xs text-pos-text-secondary">
                                    {group.selectionType === 'single' ? 'Single Select' : 'Multi Select'} •
                                    Min: {group.minSelection}, Max: {group.maxSelection === -1 ? '∞' : group.maxSelection}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingGroup(group)} className="p-2 bg-pos-bg rounded text-pos-text-secondary hover:text-white">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => setConfirmDeleteId(group.id)} className="p-2 bg-red-500/10 rounded text-red-500 hover:bg-red-500 hover:text-white">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-pos-bg rounded-lg p-2 space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                            {group.options.map((opt, i) => (
                                <div key={i} className="flex justify-between text-sm text-pos-text-primary px-2 py-1 bg-pos-panel/50 rounded">
                                    <span>{opt.label}</span>
                                    <span className="opacity-70">+{opt.price}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Edit/Create Modal */}
            <AnimatePresence>
                {editingGroup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-pos-panel w-full max-w-2xl max-h-[90vh] rounded-2xl flex flex-col border border-pos-border shadow-2xl"
                        >
                            <div className="p-4 border-b border-pos-border flex justify-between items-center bg-pos-bg rounded-t-2xl">
                                <h3 className="text-xl font-bold text-white">{editingGroup.id ? "Edit Group" : "New Modifier Group"}</h3>
                                <button onClick={() => setEditingGroup(null)}><X size={24} className="text-pos-text-secondary hover:text-white" /></button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs uppercase text-pos-text-secondary font-bold mb-1">Group Label</label>
                                        <input
                                            value={editingGroup.label}
                                            onChange={e => setEditingGroup({ ...editingGroup, label: e.target.value })}
                                            className="w-full bg-pos-bg border border-pos-border rounded-lg p-3 text-white focus:border-pos-accent outline-none"
                                            placeholder="e.g. Sugar Level"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase text-pos-text-secondary font-bold mb-1">Type</label>
                                        <select
                                            value={editingGroup.selectionType}
                                            onChange={e => setEditingGroup({ ...editingGroup, selectionType: e.target.value as 'single' | 'multiple' })}
                                            className="w-full bg-pos-bg border border-pos-border rounded-lg p-3 text-white focus:border-pos-accent outline-none appearance-none"
                                        >
                                            <option value="single">Single Select (One Choice)</option>
                                            <option value="multiple">Multiple Select</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs uppercase text-pos-text-secondary font-bold mb-1">Min</label>
                                            <input
                                                type="number"
                                                value={editingGroup.minSelection}
                                                onChange={e => setEditingGroup({ ...editingGroup, minSelection: parseInt(e.target.value) })}
                                                className="w-full bg-pos-bg border border-pos-border rounded-lg p-3 text-white focus:border-pos-accent outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase text-pos-text-secondary font-bold mb-1">Max (-1 = ∞)</label>
                                            <input
                                                type="number"
                                                value={editingGroup.maxSelection}
                                                onChange={e => setEditingGroup({ ...editingGroup, maxSelection: parseInt(e.target.value) })}
                                                className="w-full bg-pos-bg border border-pos-border rounded-lg p-3 text-white focus:border-pos-accent outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Options Editor */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs uppercase text-pos-text-secondary font-bold">Options</label>
                                        <button onClick={addOption} className="text-xs bg-pos-accent/20 text-pos-accent px-2 py-1 rounded hover:bg-pos-accent hover:text-white transition-colors">
                                            + Add Option
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {editingGroup.options?.map((opt, i) => (
                                            <div key={i} className="flex gap-2 items-center">
                                                <input
                                                    value={opt.label}
                                                    onChange={e => updateOption(i, 'label', e.target.value)}
                                                    className="flex-1 bg-pos-bg border border-pos-border rounded-lg p-2 text-white text-sm"
                                                    placeholder="Option Name"
                                                />
                                                <div className="relative w-24">
                                                    <span className="absolute left-2 top-2 text-pos-text-secondary">$</span>
                                                    <input
                                                        type="number"
                                                        value={opt.price}
                                                        onChange={e => updateOption(i, 'price', parseFloat(e.target.value))}
                                                        className="w-full bg-pos-bg border border-pos-border rounded-lg p-2 pl-6 text-white text-sm"
                                                    />
                                                </div>
                                                <button onClick={() => removeOption(i)} className="p-2 text-pos-text-secondary hover:text-red-500">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        {(!editingGroup.options || editingGroup.options.length === 0) && (
                                            <div className="text-center p-4 border border-dashed border-pos-border rounded-lg text-pos-text-secondary text-sm">
                                                No options added yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-pos-border bg-pos-bg rounded-b-2xl flex justify-end gap-3">
                                <button onClick={() => setEditingGroup(null)} className="px-6 py-3 rounded-xl border border-pos-border text-pos-text-secondary font-bold hover:bg-pos-border">
                                    Cancel
                                </button>
                                <button onClick={handleSave} className="px-6 py-3 rounded-xl bg-pos-accent text-white font-bold hover:brightness-110 shadow-lg shadow-pos-accent/20">
                                    Save Group
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={!!confirmDeleteId}
                title="Delete Modifier Group?"
                message="This cannot be undone."
                isDanger
                onConfirm={handleDelete}
                onCancel={() => setConfirmDeleteId(null)}
            />
        </div>
    );
}
