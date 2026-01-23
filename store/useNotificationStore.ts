import { create } from "zustand";

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    timestamp: number;
    read: boolean;
}

interface NotificationState {
    notifications: Notification[];
    addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
    markAsRead: (id: string) => void;
    clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],

    addNotification: (type, message) => {
        const id = Date.now().toString();
        const newNotification: Notification = {
            id,
            type,
            message,
            timestamp: Date.now(),
            read: false
        };

        set((state) => ({ notifications: [newNotification, ...state.notifications] }));

        // Auto-dismiss in UI (but keep in history) logic usually handled by UI component, 
        // or we could remove it from "active toasts" here. 
        // For this simple system, we just append to list.
    },

    markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    })),

    clearAll: () => set({ notifications: [] })
}));
