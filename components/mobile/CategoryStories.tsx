"use client";

import { useMenuStore } from "@/store/useMenuStore";
import { clsx } from "clsx";
import { motion } from "framer-motion";

interface CategoryStoriesProps {
    activeCategory: string;
    onSelect: (id: string) => void;
}

export function CategoryStories({ activeCategory, onSelect }: CategoryStoriesProps) {
    const { categories, isLoading } = useMenuStore();

    if (isLoading) return <div className="h-24" />;

    return (
        <div className="py-6 overflow-x-auto no-scrollbar pl-4">
            <div className="flex gap-4">
                {categories.map((cat, i) => {
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => onSelect(cat.id)}
                            className="flex flex-col items-center gap-2 group flex-shrink-0"
                        >
                            <div className={clsx(
                                "w-16 h-16 rounded-full p-[2px] transition-all shadow-md",
                                isActive
                                    ? "bg-gradient-to-tr from-orange-400 via-rose-500 to-amber-500 scale-110"
                                    : "bg-white border-2 border-gray-100 group-hover:border-orange-200"
                            )}>
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center border-[3px] border-white overflow-hidden relative">
                                    <div className={clsx(
                                        "w-full h-full transition-colors",
                                        isActive ? "bg-orange-50" : "bg-gray-50"
                                    )} />
                                    <span className={clsx(
                                        "absolute text-xs font-black uppercase tracking-wider",
                                        isActive ? "text-orange-600" : "text-slate-400"
                                    )}>
                                        {cat.label.substring(0, 3)}
                                    </span>
                                </div>
                            </div>
                            <span className={clsx(
                                "text-xs font-bold transition-colors tracking-tight",
                                isActive ? "text-slate-900" : "text-slate-400"
                            )}>{cat.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
}
