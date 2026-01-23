"use client";

import { useState } from "react";
import { useSettingsStore, PrinterConfig } from "@/store/useSettingsStore";
import { Lock, FileText, Save, Check, Printer, Plus, Trash2, Edit2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
    const {
        lockPassword,
        setLockPassword,
        isLocked,
        setLocked,
        receiptSettings,
        updateReceiptSettings,
        printers,
        addPrinter,
        removePrinter,
        updatePrinter
    } = useSettingsStore();

    const [activeTab, setActiveTab] = useState<'security' | 'receipt' | 'printers'>('security');
    const [tempPassword, setTempPassword] = useState(lockPassword);
    const [saved, setSaved] = useState(false);

    // Form states for receipt
    const [receiptForm, setReceiptForm] = useState(receiptSettings);

    // Printer Form State
    const [isEditingPrinter, setIsEditingPrinter] = useState(false);
    const [printerForm, setPrinterForm] = useState<PrinterConfig>({
        id: "",
        name: "",
        type: "main",
        connection: "ip",
        ip: "192.168.1.100",
        port: 9100
    });

    const handleSaveSecurity = () => {
        setLockPassword(tempPassword);
        showSaved();
    };

    const handleSaveReceipt = () => {
        updateReceiptSettings(receiptForm);
        showSaved();
    };

    const handleSavePrinter = () => {
        if (printerForm.id) {
            updatePrinter(printerForm.id, printerForm);
        } else {
            addPrinter({ ...printerForm, id: Date.now().toString() });
        }
        setIsEditingPrinter(false);
        setPrinterForm({ id: "", name: "", type: "main", connection: "ip", ip: "", port: 9100 });
        showSaved();
    };

    const handleEditPrinter = (p: PrinterConfig) => {
        setPrinterForm(p);
        setIsEditingPrinter(true);
    };

    const handleDeletePrinter = (id: string) => {
        if (confirm("Delete this printer?")) {
            removePrinter(id);
        }
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
                    <button
                        onClick={() => setActiveTab('printers')}
                        className={`flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${activeTab === 'printers' ? 'bg-pos-accent text-white' : 'text-pos-text-secondary hover:bg-pos-bg hover:text-white'}`}
                    >
                        <Printer size={20} />
                        <span className="font-bold">Printers</span>
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

                    {activeTab === 'printers' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Printer Configuration</h2>
                                <button
                                    onClick={() => { setIsEditingPrinter(true); setPrinterForm({ id: "", name: "", type: "main", connection: "ip", ip: "", port: 9100 }); }}
                                    className="flex items-center gap-2 bg-pos-accent px-4 py-2 rounded-lg text-white font-bold hover:brightness-110"
                                >
                                    <Plus size={18} />
                                    <span>Add Printer</span>
                                </button>
                            </div>

                            {/* Printer List */}
                            <div className="grid grid-cols-1 gap-4">
                                {printers.length === 0 ? (
                                    <div className="text-pos-text-secondary text-center py-8 bg-pos-bg rounded-xl border border-pos-border">
                                        No printers configured. Add one to enable silent IP printing.
                                    </div>
                                ) : (
                                    printers.map(printer => (
                                        <div key={printer.id} className="bg-pos-bg border border-pos-border rounded-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-pos-panel rounded-lg flex items-center justify-center text-pos-accent">
                                                    <Printer size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white">{printer.name}</h3>
                                                    <div className="flex flex-wrap gap-2 text-xs text-pos-text-secondary mt-1">
                                                        <span className="uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10">{printer.type}</span>
                                                        <span className="uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10">{printer.connection}</span>
                                                        <span className="font-mono bg-black/20 px-2 py-0.5 rounded">{printer.ip}:{printer.port}</span>
                                                        {printer.categories && printer.categories.length > 0 && (
                                                            <span className="bg-pos-accent/20 text-pos-accent px-2 py-0.5 rounded flex items-center gap-1">
                                                                {printer.categories.length} Cats
                                                            </span>
                                                        )}
                                                        {printer.isSplitTicket && (
                                                            <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded">Split</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEditPrinter(printer)} className="p-2 hover:bg-white/10 rounded-lg text-white">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDeletePrinter(printer.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-500">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Printer Config Form */}
                            {isEditingPrinter && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                                    <div className="bg-pos-panel w-full max-w-md rounded-2xl p-6 shadow-2xl border border-pos-border">
                                        <h3 className="text-xl font-bold text-white mb-4">{printerForm.id ? "Edit Printer" : "Add Printer"}</h3>

                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm text-pos-text-secondary">Printer Name</label>
                                                <input
                                                    type="text"
                                                    value={printerForm.name}
                                                    onChange={e => setPrinterForm({ ...printerForm, name: e.target.value })}
                                                    className="bg-pos-bg border border-pos-border p-3 rounded-lg text-white outline-none focus:border-pos-accent"
                                                    placeholder="e.g. Counter Printer"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm text-pos-text-secondary">Type</label>
                                                    <select
                                                        value={printerForm.type}
                                                        // @ts-ignore
                                                        onChange={e => setPrinterForm({ ...printerForm, type: e.target.value })}
                                                        className="bg-pos-bg border border-pos-border p-3 rounded-lg text-white outline-none focus:border-pos-accent"
                                                    >
                                                        <option value="main">Main (Cashier)</option>
                                                        <option value="kitchen">Kitchen</option>
                                                        <option value="bar">Bar</option>
                                                    </select>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm text-pos-text-secondary">Connection</label>
                                                    <select
                                                        value={printerForm.connection}
                                                        // @ts-ignore
                                                        onChange={e => setPrinterForm({ ...printerForm, connection: e.target.value })}
                                                        className="bg-pos-bg border border-pos-border p-3 rounded-lg text-white outline-none focus:border-pos-accent"
                                                    >
                                                        <option value="lan">LAN (Ethernet)</option>
                                                        <option value="ip">WiFi / IP</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="col-span-2 flex flex-col gap-2">
                                                    <label className="text-sm text-pos-text-secondary">IP Address</label>
                                                    <input
                                                        type="text"
                                                        value={printerForm.ip}
                                                        onChange={e => setPrinterForm({ ...printerForm, ip: e.target.value })}
                                                        className="bg-pos-bg border border-pos-border p-3 rounded-lg text-white outline-none focus:border-pos-accent font-mono"
                                                        placeholder="192.168.1.xxx"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm text-pos-text-secondary">Port</label>
                                                    <input
                                                        type="number"
                                                        value={printerForm.port}
                                                        onChange={e => setPrinterForm({ ...printerForm, port: parseInt(e.target.value) || 9100 })}
                                                        className="bg-pos-bg border border-pos-border p-3 rounded-lg text-white outline-none focus:border-pos-accent font-mono"
                                                        placeholder="9100"
                                                    />
                                                </div>
                                            </div>

                                            {/* Advanced Settings for Kitchen/Bar */}
                                            {printerForm.type !== 'main' && (
                                                <div className="p-4 bg-pos-bg rounded-lg border border-pos-border space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-bold text-white">Item Splitting</span>
                                                        <button
                                                            onClick={() => setPrinterForm({ ...printerForm, isSplitTicket: !printerForm.isSplitTicket })}
                                                            className={`w-12 h-6 rounded-full p-1 transition-colors ${printerForm.isSplitTicket ? 'bg-pos-accent' : 'bg-pos-border'}`}
                                                        >
                                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${printerForm.isSplitTicket ? 'translate-x-6' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-pos-text-secondary">If enabled, prints one ticket per item quantity (e.g. 2 Burgers = 2 Tickets).</p>

                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-sm text-pos-text-secondary">Categories</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {['food', 'beverage', 'dessert'].map(cat => (
                                                                <button
                                                                    key={cat}
                                                                    onClick={() => {
                                                                        const current = printerForm.categories || [];
                                                                        const updated = current.includes(cat)
                                                                            ? current.filter(c => c !== cat)
                                                                            : [...current, cat];
                                                                        setPrinterForm({ ...printerForm, categories: updated });
                                                                    }}
                                                                    className={`px-3 py-1 rounded-full text-xs font-bold border ${printerForm.categories?.includes(cat) ? 'bg-pos-accent border-pos-accent text-white' : 'border-pos-border text-pos-text-secondary hover:text-white'}`}
                                                                >
                                                                    {cat.toUpperCase()}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <p className="text-xs text-pos-text-secondary">Select categories routed to this printer.</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="pt-2">
                                                <button
                                                    onClick={() => {
                                                        const testToast = window.confirm("Send test print command to " + printerForm.ip + "?");
                                                        if (testToast) {
                                                            fetch('/api/print', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ action: 'test', printer: printerForm })
                                                            }).then(() => alert("Test Sent")).catch(e => alert("Error: " + e));
                                                        }
                                                    }}
                                                    className="w-full py-2 bg-pos-text-secondary/10 hover:bg-pos-text-secondary/20 text-pos-text-secondary rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                                                >
                                                    <Printer size={16} />
                                                    Test Connection
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 mt-8">
                                            <button onClick={() => setIsEditingPrinter(false)} className="px-4 py-2 text-pos-text-secondary hover:text-white">Cancel</button>
                                            <button onClick={handleSavePrinter} className="px-6 py-2 bg-pos-accent text-white rounded-lg font-bold hover:brightness-110">Save Printer</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
