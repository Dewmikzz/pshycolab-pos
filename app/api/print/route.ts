import { NextRequest, NextResponse } from 'next/server';
import net from 'net';
import { EscPosEncoder } from '@/lib/escpos';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, printer, data } = body;

        console.log(`[API/Print] Action: ${action || 'print'}, Type: ${printer.type}, IP: ${printer.ip}`);

        if (!printer || !printer.ip) {
            return NextResponse.json({ success: false, error: "Invalid printer configuration" }, { status: 400 });
        }

        const encoder = new EscPosEncoder();
        let buffer: Uint8Array;

        if (action === 'test') {
            // --- TEST PRINT ---
            encoder
                .initialize()
                .align('center')
                .text('CONNECTION TEST SUCCESS')
                .text('--------------------------------')
                .text(`Printer: ${printer.name}`)
                .text(`IP: ${printer.ip}`)
                .text(`Port: ${printer.port}`)
                .feed(2)
                .cut();
            buffer = encoder.encode();
        } else {
            // --- ACTUAL PRINTING ---
            if (!data) {
                return NextResponse.json({ success: false, error: "No data provided" }, { status: 400 });
            }

            encoder.initialize();

            if (printer.type === 'main') {
                // === BILL FORMAT (MAIN) ===
                encoder
                    .align('center')
                    .bold(true).size(1, 1).text(data.businessName || 'POS Terminal').size(0, 0).bold(false)
                    .feed(1)
                    .text(data.addressLine1 || '')
                    .text(data.addressLine2 || '')
                    .text(`Tel: ${data.contactPhone || ''}`)
                    .feed(1)
                    .text(`Table: ${data.tableId}`)
                    .text(`Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`)
                    .text('--------------------------------');

                // Items
                encoder.align('left');
                data.items.forEach((item: any) => {
                    const price = (item.price * item.quantity).toFixed(2);
                    const line = `${item.quantity}x ${item.name}`;
                    // Simple spacing logic - could be improved
                    encoder.text(`${line} ... ${price}`);

                    if (item.selectedModifiers) {
                        const mods = Object.values(item.selectedModifiers).flat() as any[];
                        mods.forEach(m => encoder.text(`   + ${m.label}`));
                    }
                });

                encoder.align('center').text('--------------------------------');

                // Totals
                encoder.align('right');
                if (data.discount > 0) encoder.text(`Subtotal: ${data.subtotal.toFixed(2)}`);
                if (data.discount > 0) encoder.text(`Discount: -${data.discount.toFixed(2)}`);
                encoder.text(`Tax: ${data.tax.toFixed(2)}`);
                encoder.text(`Rounding: ${data.rounding.toFixed(2)}`);
                encoder.bold(true).size(1, 0).text(`TOTAL: ${data.total.toFixed(2)}`).size(0, 0).bold(false);

                encoder.align('center').feed(1).text(data.footerMessage || 'Thank you!').feed(2);

                // Kick drawer for main printer receipt
                encoder.cashDrawer();
                encoder.cut();

                buffer = encoder.encode();

            } else {
                // === ORDER TICKET (KITCHEN/BAR) ===
                const isSplit = printer.isSplitTicket;

                if (isSplit) {
                    // --- SPLIT TICKET MODE (One ticket per item quantity) ---
                    data.items.forEach((item: any) => {
                        for (let i = 0; i < item.quantity; i++) {
                            encoder
                                .initialize() // Reset for new ticket
                                .align('center')
                                .size(1, 1).text(`${printer.type.toUpperCase()} TICKET`).size(0, 0)
                                .text(`Table: ${data.tableId} | #${data.tableId.slice(-4)}`) // Unique ref if needed
                                .text(new Date().toLocaleTimeString())
                                .text('--------------------------------')
                                .align('left')
                                .size(1, 1).text(`1x ${item.name}`).size(0, 0); // Always 1x per ticket

                            if (item.selectedModifiers) {
                                const mods = Object.values(item.selectedModifiers).flat() as any[];
                                mods.forEach(m => encoder.text(`   + ${m.label}`));
                            }

                            encoder.feed(2).cut();
                        }
                    });
                    buffer = encoder.encode();

                } else {
                    // --- CONSOLIDATED ORDER LIST ---
                    encoder
                        .align('center')
                        .size(1, 1).text(`${printer.type.toUpperCase()} ORDER`).size(0, 0)
                        .text(`Table: ${data.tableId}`)
                        .text(new Date().toLocaleTimeString())
                        .text('--------------------------------')
                        .align('left');

                    data.items.forEach((item: any) => {
                        encoder.size(1, 0).text(`${item.quantity}x ${item.name}`).size(0, 0);
                        if (item.selectedModifiers) {
                            const mods = Object.values(item.selectedModifiers).flat() as any[];
                            mods.forEach(m => encoder.text(`   + ${m.label}`));
                        }
                        encoder.text('----------------');
                    });

                    encoder.feed(2).cut();
                    buffer = encoder.encode();
                }
            }
        }

        // --- SEND TO PRINTER ---
        const socket = new net.Socket();

        // Timeout handling
        socket.setTimeout(3000); // 3s timeout

        await new Promise<void>((resolve, reject) => {
            socket.on('timeout', () => {
                socket.destroy();
                reject(new Error("Connection timed out"));
            });

            socket.on('error', (err) => {
                socket.destroy();
                reject(err);
            });

            socket.connect(printer.port || 9100, printer.ip, () => {
                socket.write(buffer, (err) => {
                    if (err) reject(err);
                    else {
                        socket.end(); // Close after write
                        resolve();
                    }
                });
            });
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("[API/Print] Error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
