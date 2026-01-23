"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Lock, FileText, Save, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
    const {
        lockPassword,
        setLockPassword,
        isLocked,
        setLocked,
        receiptSettings,
        updateReceiptSettings
    } = useSettingsStore();

    const [activeTab, setActiveTab] = useState<'security' | 'receipt'>('security');
    const [tempPassword, setTempPassword] = useState(lockPassword);
    const [saved, setSaved] = useState(false);

    // Form states for receipt
    const [receiptForm, setReceiptForm] = useState(receiptSettings);

    const handleSaveSecurity = () => {
        setLockPassword(tempPassword);
        showSaved();
    };

    const handleSaveReceipt = () => {
        updateReceiptSettings(receiptForm);
        showSaved();
    };

    const showSaved = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="flex flex-col h-full bg-pos-bg p-6 overflow-hidden">
            <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 bg-pos-panel rounded-2xl p-4 flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${activeTab === 'security' ? 'bg-pos-accent text-white' : 'text-pos-text-secondary hover:bg-pos-bg hover:text-white'}`}
                    >
                        <Lock size={20} />
                        <span className="font-bold">Security & Lock</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('receipt')}
                        className={`flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${activeTab === 'receipt' ? 'bg-pos-accent text-white' : 'text-pos-text-secondary hover:bg-pos-bg hover:text-white'}`}
                    >
                        <FileText size={20} />
                        <span className="font-bold">Receipt Template</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-pos-panel rounded-2xl p-8 overflow-y-auto">
                    {activeTab === 'security' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-lg">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-4">Application Lock</h2>
                                <div className="p-4 bg-pos-bg rounded-xl border border-pos-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-white">Current Status</span>
                                        <div className="flex items-center gap-2">
                                            <span className={isLocked ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                                                {isLocked ? "LOCKED" : "UNLOCKED"}
                                            </span>
                                            <button
                                                onClick={() => setLocked(true)}
                                                className="bg-pos-accent/20 text-pos-accent px-3 py-1 rounded-lg text-sm font-bold hover:bg-pos-accent hover:text-white transition-colors"
                                            >
                                                Lock Now
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm text-pos-text-secondary">Lock Password (PIN)</label>
                                        <input
                                            type="text"
                                            value={tempPassword}
                                            onChange={(e) => setTempPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            className="w-full bg-pos-panel border border-pos-border rounded-lg p-3 text-white focus:border-pos-accent outline-none font-mono tracking-widest"
                                            placeholder="Enter 4-6 digit PIN"
                                        />
                                        <p className="text-xs text-pos-text-secondary">Recommended: 4-6 digits.</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveSecurity}
                                className="flex items-center gap-2 bg-pos-accent text-white px-6 py-3 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all"
                            >
                                {saved ? <Check size={20} /> : <Save size={20} />}
                                <span>{saved ? "Saved!" : "Save Security Settings"}</span>
                            </button>
                        </motion.div>
                    )}

                    {activeTab === 'receipt' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-xl">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-4">Receipt Template</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm text-pos-text-secondary">Business Name</label>
                                            <input
                                                type="text"
                                                value={receiptForm.businessName}
                                                onChange={(e) => setReceiptForm({ ...receiptForm, businessName: e.target.value })}
                                                className="bg-pos-bg border border-pos-border rounded-lg p-3 text-white focus:border-pos-accent outline-none"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm text-pos-text-secondary">Contact Phone</label>
                                            <input
                                                type="text"
                                                value={receiptForm.contactPhone}
                                                onChange={(e) => setReceiptForm({ ...receiptForm, contactPhone: e.target.value })}
                                                className="bg-pos-bg border border-pos-border rounded-lg p-3 text-white focus:border-pos-accent outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm text-pos-text-secondary">Address Line 1</label>
                                        <input
                                            type="text"
                                            value={receiptForm.addressLine1}
                                            onChange={(e) => setReceiptForm({ ...receiptForm, addressLine1: e.target.value })}
                                            className="bg-pos-bg border border-pos-border rounded-lg p-3 text-white focus:border-pos-accent outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm text-pos-text-secondary">Address Line 2</label>
                                        <input
                                            type="text"
                                            value={receiptForm.addressLine2}
                                            onChange={(e) => setReceiptForm({ ...receiptForm, addressLine2: e.target.value })}
                                            className="bg-pos-bg border border-pos-border rounded-lg p-3 text-white focus:border-pos-accent outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm text-pos-text-secondary">Footer Message</label>
                                        <textarea
                                            value={receiptForm.footerMessage}
                                            onChange={(e) => setReceiptForm({ ...receiptForm, footerMessage: e.target.value })}
                                            className="bg-pos-bg border border-pos-border rounded-lg p-3 text-white focus:border-pos-accent outline-none h-24 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveReceipt}
                                className="flex items-center gap-2 bg-pos-accent text-white px-6 py-3 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all"
                            >
                                {saved ? <Check size={20} /> : <Save size={20} />}
                                <span>{saved ? "Saved!" : "Save Receipt Settings"}</span>
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
