"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Wallet, Coins, DollarSign, Lock, History, AlertTriangle, Trash2, CreditCard, QrCode, Car, Utensils } from "lucide-react";
import {
    subscribeToCurrentShift,
    subscribeToShiftHistory,
    openShift,
    closeShift,
    clearAllShifts
} from "@/services/shiftService";
import { Shift } from "@/types";
import { clsx } from "clsx";

export default function ShiftPage() {
    const [currentShift, setCurrentShift] = useState<Shift | null>(null);
    const [history, setHistory] = useState<Shift[]>([]);

    // Form States
    const [startCashInput, setStartCashInput] = useState("200");
    const [actualCashInput, setActualCashInput] = useState("");
    const [showCloseModal, setShowCloseModal] = useState(false);

    useEffect(() => {
        const unsubCurrent = subscribeToCurrentShift(setCurrentShift);
        const unsubHistory = subscribeToShiftHistory(setHistory);
        return () => {
            unsubCurrent();
            unsubHistory();
        };
    }, []);

    const handleOpenShift = async () => {
        const amount = parseFloat(startCashInput);
        if (isNaN(amount)) return alert("Invalid amount");
        try {
            await openShift(amount);
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleCloseShift = async () => {
        if (!currentShift) return;
        const amount = parseFloat(actualCashInput);
        if (isNaN(amount)) return alert("Invalid amount");

        if (confirm("Are you sure you want to close this shift?")) {
            try {
                await closeShift(currentShift.id, amount);
                setShowCloseModal(false);
            } catch (e: any) {
                console.error("Failed to close shift:", e);
                alert("Failed to close shift: " + e.message);
            }
        }
    };

    const handleClearHistory = async () => {
        if (confirm("DANGER: This will delete ALL shift records. Continue?")) {
            await clearAllShifts();
        }
    };

    if (!currentShift) {
        // Closed State
        return (
            <div className="p-8 h-full flex flex-col items-center justify-center space-y-8">
                <div className="bg-pos-panel p-8 rounded-3xl border border-pos-border max-w-md w-full text-center space-y-6 shadow-2xl">
                    <div className="w-20 h-20 bg-pos-accent rounded-full flex items-center justify-center mx-auto text-white shadow-lg shadow-pos-accent/30">
                        <Wallet size={40} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Start New Shift</h1>
                        <p className="text-pos-text-secondary">Enter the starting cash in your drawer.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-pos-bg rounded-xl border border-pos-border p-4 flex items-center gap-4">
                            <span className="font-bold text-pos-text-secondary">RM</span>
                            <input
                                type="number"
                                value={startCashInput}
                                onChange={(e) => setStartCashInput(e.target.value)}
                                className="bg-transparent text-2xl font-bold text-white w-full outline-none"
                                placeholder="0.00"
                            />
                        </div>
                        <button
                            onClick={handleOpenShift}
                            className="w-full py-4 bg-pos-accent text-white rounded-xl font-bold text-lg hover:brightness-110 shadow-lg"
                        >
                            OPEN SHIFT
                        </button>
                    </div>
                </div>

                {/* History Quick View */}
                {history.length > 0 && (
                    <div className="w-full max-w-[95%]">
                        <div className="flex justify-between items-center mb-4 px-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2"><History /> Recent Shifts</h2>
                            <button onClick={handleClearHistory} className="text-red-500 text-sm hover:underline flex items-center gap-1"><Trash2 size={14} /> Clear Records</button>
                        </div>
                        <div className="bg-pos-panel rounded-2xl border border-pos-border overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-black/20 text-pos-text-secondary uppercase">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Total</th>
                                        <th className="p-4">CASH</th>
                                        <th className="p-4">CARD</th>
                                        <th className="p-4">QR</th>
                                        <th className="p-4">GRAB FOOD</th>
                                        <th className="p-4">GRAB DINE OUT</th>
                                        <th className="p-4">Expected</th>
                                        <th className="p-4">Actual</th>
                                        <th className="p-4">Variance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-pos-border">
                                    {history.filter(h => h.status === 'closed').map(shift => {
                                        const variance = (shift.actualCash || 0) - shift.expectedCash;
                                        return (
                                            <tr key={shift.id} className="hover:bg-pos-bg/50">
                                                <td className="p-4 text-white font-medium" suppressHydrationWarning>{new Date(shift.openedAt).toLocaleDateString()}</td>
                                                <td className="p-4 text-white font-bold">{formatCurrency(shift.totalSales || 0)}</td>
                                                <td className="p-4 text-green-400">+{formatCurrency(shift.cashPayments)}</td>
                                                <td className="p-4 text-pos-text-secondary">{formatCurrency(shift.cardSales || 0)}</td>
                                                <td className="p-4 text-pos-text-secondary">{formatCurrency(shift.qrSales || 0)}</td>
                                                <td className="p-4 text-pos-text-secondary">{formatCurrency(shift.grabFoodSales || 0)}</td>
                                                <td className="p-4 text-pos-text-secondary">{formatCurrency(shift.grabDineOutSales || 0)}</td>
                                                <td className="p-4 text-white">{formatCurrency(shift.expectedCash)}</td>
                                                <td className="p-4 text-white font-bold">{formatCurrency(shift.actualCash || 0)}</td>
                                                <td className={clsx("p-4 font-bold", variance < 0 ? "text-red-500" : "text-green-500")}>
                                                    {variance > 0 ? "+" : ""}{formatCurrency(variance)}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Active Shift View
    const variance = parseFloat(actualCashInput || "0") - currentShift.expectedCash;

    // Stats Array for dashboard
    const stats = [
        { label: "CASH SALES", amount: currentShift.cashPayments, icon: Coins, color: "text-green-400" },
        { label: "CARD", amount: currentShift.cardSales || 0, icon: CreditCard, color: "text-blue-400" },
        { label: "QR", amount: currentShift.qrSales || 0, icon: QrCode, color: "text-pink-400" },
        { label: "GRAB FOOD", amount: currentShift.grabFoodSales || 0, icon: Car, color: "text-green-500" },
        { label: "GRAB DINE OUT", amount: currentShift.grabDineOutSales || 0, icon: Utensils, color: "text-orange-400" },
    ].filter(s => s.amount > 0 || s.label === "CASH SALES");

    return (
        <div className="p-8 h-full overflow-y-auto w-full">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        Shift Active
                    </h1>
                    <p className="text-pos-text-secondary mt-1" suppressHydrationWarning>{new Date(currentShift.openedAt).toLocaleTimeString()}</p>
                </div>
                <div className="flex gap-8">
                    <div className="text-right">
                        <p className="text-sm text-pos-text-secondary">Gross Sales</p>
                        <p className="text-4xl font-bold text-pos-accent">{formatCurrency(currentShift.totalSales || 0)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-pos-text-secondary">Expected Cash</p>
                        <p className="text-4xl font-bold text-white">{formatCurrency(currentShift.expectedCash)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Opening Cash Always First */}
                <div className="bg-pos-panel p-6 rounded-2xl border border-pos-border flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-10"><Wallet size={64} /></div>
                    <p className="text-pos-text-secondary font-bold uppercase text-xs">Opening Cash</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency(currentShift.startCash)}</p>
                </div>

                {/* Dynamic Stats */}
                {stats.map((stat, i) => (
                    <div key={i} className="bg-pos-panel p-6 rounded-2xl border border-pos-border flex flex-col gap-2 relative overflow-hidden">
                        <div className={clsx("absolute right-0 top-0 p-4 opacity-10", stat.color)}>
                            <stat.icon size={64} />
                        </div>
                        <p className="text-pos-text-secondary font-bold uppercase text-xs">{stat.label}</p>
                        <p className={clsx("text-3xl font-bold", stat.color)}>{formatCurrency(stat.amount)}</p>
                    </div>
                ))}
            </div>

            <div className="bg-pos-panel rounded-3xl p-8 border border-pos-border max-w-2xl">
                {showCloseModal ? (
                    <div className="space-y-6 animation-fade-in">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Close Shift</h2>
                            <p className="text-pos-text-secondary">Count the cash in drawer and enter total.</p>
                        </div>
                        <div className="bg-pos-bg rounded-xl border border-pos-border p-6">
                            <label className="text-sm font-bold text-pos-text-secondary uppercase mb-2 block">Actual Cash Amount</label>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-2xl text-white">RM</span>
                                <input
                                    type="number"
                                    autoFocus
                                    value={actualCashInput}
                                    onChange={(e) => setActualCashInput(e.target.value)}
                                    className="bg-transparent text-4xl font-bold text-white w-full outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {actualCashInput && (
                            <div className={clsx("p-4 rounded-xl border flex justify-between items-center", variance === 0 ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30")}>
                                <span className="font-bold text-sm uppercase">Variance</span>
                                <span className={clsx("font-bold text-xl", variance === 0 ? "text-green-500" : "text-red-500")}>
                                    {variance > 0 ? "+" : ""}{formatCurrency(variance)}
                                </span>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowCloseModal(false)}
                                className="flex-1 py-4 bg-pos-bg text-white rounded-xl font-bold border border-pos-border hover:bg-pos-border"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleCloseShift}
                                className="flex-1 py-4 bg-pos-danger text-white rounded-xl font-bold hover:brightness-110 shadow-lg shadow-red-900/20"
                            >
                                CONFIRM CLOSE
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">Actions</h2>
                            <p className="text-sm text-pos-text-secondary">Manage current session</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-6 py-4 bg-pos-bg border border-pos-border text-pos-text-secondary rounded-xl font-bold hover:text-white hover:border-pos-text-primary transition-all">
                                CASH DROP
                            </button>
                            <button
                                onClick={() => setShowCloseModal(true)}
                                className="px-6 py-4 bg-pos-danger/10 text-pos-danger border border-pos-danger/50 rounded-xl font-bold hover:bg-pos-danger hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Lock size={20} />
                                CLOSE SHIFT
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
