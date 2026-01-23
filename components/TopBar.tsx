"use client";

import { usePosStore } from "@/store/usePosStore";
import { ArrowLeft, LayoutGrid, X } from "lucide-react";

export function TopBar() {
    const { viewMode, activeTableId, setViewMode, toggleMenu, isMenuOpen } = usePosStore();

    return (
        <div className="h-16 w-full bg-pos-panel border-b border-pos-border flex items-center px-6 justify-between shadow-md z-10 transition-all sticky top-0 shrink-0">
            <div className="flex items-center gap-4">
                {/* Menu Trigger */}
                <button
                    onClick={toggleMenu}
                    className="p-2 -ml-2 rounded-lg text-pos-text-secondary hover:text-white hover:bg-pos-bg transition-colors"
                >
                    {isMenuOpen ? <X size={28} /> : <LayoutGrid size={28} />}
                </button>

                {viewMode === 'order' ? (
                    <>
                        <button
                            onClick={() => setViewMode('tables')}
                            className="flex items-center gap-2 text-pos-text-secondary hover:text-white transition-colors bg-pos-bg px-4 py-2 rounded-lg border border-pos-border"
                        >
                            <ArrowLeft size={20} />
                            <span className="font-bold">Back to Tables</span>
                        </button>
                        <div className="h-8 w-px bg-pos-border mx-2" />
                        <h2 className="text-xl font-bold text-white">Table {activeTableId}</h2>
                    </>
                ) : (
                    <div className="flex items-center gap-2 text-pos-accent">
                        <h1 className="text-xl font-bold">POS Dashboard</h1>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                {/* Right side items (e.g. Current Time, User Profile - placeholders) */}
                <div className="text-pos-text-secondary font-medium">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
}
