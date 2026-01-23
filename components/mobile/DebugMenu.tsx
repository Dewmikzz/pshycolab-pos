
"use client";

import { seedMalaysianData } from "@/services/menuService";
import { Wrench } from "lucide-react";
import { useState } from "react";

export function DebugMenu() {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleSeed = async () => {
        if (!confirm("Overwrite/Append with Malaysian Data?")) return;
        setLoading(true);
        await seedMalaysianData();
        setLoading(false);
        setOpen(false);
        window.location.reload();
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-24 right-4 z-[9999] bg-black/80 text-white p-3 rounded-full shadow-lg"
            >
                <Wrench size={20} />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-8 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
                <h3 className="font-bold text-lg text-black">Debug Options</h3>
                <button
                    onClick={handleSeed}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl"
                >
                    {loading ? "Seeding..." : "Seed Malaysian Menu 🇲🇾"}
                </button>
                <button
                    onClick={() => setOpen(false)}
                    className="w-full py-3 bg-gray-200 text-gray-800 font-bold rounded-xl"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
