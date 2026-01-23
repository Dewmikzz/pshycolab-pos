export class EscPosEncoder {
    private buffer: number[] = [];

    constructor() {
        this.initialize();
    }

    private initialize() {
        this.buffer.push(0x1B, 0x40); // ESC @ (Initialize)
    }

    text(text: string) {
        // Simple encoding, assume ASCII for now
        // For Unicode/Thai/Chinese later we might need specific code pages or iconv
        for (let i = 0; i < text.length; i++) {
            this.buffer.push(text.charCodeAt(i));
        }
        return this;
    }

    newline() {
        this.buffer.push(0x0A);
        return this;
    }

    align(align: 'left' | 'center' | 'right') {
        this.buffer.push(0x1B, 0x61);
        if (align === 'center') this.buffer.push(1);
        else if (align === 'right') this.buffer.push(2);
        else this.buffer.push(0);
        return this;
    }

    bold(enable: boolean) {
        this.buffer.push(0x1B, 0x45, enable ? 1 : 0);
        return this;
    }

    size(width: number, height: number) {
        // GS ! n
        // 0-7 for width/height
        // width << 4 | height
        const n = ((width - 1) << 4) | (height - 1);
        this.buffer.push(0x1D, 0x21, n);
        return this;
    }

    cut() {
        this.buffer.push(0x1D, 0x56, 66, 0); // GS V B 0 (Feeds paper & cut)
        return this;
    }

    // Cash Drawer Kick
    cashDrawer() {
        this.buffer.push(0x1B, 0x70, 0, 25, 250); // ESC p 0 t1 t2
        return this;
    }

    encode(): Uint8Array {
        return new Uint8Array(this.buffer);
    }
}
