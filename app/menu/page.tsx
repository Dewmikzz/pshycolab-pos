"use client";

import { useState } from "react";
import { Package, Layers, Sliders, RefreshCcw } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { ManageProducts } from "@/components/ManageProducts";
import { ManageCategories } from "@/components/ManageCategories";
import { ManageModifierGroups } from "@/components/ManageModifierGroups";
import { seedMenuData } from "@/services/menuService";
import { useToast } from "@/components/Toast";

export default function MenuPage() {
    const [activeTab, setActiveTab] = useState<"products" | "categories" | "modifiers">("products");
    const { showToast } = useToast();
    const [isSeeding, setIsSeeding] = useState(false);

    const handleSeed = async () => {
        if (confirm("Reset/Seed default data? Existing data might be duplicated if IDs conflict.")) {
            setIsSeeding(true);
            await seedMenuData();
            showToast("Menu Data Seeded", "success");
            setIsSeeding(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-pos-bg p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Menu Management</h1>

                <button
                    onClick={handleSeed}
                    disabled={isSeeding}
                    className="flex items-center gap-2 px-4 py-2 bg-pos-panel border border-pos-border text-pos-text-secondary rounded-lg text-sm hover:text-white hover:bg-pos-border transition-colors"
                >
                    <RefreshCcw size={16} className={isSeeding ? "animate-spin" : ""} />
                    {isSeeding ? "Seeding..." : "Reset Data"}
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 border-b border-pos-border pb-1">
                <TabButton
                    active={activeTab === "products"}
                    onClick={() => setActiveTab("products")}
                    icon={<Package size={20} />}
                    label="Products"
                />
                <TabButton
                    active={activeTab === "categories"}
                    onClick={() => setActiveTab("categories")}
                    icon={<Layers size={20} />}
                    label="Categories"
                />
                <TabButton
                    active={activeTab === "modifiers"}
                    onClick={() => setActiveTab("modifiers")}
                    icon={<Sliders size={20} />}
                    label="Modifiers"
                />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden bg-pos-panel/30 rounded-2xl border border-pos-border p-6 shadow-inner">
                {activeTab === "products" && <ManageProducts />}
                {activeTab === "categories" && <ManageCategories />}
                {activeTab === "modifiers" && <ManageModifierGroups />}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "pb-3 px-4 flex items-center gap-2 font-medium transition-all relative",
                active ? "text-pos-accent" : "text-pos-text-secondary hover:text-white"
            )}
        >
            {icon}
            {label}
            {active && <motion.div layoutId="underline" className="absolute bottom-[-1px] left-0 right-0 h-1 bg-pos-accent rounded-full" />}
        </button>
    );
}


