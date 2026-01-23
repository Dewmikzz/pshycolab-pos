"use client";

import { useNotificationStore, Notification } from "@/store/useNotificationStore";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

const TOAST_DURATION = 3000;

export function NotificationSystem() {
    const { notifications } = useNotificationStore();
    const [visibleToasts, setVisibleToasts] = useState<Notification[]>([]);

    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[0];
            // Only show if it's new (timestamp check or ID check could happen here, 
            // but since we unshift, index 0 is always newest)

            // Avoid duplicates in toast view if re-renders happen
            if (!visibleToasts.find(t => t.id === latest.id)) {
                setVisibleToasts(prev => [latest, ...prev].slice(0, 3)); // Max 3 toasts

                // Auto remove from toast view
                setTimeout(() => {
                    setVisibleToasts(prev => prev.filter(t => t.id !== latest.id));
                }, TOAST_DURATION);
            }
        }
    }, [notifications]);

    return (
        <div className="fixed top-24 right-6 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {visibleToasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        layout
                        className="bg-pos-panel border border-pos-border shadow-2xl p-4 rounded-xl flex items-center gap-4 min-w-[300px] pointer-events-auto backdrop-blur-md"
                    >
                        <div className={`
                            p-2 rounded-full 
                            ${toast.type === 'success' ? 'bg-green-500/20 text-green-500' : ''}
                            ${toast.type === 'error' ? 'bg-red-500/20 text-red-500' : ''}
                            ${toast.type === 'info' ? 'bg-blue-500/20 text-blue-500' : ''}
                        `}>
                            {toast.type === 'success' && <CheckCircle size={20} />}
                            {toast.type === 'error' && <XCircle size={20} />}
                            {toast.type === 'info' && <Info size={20} />}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-white text-sm">{toast.message}</p>
                            <p className="text-xs text-pos-text-secondary mt-0.5">{new Date(toast.timestamp).toLocaleTimeString()}</p>
                        </div>
                        <button
                            onClick={() => setVisibleToasts(prev => prev.filter(t => t.id !== toast.id))}
                            className="text-pos-text-secondary hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
