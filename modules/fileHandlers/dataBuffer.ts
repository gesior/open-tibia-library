import {Position} from "../structures/position";
import {Pixel} from "../sprFile/pixel";
import {Client} from "../client";
import {GameFeature} from "../constants/const";

export class DataBuffer {
    m_size = 0;
    m_buffer : DataView;

    constructor(public m_capacity: number = 64) {
        this.m_buffer = new DataView(new ArrayBuffer(this.m_capacity));
    }

    getUint8Array() : Uint8Array {
        return new Uint8Array(this.m_buffer.buffer, 0, this.size());
    }

    reserve(newSize: number) {
        if (newSize > this.m_capacity) {
            let buffer = new DataView(new ArrayBuffer(newSize));
            for (let i = 0; i < this.m_size; ++i) {
                buffer.setUint8(i, this.m_buffer.getUint8(i));
            }

            this.m_buffer = buffer;
            this.m_capacity = newSize;
        }
    }

    grow(newSize: number) {
        if (newSize <= this.m_size) {
            return;
        }
        if (newSize > this.m_capacity) {
            let newcapacity = this.m_capacity;
            do {
                newcapacity *= 2;
            } while (newcapacity < newSize);
            this.reserve(newcapacity)
        }
        this.m_size = newSize;
    }

    addU8(value: number) {
        this.grow(this.m_size + 1);
        this.m_buffer.setUint8(this.m_size - 1, value);
        return 1;
    }

    addU16(value: number) {
        this.grow(this.m_size + 2);
        this.m_buffer.setUint16(this.m_size - 2, value, true);
        return 2;
    }

    addU32(value: number) {
        this.grow(this.m_size + 4);
        this.m_buffer.setUint32(this.m_size - 4, value, true);
        return 4;
    }

    add8(value: number) {
        this.grow(this.m_size + 1);
        this.m_buffer.setInt8(this.m_size - 1, value);
        return 1;
    }

    add16(value: number) {
        this.grow(this.m_size + 2);
        this.m_buffer.setInt16(this.m_size - 2, value, true);
        return 2;
    }

    add32(value: number) {
        this.grow(this.m_size + 4);
        this.m_buffer.setInt32(this.m_size - 4, value, true);
        return 4;
    }

    addString(value: string) {
        this.grow(this.m_size + 2 + value.length);
        this.m_buffer.setUint16(this.m_size - 2 - value.length, value.length, true);
        for (let i = 0; i < value.length; i++) {
            this.m_buffer.setUint8(this.m_size - value.length + i, value.charCodeAt(i));
        }
        return 2 + value.length;
    }

    addPixel(pixel: Pixel, bytesPerPixel: number) {
        if (bytesPerPixel == 4) {
            this.grow(this.m_size + 4);
            this.m_buffer.setUint8(this.m_size - 4, pixel.r);
            this.m_buffer.setUint8(this.m_size - 3, pixel.g);
            this.m_buffer.setUint8(this.m_size - 2, pixel.b);
            this.m_buffer.setUint8(this.m_size - 1, pixel.a);
            return 4;
        } else {
            this.grow(this.m_size + 3);
            this.m_buffer.setUint8(this.m_size - 3, pixel.r);
            this.m_buffer.setUint8(this.m_size - 2, pixel.g);
            this.m_buffer.setUint8(this.m_size - 1, pixel.b);
            return 3;
        }
    }

    setU8(offset:  number, value: number) {
        this.grow(offset + 1);
        this.m_buffer.setUint8(offset, value);
    }

    setU32(offset:  number, value: number) {
        this.grow(offset + 4);
        this.m_buffer.setInt32(offset - 4, value, true);
    }

    setPixel(offset: number, pixel: Pixel, bytesPerPixel: number) {
        this.setU8(offset, pixel.r);
        this.setU8(offset+1, pixel.g);
        this.setU8(offset+2, pixel.b);
        if (bytesPerPixel == 4) {
            this.setU8(offset+3, pixel.a);
        }
    }

    getU8(offset) {
        if (offset + 1 > this.size())
            throw new Error("DataBuffer: getU8 failed");

        return this.m_buffer.getUint8(offset);
    }

    getU16(offset) {
        if (offset + 2 > this.size())
            throw new Error("DataBuffer: getU16 failed");

        return this.m_buffer.getUint16(offset, true);
    }

    getU32(offset) {
        if (offset + 4 > this.size())
            throw new Error("DataBuffer: getU32 failed");

        return this.m_buffer.getUint32(offset, true);
    }

    get8(offset) {
        if (offset + 1 > this.size())
            throw new Error("DataBuffer: get8 failed");

        return this.m_buffer.getInt8(offset);
    }

    get16(offset) {
        if (offset + 2 > this.size())
            throw new Error("DataBuffer: get16 failed");

        return this.m_buffer.getInt16(offset, true);
    }

    get32(offset) {
        if (offset + 4 > this.size())
            throw new Error("DataBuffer: get32 failed");

        return this.m_buffer.getInt32(offset, true);
    }

    getDouble(offset) {
        if (offset + 8 > this.size())
            throw new Error("DataBuffer: getDouble failed");

        return this.m_buffer.getFloat64(offset, true);
    }

    getString(offset): string {
        const length = this.getU16(offset);
        let text = '';
        for (let i = 0; i < length; i++) {
            text += String.fromCharCode(this.getU8(offset + 2 + i));
        }
        return text;
    }

    getBytes(offset: number, bytesCount: number): ArrayBuffer {
        if (bytesCount == -1)
            bytesCount = this.size() - offset;

        if (offset + bytesCount > this.size())
            throw new Error("Invalid offset. Cannot read.");

        return this.m_buffer.buffer.slice(offset, offset + bytesCount);
    }

    getPosition(offset: number): Position {
        if (offset + 5 > this.size())
            throw new Error("DataBuffer: getPosition failed");

        return new Position(this.getU16(offset), this.getU16(offset + 2), this.getU8(offset + 4));
    }

    getRgbaPixel(offset: number): Pixel {
        offset = offset * 4;
        if (offset + 4 > this.size())
            throw new Error("DataBuffer: readPixel failed");

        return new Pixel(this.getU8(offset), this.getU8(offset + 1), this.getU8(offset + 2), this.getU8(offset + 3));
    }

    size() {
        return this.m_size;
    }

    clear() {
        this.m_size = 0;
        this.m_capacity = 64;
        this.m_buffer = new DataView(new ArrayBuffer(this.m_capacity));
    }

}