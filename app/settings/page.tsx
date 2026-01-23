"use client";

import { useState } from "react";
import { Settings, Printer, Percent } from "lucide-react";
import { clsx } from "clsx";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useToast } from "@/components/Toast";

const TABS = [
    { id: "general", label: "General", icon: Settings },
    { id: "printers", label: "Printers", icon: Printer },
    { id: "taxes", label: "Taxes", icon: Percent },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    const { restaurant, printer, updateRestaurantSettings, updatePrinterSettings } = useSettingsStore();
    const { showToast } = useToast();

    const handleRestaurantChange = (field: keyof typeof restaurant, value: string) => {
        updateRestaurantSettings({ [field]: value });
    };

    return (
        <div className="h-full flex">
            {/* Settings Sidebar */}
            <div className="w-64 bg-pos-panel border-r border-pos-border p-4 space-y-2">
                <h2 className="text-xl font-bold text-white mb-6 px-2">Settings</h2>
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
                            activeTab === tab.id
                                ? "bg-pos-accent text-white"
                                : "text-pos-text-secondary hover:bg-pos-bg hover:text-pos-text-primary"
                        )}
                    >
                        <tab.icon size={20} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-8 bg-pos-bg overflow-y-auto">
                <div className="max-w-xl">
                    {activeTab === "general" && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-white mb-4">General Settings</h3>
                            <div className="bg-pos-panel border border-pos-border rounded-xl p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-pos-text-secondary text-sm font-bold uppercase">Restaurant Name</label>
                                    <input
                                        value={restaurant.name}
                                        onChange={(e) => handleRestaurantChange('name', e.target.value)}
                                        className="w-full bg-pos-bg border border-pos-border rounded-lg p-3 text-white focus:border-pos-accent outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-pos-text-secondary text-sm font-bold uppercase">Address</label>
                                    <textarea
                                        value={restaurant.address}
                                        onChange={(e) => handleRestaurantChange('address', e.target.value)}
                                        rows={3}
                                        className="w-full bg-pos-bg border border-pos-border rounded-lg p-3 text-white focus:border-pos-accent outline-none resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-pos-text-secondary text-sm font-bold uppercase">Phone</label>
                                    <input
                                        value={restaurant.phone}
                                        onChange={(e) => handleRestaurantChange('phone', e.target.value)}
                                        className="w-full bg-pos-bg border border-pos-border rounded-lg p-3 text-white focus:border-pos-accent outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-pos-text-secondary text-sm font-bold uppercase">Receipt Footer Message</label>
                                    <input
                                        value={restaurant.footerMessage}
                                        onChange={(e) => handleRestaurantChange('footerMessage', e.target.value)}
                                        className="w-full bg-pos-bg border border-pos-border rounded-lg p-3 text-white focus:border-pos-accent outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === "printers" && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-white mb-4">Printer Configuration</h3>

                            <div className="bg-pos-panel rounded-xl border border-pos-border p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-white">Auto Print Receipts</h4>
                                        <p className="text-sm text-pos-text-secondary">print receipt immediately after payment</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={printer.autoPrint}
                                            onChange={(e) => updatePrinterSettings({ autoPrint: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-pos-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pos-accent"></div>
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-pos-text-secondary text-sm font-bold uppercase">Paper Width</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => updatePrinterSettings({ paperWidth: '80mm' })}
                                            className={clsx(
                                                "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                                                printer.paperWidth === '80mm'
                                                    ? "bg-pos-accent/20 border-pos-accent text-white"
                                                    : "bg-pos-bg border-pos-border text-pos-text-secondary hover:border-pos-text-secondary"
                                            )}
                                        >
                                            <Printer size={32} />
                                            <span className="font-bold">80mm (Standard)</span>
                                        </button>
                                        <button
                                            onClick={() => updatePrinterSettings({ paperWidth: '58mm' })}
                                            className={clsx(
                                                "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                                                printer.paperWidth === '58mm'
                                                    ? "bg-pos-accent/20 border-pos-accent text-white"
                                                    : "bg-pos-bg border-pos-border text-pos-text-secondary hover:border-pos-text-secondary"
                                            )}
                                        >
                                            <Printer size={24} />
                                            <span className="font-bold">58mm (Narrow)</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-pos-border">
                                    <button
                                        onClick={() => window.print()}
                                        className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Test Print Receipt
                                    </button>
                                    <p className="text-center text-xs text-pos-text-secondary mt-2">
                                        This will print a sample receipt using current settings.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === "taxes" && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-white mb-4">Tax Rates</h3>
                            <div className="bg-pos-panel p-6 rounded-xl border border-pos-border text-center text-pos-text-secondary">
                                Tax settings coming soon.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
