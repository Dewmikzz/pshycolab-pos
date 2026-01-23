"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { create } from "zustand";

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastState {
    toasts: Toast[];
    showToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

export const useToast = create<ToastState>((set) => ({
    toasts: [],
    showToast: (message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, 3000);
    },
    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`pointer-events-auto p-4 rounded-xl shadow-xl flex items-center gap-3 min-w-[300px] border border-white/10 ${toast.type === 'success' ? 'bg-green-600 text-white' :
                                toast.type === 'error' ? 'bg-red-600 text-white' :
                                    'bg-blue-600 text-white'
                            }`}
                    >
                        {toast.type === 'success' && <CheckCircle size={20} />}
                        {toast.type === 'error' && <XCircle size={20} />}
                        {toast.type === 'info' && <Info size={20} />}
                        <p className="font-medium text-sm flex-1">{toast.message}</p>
                        <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100">
                            <XCircle size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
