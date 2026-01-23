"use client";

import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Receipt, Clock, Menu as MenuIcon, Settings, ChevronRight, ChevronLeft } from "lucide-react";
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

export function AnimatedSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            className="h-full bg-pos-panel border-r border-pos-border z-50 flex flex-col relative"
            animate={{ width: isExpanded ? 240 : 80 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {/* Logo Area */}
            <div className="h-20 flex items-center justify-center relative">
                <div className="w-10 h-10 bg-pos-accent rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-pos-accent/20">
                    P
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="absolute left-20 text-white font-bold text-xl whitespace-nowrap"
                        >
                            PsychoLab
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Nav Items */}
            <div className="flex-1 flex flex-col gap-3 px-3 mt-4">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.path);
                    return (
                        <button
                            key={item.id}
                            onClick={() => router.push(item.path)}
                            className={clsx(
                                "relative h-12 rounded-xl flex items-center transition-all group overflow-hidden",
                                isActive ? "text-pos-accent" : "text-pos-text-secondary hover:text-white"
                            )}
                        >
                            {/* Active Indicator (Walking Circle Background) */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeNavBg"
                                    className="absolute inset-0 bg-pos-accent/10 rounded-xl border border-pos-accent/50"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            {/* Icon */}
                            <div className="min-w-[56px] h-full flex items-center justify-center z-10">
                                <item.icon size={24} className={isActive ? "stroke-[2.5px]" : "stroke-2"} />
                            </div>

                            {/* Label */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="font-medium whitespace-nowrap z-10"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {/* Hover Effect */}
                            {!isActive && (
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute -right-4 top-24 w-8 h-8 bg-pos-panel border border-pos-border rounded-full flex items-center justify-center text-pos-text-secondary hover:text-white hover:border-pos-accent transition-colors shadow-xl z-50"
            >
                {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
        </motion.div>
    );
}
