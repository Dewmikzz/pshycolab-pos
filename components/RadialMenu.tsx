"use client";

import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Receipt, Clock, Menu as MenuIcon, Settings, Grip, X, LayoutGrid } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { usePosStore } from "@/store/usePosStore";

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
    const { isMenuOpen, setMenuOpen } = usePosStore();

    // Large Semi-Circle Config (Centered on Left Edge)
    const radius = 220; // Increased radius for tablet
    const totalItems = NAV_ITEMS.length;
    // Spread from -60 degrees (top) to +60 degrees (bottom)
    const startAngle = -60;
    const endAngle = 60;

    return (
        <AnimatePresence>
            {isMenuOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMenuOpen(false)}
                        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-md"
                    />

                    {/* Menu Container - Centered Vertically on Left Edge */}
                    <div className="fixed top-1/2 left-0 -translate-y-1/2 z-[100] w-0 h-0">
                        {NAV_ITEMS.map((item, index) => {
                            // Calculate angle
                            const angleStep = (endAngle - startAngle) / (totalItems - 1);
                            const angleDeg = startAngle + (index * angleStep);
                            const angleRad = (angleDeg * Math.PI) / 180;

                            // X is cos (right), Y is sin (down)
                            // Since we are on left edge, X goes positive (right)
                            const x = Math.round(radius * Math.cos(angleRad));
                            const y = Math.round(radius * Math.sin(angleRad));

                            const isActive = pathname.startsWith(item.path);

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ x: -100, y: 0, opacity: 0, scale: 0.5 }}
                                    animate={{
                                        x: x,
                                        y: y,
                                        opacity: 1,
                                        scale: 1,
                                        transition: {
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 25,
                                            delay: index * 0.05
                                        }
                                    }}
                                    exit={{
                                        x: -100,
                                        y: y,
                                        opacity: 0,
                                        scale: 0.5,
                                        transition: { duration: 0.2 }
                                    }}
                                    className="absolute"
                                    style={{ transform: 'translate(-50%, -50%)' }}
                                >
                                    <button
                                        onClick={() => {
                                            router.push(item.path);
                                            setMenuOpen(false);
                                        }}
                                        className={clsx(
                                            "flex flex-col items-center gap-2 group outline-none",
                                            isActive ? "text-pos-accent" : "text-white"
                                        )}
                                    >
                                        <div className={clsx(
                                            "w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300",
                                            isActive
                                                ? "bg-pos-accent text-white shadow-pos-accent/50 scale-110"
                                                : "bg-pos-panel border border-pos-border text-pos-text-secondary group-hover:bg-pos-accent group-hover:text-white group-hover:border-pos-accent group-hover:scale-110"
                                        )}>
                                            <item.icon size={36} />
                                        </div>
                                        <span className={clsx(
                                            "text-lg font-bold tracking-wide transition-colors uppercase bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm",
                                            isActive ? "text-pos-accent bg-black/60" : "text-white/80 group-hover:text-white"
                                        )}>
                                            {item.label}
                                        </span>
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
