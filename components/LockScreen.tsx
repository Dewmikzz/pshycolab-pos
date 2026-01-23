"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Delete, Unlock } from "lucide-react";
import { clsx } from "clsx";

export function LockScreen() {
    const { isLocked, lockPassword, setLocked } = useSettingsStore();
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);

    // Initial check for hidden/shown handled by parent or conditional rendering
    // But we need to ensure the component is mounted to show.

    const handleNumPress = (num: string) => {
        if (pin.length < 6) {
            setPin(prev => prev + num);
            setError(false);
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
        setError(false);
    };

    const handleUnlock = () => {
        if (pin === lockPassword) {
            setLocked(false);
            setPin("");
        } else {
            setError(true);
            setPin("");
        }
    };

    // Auto unlock if length matches (optional, but requested manual enter is safer for variable length)
    // Let's stick to manual Enter or auto? Let's use manual button for clarity.

    if (!isLocked) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xl">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl backdrop-blur-md flex flex-col items-center gap-8"
            >
                {/* Header */}
                <div className="flex flex-col items-center gap-2 text-white">
                    <div className="w-20 h-20 bg-pos-accent/20 rounded-full flex items-center justify-center mb-2 animate-pulse">
                        <Lock size={40} className="text-pos-accent" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">System Locked</h1>
                    <p className="text-pos-text-secondary">Enter PIN to access POS Terminal</p>
                </div>

                {/* PIN Display */}
                <div className={clsx(
                    "w-full h-16 bg-black/40 rounded-2xl flex items-center justify-center text-4xl font-mono tracking-[1em] text-white border-2 transition-colors",
                    error ? "border-red-500 text-red-500 animate-shake" : "border-transparent focus-within:border-pos-accent"
                )}>
                    {pin.split("").map(() => "•").join("")}
                    {pin.length === 0 && <span className="text-white/20 text-sm tracking-normal">Enter PIN</span>}
                </div>

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-4 w-full">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumPress(num.toString())}
                            className="h-20 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-pos-accent active:text-white transition-all text-2xl font-bold text-white border border-white/5 shadow-lg"
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        onClick={handleBackspace}
                        className="h-20 rounded-2xl bg-white/5 hover:bg-red-500/20 hover:text-red-500 transition-all text-white flex items-center justify-center border border-white/5 shadow-lg"
                    >
                        <Delete size={28} />
                    </button>
                    <button
                        onClick={() => handleNumPress("0")}
                        className="h-20 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-pos-accent active:text-white transition-all text-2xl font-bold text-white border border-white/5 shadow-lg wait"
                    >
                        0
                    </button>
                    <button
                        onClick={handleUnlock}
                        className="h-20 rounded-2xl bg-pos-accent hover:brightness-110 active:scale-95 transition-all text-white flex items-center justify-center shadow-lg shadow-pos-accent/30"
                    >
                        <Unlock size={28} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
