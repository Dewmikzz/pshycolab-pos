"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRightLeft, Users } from "lucide-react";
import { Table } from "@/types";
import { usePosStore } from "@/store/usePosStore";
import { useState } from "react";

interface MoveTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTableId: string;
}

export function MoveTableModal({ isOpen, onClose, currentTableId }: MoveTableModalProps) {
    const { tables, moveTable, setActiveTable } = usePosStore();
    const [targetTableId, setTargetTableId] = useState<string | null>(null);

    if (!isOpen) return null;

    const availableTables = tables.filter(t => t.id !== currentTableId);

    const handleMove = () => {
        if (targetTableId) {
            if (confirm(`Move order from Table ${currentTableId} to Table ${targetTableId}?`)) {
                moveTable(currentTableId, targetTableId);
                setActiveTable(targetTableId);
                onClose();
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-pos-panel w-full max-w-2xl rounded-2xl border border-pos-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-pos-border flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-pos-accent/10 text-pos-accent flex items-center justify-center">
                        <ArrowRightLeft size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Move Table</h2>
                        <p className="text-pos-text-secondary">Select a target table to move the order to</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-4 gap-4">
                    {availableTables.map((table) => (
                        <button
                            key={table.id}
                            onClick={() => setTargetTableId(table.id)}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${targetTableId === table.id
                                    ? "bg-pos-accent/20 border-pos-accent text-white"
                                    : "bg-pos-bg border-pos-border text-pos-text-secondary hover:bg-pos-border"
                                }`}
                        >
                            <Users size={24} />
                            <span className="font-bold">Table {table.label}</span>
                        </button>
                    ))}
                </div>

                <div className="p-6 border-t border-pos-border flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-xl bg-pos-bg border border-pos-border text-pos-text-secondary font-bold hover:bg-pos-border transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleMove}
                        disabled={!targetTableId}
                        className="flex-1 py-4 rounded-xl bg-pos-accent text-white font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Move Order
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
