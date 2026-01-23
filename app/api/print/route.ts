import { NextRequest, NextResponse } from 'next/server';
import net from 'net';
import { EscPosEncoder } from '@/lib/escpos';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { printer, data } = body;

        if (!printer || !printer.ip) {
            return NextResponse.json({ success: false, error: "Invalid printer configuration" }, { status: 400 });
        }

        const encoder = new EscPosEncoder();

        // Header
        encoder
            .align('center')
            .bold(true).size(2, 2).text(data.businessName || "POS SYSTEM").newline().size(1, 1).bold(false)
            .text(data.addressLine1 || "").newline();

        if (data.addressLine2) encoder.text(data.addressLine2).newline();
        if (data.contactPhone) encoder.text(`Tel: ${data.contactPhone}`).newline();

        encoder.newline()
            .text("--------------------------------").newline()
            .align('left')
            .text(`Table: ${data.tableId}`).newline()
            .text(`Date: ${new Date().toLocaleString()}`).newline()
            .text("--------------------------------").newline();

        // Items
        data.items.forEach((item: any) => {
            const qty = item.quantity.toString();
            const price = (item.price * item.quantity).toFixed(2);
            // Simple column layout
            // Qty (4) Name (18) Price (10) approx for 32 chars (58mm/80mm varies)
            // For now just dumping text line by line
            encoder.text(`${qty}x ${item.name}`).newline();

            // Modifiers
            if (item.selectedModifiers) {
                Object.values(item.selectedModifiers).flat().forEach((mod: any) => {
                    encoder.text(`   + ${mod.label}`).newline();
                });
            }

            encoder.align('right').text(price).align('left').newline();
        });

        encoder.text("--------------------------------").newline();

        // Totals
        encoder.align('right');
        encoder.text(`Subtotal: ${data.subtotal.toFixed(2)}`).newline();
        if (data.discount > 0) encoder.text(`Discount: -${data.discount.toFixed(2)}`).newline();
        if (data.tax > 0) encoder.text(`Tax: ${data.tax.toFixed(2)}`).newline();
        if (data.rounding > 0) encoder.text(`Rounding: ${data.rounding.toFixed(2)}`).newline();

        encoder.bold(true).size(2, 2)
            .text(`TOTAL: ${data.total.toFixed(2)}`)
            .size(1, 1).bold(false).newline();

        encoder.align('center').newline()
            .text(data.footerMessage || "Thank You!").newline()
            .newline().newline()
            .cut();

        if (printer.type === 'main') {
            encoder.cashDrawer();
        }

        const buffer = encoder.encode();

        // Network Socket
        const socket = new net.Socket();

        await new Promise<void>((resolve, reject) => {
            socket.setTimeout(5000);

            socket.connect(printer.port || 9100, printer.ip, () => {
                socket.write(buffer, () => {
                    resolve();
                });
            });

            socket.on('error', (err) => {
                reject(err);
            });

            socket.on('timeout', () => {
                socket.destroy();
                reject(new Error("Connection timed out"));
            });

            socket.on('close', () => {
                // Connection closed
            });
        });

        socket.destroy();

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Print Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
