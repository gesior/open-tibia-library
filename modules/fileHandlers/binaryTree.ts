import {DataBuffer} from "./dataBuffer";
import {FileStream} from "./fileStream";

export class BinaryTree {
    static BINARYTREE_ESCAPE_CHAR = 0xFD;
    static BINARYTREE_NODE_START = 0xFE;
    static BINARYTREE_NODE_END = 0xFF;

    m_pos = 0xFFFFFFFF;
    m_buffer: DataBuffer;
    m_startPos = 0;

    constructor(protected m_fin: FileStream) {
        this.m_buffer = new DataBuffer();
        this.m_startPos = this.m_fin.tell();
    }

    skipNodes() {
        while (true) {
            let byte = this.m_fin.getU8();
            switch (byte) {
                case BinaryTree.BINARYTREE_NODE_START: {
                    this.skipNodes();
                    break;
                }
                case BinaryTree.BINARYTREE_NODE_END:
                    return;
                case BinaryTree.BINARYTREE_ESCAPE_CHAR:
                    this.m_fin.getU8();
                    break;
                default:
                    break;
            }
        }
    }

    unserialize() {
        if (this.m_pos != 0xFFFFFFFF)
            return;
        this.m_pos = 0;

        this.m_fin.seek(this.m_startPos);
        while (true) {
            let byte = this.m_fin.getU8();
            switch (byte) {
                case BinaryTree.BINARYTREE_NODE_START: {
                    this.skipNodes();
                    break;
                }
                case BinaryTree.BINARYTREE_NODE_END:
                    this.m_pos = 0;
                    // console.log(this.m_buffer);
                    return;
                case BinaryTree.BINARYTREE_ESCAPE_CHAR:
                    this.m_buffer.addU8(this.m_fin.getU8());
                    break;
                default:
                    this.m_buffer.addU8(byte);
                    break;
            }
        }
    }

    getChildren() {
        let children: BinaryTree[] = [];
        this.m_fin.seek(this.m_startPos);
        while (true) {
            let byte = this.m_fin.getU8();
            switch (byte) {
                case BinaryTree.BINARYTREE_NODE_START: {
                    let node = new BinaryTree(this.m_fin);
                    children.push(node);
                    node.skipNodes();
                    break;
                }
                case BinaryTree.BINARYTREE_NODE_END:
                    return children;
                case BinaryTree.BINARYTREE_ESCAPE_CHAR:
                    this.m_fin.getU8();
                    break;
                default:
                    break;
            }
        }
    }

    seek(pos: number) {
        this.unserialize();
        if (pos > this.m_buffer.size())
            throw new Error("BinaryTree: seek failed");
        this.m_pos = pos;
    }

    tell() {
        return this.m_pos;
    }

    skip(len: number) {
        this.unserialize();
        this.seek(this.tell() + len);
    }

    getU8() {
        this.unserialize();
        if (this.m_pos + 1 > this.m_buffer.size())
            throw new Error("BinaryTree: getU8 failed");
        let v = this.m_buffer.getU8(this.m_pos);
        this.m_pos += 1;
        return v;
    }

    getU16() {
        return this.getU8() + this.getU8() * 256;
    }

    getU32() {
        return this.getU16() + this.getU16() * 256 * 256;
    }

    getU64() {
        return this.getU32() + this.getU32() * 256 * 256 * 256 * 256;
    }

    getString(len: number) {
        this.unserialize();
        if (len == 0)
            len = this.getU16();

        if (this.m_pos + len > this.m_buffer.size())
            throw new Error("BinaryTree: getString failed: string length exceeded buffer size.");

        let text = '';
        for (let i = 0; i < len; i++) {
            text += String.fromCharCode(this.getU8());
        }
        return text;
    }

    canRead() {
        this.unserialize();
        return this.m_pos < this.m_buffer.size();
    }

}