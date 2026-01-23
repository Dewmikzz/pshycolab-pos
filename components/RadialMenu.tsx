"use client";

import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Receipt, Clock, Menu as MenuIcon, Settings, Grip, X, LayoutGrid } from "lucide-react";
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

export function RadialMenu() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    // Animation Config
    // Fan out from Bottom-Left (Angle 0 to 90 degrees)
    const radius = 140; // Pixel distance from corner

    return (
        <>
            {/* Backdrop Blur Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Menu Container */}
            <div className="fixed bottom-6 left-6 z-[100] flex items-end">

                {/* Trigger Button (4 dots / Grid) */}
                <motion.button
                    onClick={toggleMenu}
                    className={clsx(
                        "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-colors relative z-[101]",
                        isOpen ? "bg-red-500 text-white" : "bg-pos-accent text-white hover:brightness-110"
                    )}
                    whileTap={{ scale: 0.9 }}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                >
                    {isOpen ? <X size={32} /> : <LayoutGrid size={32} />}
                </motion.button>

                {/* Radial Items */}
                <AnimatePresence>
                    {isOpen && (
                        <div className="absolute bottom-0 left-0 w-0 h-0">
                            {NAV_ITEMS.map((item, index) => {
                                // Calculate position on arc (0 to 90 degrees)
                                // We have 5 items. Let's spread them from 10 deg to 80 deg.
                                const totalItems = NAV_ITEMS.length;
                                const startAngle = 10;
                                const endAngle = 80;
                                const angleStep = (endAngle - startAngle) / (totalItems - 1);
                                const angleDeg = startAngle + (index * angleStep);
                                const angleRad = (angleDeg * Math.PI) / 180;

                                // X is cos, Y is sin (negative because up)
                                const x = Math.round(radius * Math.cos(angleRad));
                                const y = -Math.round(radius * Math.sin(angleRad));

                                const isActive = pathname.startsWith(item.path);

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                                        animate={{
                                            x: x,
                                            y: y,
                                            opacity: 1,
                                            scale: 1,
                                            transition: {
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 20,
                                                delay: index * 0.05
                                            }
                                        }}
                                        exit={{
                                            x: 0,
                                            y: 0,
                                            opacity: 0,
                                            scale: 0,
                                            transition: { duration: 0.2 }
                                        }}
                                        className="absolute left-2 bottom-2" // Start from center of button approx
                                    >
                                        <div className="flex flex-col items-center gap-2 group">
                                            <motion.button
                                                onClick={() => {
                                                    router.push(item.path);
                                                    setIsOpen(false);
                                                }}
                                                className={clsx(
                                                    "w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-2 transition-colors",
                                                    isActive
                                                        ? "bg-pos-accent border-white text-white"
                                                        : "bg-pos-panel border-pos-border text-pos-text-secondary hover:text-white hover:border-pos-accent"
                                                )}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <item.icon size={24} />
                                            </motion.button>
                                            <motion.span
                                                className="absolute -bottom-6 text-xs font-bold text-white whitespace-nowrap bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                {item.label}
                                            </motion.span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
