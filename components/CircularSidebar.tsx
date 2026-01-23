"use client";

import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Receipt, Clock, Menu as MenuIcon, Settings, X, Grip } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const NAV_ITEMS = [
    { id: "sales", label: "Sales", icon: ShoppingCart, path: "/sales" },
    { id: "receipts", label: "Receipts", icon: Receipt, path: "/receipts" },
    { id: "shift", label: "Shift", icon: Clock, path: "/shift" },
    { id: "menu", label: "Menu", icon: MenuIcon, path: "/menu" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

export function CircularSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    // Auto-close on navigate? Maybe.
    const handleNavigate = (path: string) => {
        router.push(path);
        // setIsOpen(false); // Optional: keep open for faster navigation
    };

    return (
        <motion.div
            className="fixed left-4 top-4 z-[100] flex flex-col items-start gap-4"
            initial={false}
        >
            {/* Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-pos-accent text-white flex items-center justify-center shadow-lg hover:brightness-110 z-50"
                whileTap={{ scale: 0.9 }}
                animate={{ rotate: isOpen ? 90 : 0 }}
            >
                {isOpen ? <X size={24} /> : <Grip size={24} />}
            </motion.button>

            {/* Menu Items Container */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.8 }}
                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.8 }}
                        className="flex flex-col gap-3 bg-pos-panel/90 backdrop-blur-md p-2 rounded-2xl border border-pos-border/50 shadow-2xl overflow-hidden origin-top-left"
                    >
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname.startsWith(item.path);
                            return (
                                <motion.button
                                    key={item.id}
                                    onClick={() => handleNavigate(item.path)}
                                    layout
                                    className={clsx(
                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all relative",
                                        isActive
                                            ? "text-pos-accent bg-pos-accent/10"
                                            : "text-pos-text-secondary hover:text-white hover:bg-white/10"
                                    )}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    title={item.label}
                                >
                                    <item.icon size={22} className={isActive ? "stroke-[2.5px]" : "stroke-2"} />

                                    {isActive && (
                                        <motion.div
                                            layoutId="activeCircle"
                                            className="absolute -right-1 top-1 w-2 h-2 rounded-full bg-pos-accent"
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
