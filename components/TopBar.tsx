"use client";

import { usePosStore } from "@/store/usePosStore";
import { TABLES } from "@/data/mockData";
import { clsx } from "clsx";
import { motion } from "framer-motion";

export function TopBar() {
    const { activeTableId, setActiveTable } = usePosStore();

    return (
        <div className="h-16 w-full bg-pos-panel border-b border-pos-border flex items-center shadow-md z-10">
            <div className="flex-1 overflow-x-auto no-scrollbar flex items-center px-4 gap-2 h-full">
                {TABLES.map((table) => {
                    const isActive = table.id === activeTableId;
                    return (
                        <button
                            key={table.id}
                            onClick={() => setActiveTable(table.id)}
                            className={clsx(
                                "flex-shrink-0 w-16 h-12 rounded-lg font-bold text-lg flex items-center justify-center transition-colors relative overflow-hidden",
                                isActive
                                    ? "bg-pos-accent text-white shadow-lg shadow-pos-accent/20"
                                    : "bg-pos-bg text-pos-text-secondary hover:bg-pos-border hover:text-pos-text-primary"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTableIndicator"
                                    className="absolute inset-0 bg-pos-accent"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{table.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
