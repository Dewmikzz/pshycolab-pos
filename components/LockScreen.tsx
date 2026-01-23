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
        <div className="fixed inset-0 z-[9999] flex flex-col md:flex-row bg-gradient-to-br from-indigo-950 via-slate-950 to-black text-white overflow-hidden">
            {/* Left Side: Time & Date (Hero) */}
            <div className="flex-1 flex flex-col items-center justify-center p-12 bg-black/20 backdrop-blur-sm border-b md:border-b-0 md:border-r border-white/5">
                <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-left duration-700">
                    <div className="w-32 h-32 bg-pos-accent/20 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-pos-accent/10 animate-pulse">
                        <Lock size={64} className="text-pos-accent" />
                    </div>

                    <div className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xl md:text-2xl font-light uppercase tracking-[0.2em] text-pos-text-secondary">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Right Side: Authentication */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pos-accent/10 via-transparent to-transparent pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm flex flex-col gap-8 z-10"
                >
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold">Welcome Back</h2>
                        <p className="text-pos-text-secondary">Enter your PIN to resume session</p>
                    </div>

                    {/* PIN Display */}
                    <div className={clsx(
                        "w-full h-20 bg-black/40 rounded-3xl flex items-center justify-center text-5xl font-mono tracking-[0.5em] text-white border-2 transition-all shadow-inner",
                        error ? "border-red-500 text-red-500 animate-shake bg-red-500/10" : "border-white/10 focus-within:border-pos-accent hover:border-white/20"
                    )}>
                        {pin.split("").map(() => "•").join("")}
                        {pin.length === 0 && <span className="text-white/10 text-lg tracking-normal font-sans">Enter PIN</span>}
                    </div>

                    {/* Numpad */}
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumPress(num.toString())}
                                className="h-24 rounded-3xl bg-white/5 hover:bg-white/10 active:bg-pos-accent active:scale-95 transition-all text-3xl font-medium text-white border border-white/5 shadow-xl flex items-center justify-center backdrop-blur-sm"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={handleBackspace}
                            className="h-24 rounded-3xl bg-transparent hover:bg-red-500/20 text-white/50 hover:text-red-500 transition-all flex items-center justify-center active:scale-95"
                        >
                            <Delete size={32} />
                        </button>
                        <button
                            onClick={() => handleNumPress("0")}
                            className="h-24 rounded-3xl bg-white/5 hover:bg-white/10 active:bg-pos-accent active:scale-95 transition-all text-3xl font-medium text-white border border-white/5 shadow-xl flex items-center justify-center backdrop-blur-sm"
                        >
                            0
                        </button>
                        <button
                            onClick={handleUnlock}
                            className="h-24 rounded-3xl bg-pos-accent hover:brightness-110 active:scale-95 transition-all text-white flex items-center justify-center shadow-lg shadow-pos-accent/30"
                        >
                            <Unlock size={32} />
                        </button>
                    </div>
                </motion.div>

                <div className="absolute bottom-6 text-xs text-white/20">
                    POS Terminal v1.0 • PshycoLab
                </div>
            </div>
        </div>
    );
}
