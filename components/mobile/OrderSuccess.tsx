"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function OrderSuccess() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-pos-accent z-50 flex flex-col items-center justify-center text-white"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-24 h-24 rounded-full bg-white text-pos-accent flex items-center justify-center mb-6"
            >
                <Check size={48} strokeWidth={4} />
            </motion.div>
            <h2 className="text-3xl font-bold mb-2">Order Placed!</h2>
            <p className="opacity-90">The kitchen is preparing your food.</p>
        </motion.div>
    );
}
