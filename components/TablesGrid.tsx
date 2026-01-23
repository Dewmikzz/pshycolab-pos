"use client";

import { usePosStore } from "@/store/usePosStore";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { Users, Utensils } from "lucide-react";

export function TablesGrid() {
    const { tables, orders, setActiveTable } = usePosStore();

    // Sort tables by ID or label logic?
    // Let's assume numerical labels for now or string sorting
    const sortedTables = [...tables].sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));

    return (
        <div className="p-6 h-full overflow-y-auto bg-pos-bg">
            <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Utensils className="text-pos-accent" />
                <span>Tables Dashboard</span>
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {sortedTables.map((table) => {
                    const order = orders[table.id];
                    const isOccupied = order && order.items && order.items.length > 0;
                    const total = order?.total || 0;
                    const itemCount = order?.items?.length || 0;

                    return (
                        <motion.button
                            key={table.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTable(table.id)}
                            className={`
                                relative p-4 rounded-2xl border-2 flex flex-col justify-between aspect-square transition-colors
                                ${isOccupied
                                    ? "bg-pos-accent/10 border-pos-accent"
                                    : "bg-pos-panel border-transparent hover:border-pos-border"}
                            `}
                        >
                            <div className="flex justify-between w-full">
                                <span className={`text-xl font-bold ${isOccupied ? "text-pos-accent" : "text-white"}`}>
                                    {table.label}
                                </span>
                                {isOccupied && (
                                    <div className="bg-pos-accent text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                        Occupied
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col items-center gap-2 my-2">
                                <Users size={32} className={isOccupied ? "text-pos-accent" : "text-pos-text-secondary/50"} />
                            </div>

                            <div className="w-full text-right">
                                {isOccupied ? (
                                    <>
                                        <div className="text-pos-text-secondary text-xs">{itemCount} items</div>
                                        <div className="text-xl font-bold text-white">{formatCurrency(total)}</div>
                                    </>
                                ) : (
                                    <div className="text-pos-text-secondary text-sm">Available</div>
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
