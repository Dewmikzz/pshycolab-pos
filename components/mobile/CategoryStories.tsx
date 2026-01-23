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
                                "w-16 h-16 rounded-full p-[2px] transition-all",
                                isActive
                                    ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                                    : "bg-pos-border group-hover:bg-pos-text-secondary"
                            )}>
                                <div className="w-full h-full rounded-full bg-pos-bg flex items-center justify-center border-2 border-black overflow-hidden relative">
                                    <div className={clsx(
                                        "w-full h-full opacity-50",
                                        isActive ? "bg-pos-accent/20" : "bg-pos-panel"
                                    )} />
                                    <span className="absolute text-xs font-bold text-pos-text-secondary mix-blend-screen uppercase">
                                        {cat.label.substring(0, 3)}
                                    </span>
                                </div>
                            </div>
                            <span className={clsx(
                                "text-xs font-medium transition-colors",
                                isActive ? "text-pos-text-primary" : "text-pos-text-secondary"
                            )}>{cat.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
}
