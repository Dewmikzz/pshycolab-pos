"use client";

import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Receipt, Clock, Menu as MenuIcon, Settings } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";

const NAV_ITEMS = [
    { id: "sales", label: "Sales", icon: ShoppingCart, path: "/sales" },
    { id: "receipts", label: "Receipts", icon: Receipt, path: "/receipts" },
    { id: "shift", label: "Shift", icon: Clock, path: "/shift" },
    { id: "menu", label: "Menu", icon: MenuIcon, path: "/menu" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <div className="w-20 bg-pos-panel border-r border-pos-border flex flex-col items-center py-4 z-50">
            <div className="mb-8 p-2 bg-pos-accent rounded-lg">
                <span className="font-bold text-white text-xl">P</span>
            </div>

            <div className="flex-1 flex flex-col gap-4 w-full px-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.path);
                    return (
                        <button
                            key={item.id}
                            onClick={() => router.push(item.path)}
                            className={clsx(
                                "relative group w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all",
                                isActive
                                    ? "text-pos-accent"
                                    : "text-pos-text-secondary hover:bg-pos-bg hover:text-pos-text-primary"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute inset-0 bg-pos-highlight/10 rounded-xl border border-pos-accent/50"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <item.icon size={24} className={isActive ? "stroke-[2.5px]" : "stroke-2"} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
