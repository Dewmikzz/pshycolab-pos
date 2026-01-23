export class EscPosEncoder {
    private buffer: number[] = [];

    public initialize(): this {
        this.buffer.push(0x1B, 0x40); // ESC @
        return this;
    }

    public text(content: string): this {
        // Simple encoding, assuming ASCII/UTF-8 compatible for basic chars
        for (let i = 0; i < content.length; i++) {
            this.buffer.push(content.charCodeAt(i));
        }
        return this;
    }

    public newline(): this {
        this.buffer.push(0x0A); // LF
        return this;
    }

    public feed(lines: number = 1): this {
        for (let i = 0; i < lines; i++) {
            this.buffer.push(0x0A);
        }
        return this;
    }

    public align(alignment: 'left' | 'center' | 'right'): this {
        this.buffer.push(0x1B, 0x61); // ESC a
        if (alignment === 'center') this.buffer.push(1);
        else if (alignment === 'right') this.buffer.push(2);
        else this.buffer.push(0); // left
        return this;
    }

    public bold(enable: boolean): this {
        this.buffer.push(0x1B, 0x45, enable ? 1 : 0); // ESC E n
        return this;
    }

    public size(width: number, height: number): this {
        // GS ! n
        // Width: 0-7 (1-8x), Height: 0-7 (1-8x)
        // Byte = (width << 4) | height
        const n = ((width & 0x07) << 4) | (height & 0x07);
        this.buffer.push(0x1D, 0x21, n);
        return this;
    }

    public cut(): this {
        this.buffer.push(0x1D, 0x56, 66, 0); // GS V B 0 (Partial cut)
        return this;
    }

    public cashDrawer(): this {
        this.buffer.push(0x1B, 0x70, 0, 25, 250); // Pulse to pin 2 (standard)
        return this;
    }

    public encode(): Uint8Array {
        return new Uint8Array(this.buffer);
    }
}
