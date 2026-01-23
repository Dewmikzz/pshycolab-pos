"use client";

import { TopBar } from "./TopBar";
import { OrderPanel } from "./OrderPanel";
import { ProductGrid } from "./ProductGrid";

export function PosLayout() {
    return (
        <div className="flex flex-col h-full w-full bg-pos-bg overflow-hidden">
            <TopBar />
            <div className="flex-1 flex overflow-hidden">
                {/* Product Grid on Left (Flexible) */}
                <div className="flex-1 overflow-hidden relative border-r border-pos-border order-first">
                    <ProductGrid />
                </div>

                {/* Order Panel on Right (Fixed Width) */}
                <div className="w-[420px] bg-pos-panel flex flex-col h-full shadow-2xl z-10 relative">
                    <OrderPanel />
                </div>
            </div>
        </div>
    );
}
