import {FileStream} from "./fileStream";
import {DataBuffer} from "./dataBuffer";

export class InputFile extends FileStream {
    constructor(msg: DataView) {
        super();
        this.data = new DataBuffer();
        this.data.m_buffer = msg;
        this.data.m_size = msg.byteLength;
        this.data.m_capacity = msg.byteLength;
        this.offset = 0;
    }

    static fromUint8Array(bytes: Uint8Array): InputFile {
        return new InputFile(new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength));
    }

}