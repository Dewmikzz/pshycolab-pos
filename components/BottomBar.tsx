"use client";

import { usePosStore } from "@/store/usePosStore";
import { clsx } from "clsx";
import { Hand, Trash, ChevronRight } from "lucide-react";

export function BottomBar() {
    const { activeTableId, clearOrder, orders } = usePosStore();
    const currentOrder = orders[activeTableId];
    const hasItems = (currentOrder?.items?.length || 0) > 0;

    return (
        <div className="h-20 bg-pos-panel border-t border-pos-border flex items-center px-4 gap-4 z-30">
            <button
                className="h-14 px-8 rounded-xl bg-pos-bg border border-pos-border text-pos-text-secondary font-bold text-lg hover:text-pos-text-primary hover:border-pos-highlight hover:bg-pos-highlight/10 transition-all flex items-center gap-2"
                disabled={!hasItems}
            >
                <Hand size={20} />
                HOLD
            </button>

            <button
                onClick={() => {
                    if (confirm("Are you sure you want to clear this order?")) {
                        clearOrder(activeTableId);
                    }
                }}
                className="h-14 px-8 rounded-xl bg-pos-bg border border-pos-border text-pos-danger font-bold text-lg hover:bg-pos-danger/10 hover:border-pos-danger transition-all flex items-center gap-2"
                disabled={!hasItems}
            >
                <Trash size={20} />
                CANCEL
            </button>

            <button className={clsx(
                "flex-1 h-14 rounded-xl font-bold text-2xl flex items-center justify-center gap-3 transition-all shadow-lg active:scale-[0.99]",
                hasItems
                    ? "bg-pos-accent text-white shadow-pos-accent/20 hover:bg-pos-accent-hover"
                    : "bg-pos-border text-pos-text-secondary cursor-not-allowed"
            )}>
                <span>PAY</span>
                <span className="text-lg opacity-80 font-medium">
                    {currentOrder?.total ? `$${currentOrder.total.toFixed(2)}` : "$0.00"}
                </span>
                <ChevronRight size={24} className={hasItems ? "animate-pulse" : ""} />
            </button>
        </div>
    );
}
