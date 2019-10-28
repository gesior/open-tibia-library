import {DataBuffer} from "./dataBuffer";
import {InputFile} from "./inputFile";
import {Point} from "../structures/point";
import {BinaryTree} from "./binaryTree";

/**
 * In OutputBinaryTree we got to add BINARYTREE_ESCAPE_CHAR before every special character.
 * We also need to operate on bytes of numbers, so code is a bit dirty.
 */
export class OutputBinaryTree extends BinaryTree {
    static BINARYTREE_ESCAPE_CHAR = 0xFD;
    static BINARYTREE_NODE_START = 0xFE;
    static BINARYTREE_NODE_END = 0xFF;

    m_pos = 0xFFFFFFFF;
    m_buffer: DataBuffer;
    m_startPos = 0;

    constructor(protected m_fin: InputFile) {
        super(m_fin);
        this.startNode(0);
    }

    addU8(value: number) {
        value = value % 256;

        if (value == BinaryTree.BINARYTREE_NODE_START ||
            value === BinaryTree.BINARYTREE_NODE_END ||
            value === BinaryTree.BINARYTREE_ESCAPE_CHAR) {
            this.m_buffer.addU8(BinaryTree.BINARYTREE_ESCAPE_CHAR);
        }

        this.m_buffer.addU8(value);
    }

    addU16(value: number) {
        value = value % 65536;
        const b2 = value / 256;
        value -= b2;
        const b1 = value;

        this.m_buffer.addU8(b1);
        this.m_buffer.addU8(b2);
    }

    addU32(value: number) {
        value = value % 4294967296;
        const b4 = value / 16777216;
        value -= b4;
        const b3 = value / 65536;
        value -= b3;
        const b2 = value / 256;
        value -= b2;
        const b1 = value;

        this.m_buffer.addU8(b1);
        this.m_buffer.addU8(b2);
        this.m_buffer.addU8(b3);
        this.m_buffer.addU8(b4);
    }

    addString(value: string) {
        this.addU16(value.length);
        for (let i = 0; i < value.length; i++) {
            this.addU8(value.charCodeAt(i));
        }
    }

    addPos(x: number, y: number, z: number) {
        this.addU16(x);
        this.addU16(y);
        this.addU8(z);
    }

    addPoint(point: Point) {
        this.addU8(point.x);
        this.addU8(point.y);
    }

    startNode(node: number) {
        this.m_buffer.addU8(BinaryTree.BINARYTREE_NODE_START);
        this.addU8(node);
    }

    endNode() {
        this.m_buffer.addU8(BinaryTree.BINARYTREE_NODE_END);
    }

}