import {Color} from "../structures/color";
import {Size} from "../structures/size";
import {Point} from "../structures/point";
import {toInt} from "../constants/helpers";
import {OutputFile} from "../fileHandlers/outputFile";
import {DataBuffer} from "../fileHandlers/dataBuffer";
import {InputFile} from "../fileHandlers/inputFile";
import {GameFeature} from "../constants/const";
import {Client} from "../client";
import {SpriteManager} from "./spriteManager";
import {Pixel} from "./pixel";

export class Sprite {
    m_size: Size;
    m_pixels: DataBuffer;

    constructor(size: Size, pixels: DataBuffer = null) {
        this.m_size = size;

        if (pixels) {
            this.m_pixels = pixels;
        } else {
            this.m_pixels = new DataBuffer();
            this.m_pixels.reserve(size.area() * 4);
        }
    }

    blit(dest: Point, other: Sprite) {
        let otherPixels = other.getPixels();
        for (let p = 0; p < other.getPixelsCount(); ++p) {
            let x = toInt(p % other.getWidth());
            let y = toInt(p / other.getWidth());
            let pos = ((dest.y + y) * toInt(this.m_size.width()) + (dest.x + x));

            const otherPixel = otherPixels.getRgbaPixel(p);
            if (otherPixel.a != 0) {
                this.m_pixels.setRgbaPixel(pos, otherPixel);
            } else {
                this.m_pixels.reserveRgbaPixel(pos);
            }
        }
    }

    overwriteMask(color: number, insideColor: number = Color.white, outsideColor: number = Color.alpha) {

    }

    getWidth() {
        return this.m_size.width();
    }

    getHeight() {
        return this.m_size.height();
    }

    getPixel(x: number, y: number): Pixel {
        return this.m_pixels.getRgbaPixel(y * this.m_size.width() + x);
    }

    getPixelsCount(): number {
        return this.m_size.area();
    }

    getPixels() {
        return this.m_pixels;
    }

    readFromSpr(inputFile: InputFile, client: Client) {
        this.m_pixels.clear();

        // skip color key
        inputFile.getU8();
        inputFile.getU8();
        inputFile.getU8();

        let pixelDataSize = inputFile.getU16();

        let writePos = 0;
        let read = 0;
        let useAlpha = client.getFeature(GameFeature.GameSpritesAlphaChannel);
        let channels = useAlpha ? 4 : 3;

        // decompress pixels
        while (read < pixelDataSize && writePos < SpriteManager.SPRITE_DATA_SIZE) {
            let transparentPixels = inputFile.getU16();
            let coloredPixels = inputFile.getU16();

            for (let i = 0; i < transparentPixels && writePos < SpriteManager.SPRITE_DATA_SIZE; i++) {
                this.m_pixels.addU8(0x00);
                this.m_pixels.addU8(0x00);
                this.m_pixels.addU8(0x00);
                this.m_pixels.addU8(0x00);
                writePos += 4;
            }

            for (let i = 0; i < coloredPixels && writePos < SpriteManager.SPRITE_DATA_SIZE; i++) {
                this.m_pixels.addU8(inputFile.getU8());
                this.m_pixels.addU8(inputFile.getU8());
                this.m_pixels.addU8(inputFile.getU8());
                this.m_pixels.addU8(useAlpha ? inputFile.getU8() : 0xFF);
                writePos += 4;
            }

            read += 4 + (channels * coloredPixels);
        }

        // fill remaining pixels with alpha
        while (writePos < SpriteManager.SPRITE_DATA_SIZE) {
            this.m_pixels.addU8(0x00);
            this.m_pixels.addU8(0x00);
            this.m_pixels.addU8(0x00);
            this.m_pixels.addU8(0x00);
            writePos += 4;
        }
    }

    writeToSpr(outputFile: OutputFile, client: Client) {
        outputFile.addU8(255);
        outputFile.addU8(0);
        outputFile.addU8(255);

        let pixelsSprData = this.getSprData(client);
        outputFile.addU16(pixelsSprData.size());
        for (let i = 0; i < pixelsSprData.size(); i++) {
            outputFile.addU8(pixelsSprData.getU8(i));
        }
    }

    getSprData(client: Client) {
        let pixelsSprData = new DataBuffer();

        let useAlpha = client.getFeature(GameFeature.GameSpritesAlphaChannel);
        let bytesPerPixel = useAlpha ? 4 : 3;

        let read = 0;
        let pixel = this.m_pixels.getRgbaPixel(read++);
        while (read < this.getPixelsCount()) {
            let transparentPixels = 0;
            let coloredPixels: Pixel[] = [];


            while (pixel.isTransparent()) {
                transparentPixels++;
                if (read == this.getPixelsCount())
                    break;
                pixel = this.m_pixels.getRgbaPixel(read++);
            }

            while (!pixel.isTransparent()) {
                coloredPixels.push(pixel);
                if (read == this.getPixelsCount())
                    break;
                pixel = this.m_pixels.getRgbaPixel(read++);
            }

            pixelsSprData.addU16(transparentPixels);
            pixelsSprData.addU16(coloredPixels.length);

            for (let coloredPixel of coloredPixels) {
                pixelsSprData.addPixel(coloredPixel, bytesPerPixel)
            }
        }

        return pixelsSprData;
    }
}