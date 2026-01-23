"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { Receipt } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface ReceiptTemplateProps {
    receipt?: Receipt; // If provided, print this receipt. If null, print "Test Receipt"
    isPreview?: boolean; // If true, show in UI (optional)
}

export function ReceiptTemplate({ receipt }: ReceiptTemplateProps) {
    const { receiptSettings } = useSettingsStore();

    // Mock data for test print if no receipt provided
    const data = receipt || {
        id: "TEST-001",
        receiptNumber: "TEST-123456",
        timestamp: Date.now(),
        items: [
            { id: "1", name: "Test Burger", quantity: 2, price: 15.00, cartItemId: "1" },
            { id: "2", name: "Fries", quantity: 1, price: 5.00, cartItemId: "2" },
        ],
        subtotal: 35.00,
        tax: 1.75,
        rounding: 0.00,
        total: 36.75,
        paymentMethod: "cash",
        paidAmount: 40.00,
        change: 3.25,
        tableId: "1"
    } as Receipt;

    const date = new Date(data.timestamp).toLocaleString();

    return (
        <div className="hidden print:block print:w-[80mm] print:overflow-hidden print:font-mono print:text-black print:bg-white print:leading-tight">
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #receipt-template, #receipt-template * {
                        visibility: visible;
                    }
                    #receipt-template {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 80mm;
                        padding: 5mm;
                    }
                }
            `}</style>
            <div id="receipt-template">
                {/* Header */}
                <div className="text-center mb-4">
                    <h1 className="text-xl font-bold uppercase">{receiptSettings.businessName}</h1>
                    <p className="text-sm">{receiptSettings.addressLine1}</p>
                    {receiptSettings.addressLine2 && <p className="text-sm">{receiptSettings.addressLine2}</p>}
                    <p className="text-sm">{receiptSettings.contactPhone}</p>
                </div>

                {/* Info */}
                <div className="mb-4 text-sm border-b border-black/50 pb-2">
                    <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{date}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Receipt #:</span>
                        <span>{data.receiptNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Table:</span>
                        <span>{data.tableId}</span>
                    </div>
                </div>

                {/* Items */}
                <div className="mb-4 text-sm">
                    <div className="grid grid-cols-12 font-bold border-b border-black mb-1">
                        <div className="col-span-1">Q</div>
                        <div className="col-span-7">Item</div>
                        <div className="col-span-4 text-right">Amt</div>
                    </div>
                    {data.items.map((item, i) => (
                        <div key={i} className="grid grid-cols-12 mb-1">
                            <div className="col-span-1">{item.quantity}</div>
                            <div className="col-span-7">
                                <div>{item.name}</div>
                                {item.selectedModifiers && Object.values(item.selectedModifiers).flat().map((mod, idx) => (
                                    <div key={idx} className="text-xs pl-2 text-gray-600">- {mod.label}</div>
                                ))}
                            </div>
                            <div className="col-span-4 text-right">{formatCurrency(item.price * item.quantity)}</div>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className="mb-4 text-sm border-t border-black/50 pt-2 space-y-1">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(data.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax</span>
                        <span>{formatCurrency(data.tax)}</span>
                    </div>
                    {data.rounding !== 0 && (
                        <div className="flex justify-between italic text-xs">
                            <span>Rounding</span>
                            <span>{formatCurrency(data.rounding)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-lg mt-2 border-t border-black border-dashed pt-2">
                        <span>Total</span>
                        <span>{formatCurrency(data.total)}</span>
                    </div>
                </div>

                {/* Payment */}
                <div className="mb-6 text-sm">
                    <div className="flex justify-between">
                        <span className="uppercase">{data.paymentMethod}</span>
                        <span>{formatCurrency(data.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Change</span>
                        <span>{formatCurrency(data.change)}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-sm">
                    <p>{receiptSettings.footerMessage}</p>
                    <div className="mt-4 text-xs font-mono">
                        *** THANK YOU ***
                    </div>
                </div>
            </div>
        </div>
    );
}
