"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Check, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDanger = false,
    onConfirm,
    onCancel
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-pos-panel w-full max-w-md rounded-2xl border border-pos-border shadow-2xl overflow-hidden"
            >
                <div className="p-6 text-center space-y-4">
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${isDanger ? "bg-red-500/10 text-red-500" : "bg-pos-accent/10 text-pos-accent"}`}>
                        {isDanger ? <AlertTriangle size={32} /> : <Check size={32} />}
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                        <p className="text-pos-text-secondary mt-2">{message}</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 bg-pos-bg border border-pos-border rounded-xl text-pos-text-secondary font-bold hover:bg-pos-border hover:text-white transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-3 rounded-xl text-white font-bold transition-all shadow-lg ${isDanger ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "bg-pos-accent hover:brightness-110 shadow-pos-accent/20"}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
