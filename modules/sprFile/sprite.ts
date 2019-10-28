import {Color} from "../structures/color";
import {Size} from "../structures/size";
import {Point} from "../structures/point";
import {toInt} from "../constants/helpers";

export class Sprite {
    m_size: Size;
    m_bpp: number;
    m_pixels: number[] = [];

    constructor(size: Size, bpp: number = 4, pixels: number[] = null) {
        this.m_size = size;
        this.m_bpp = bpp;

        if (pixels) {
            this.m_pixels = pixels.slice();
        } else {
            this.m_pixels = [];
            let bytes = size.area() * bpp;
            for (let i = 0; i < bytes; ++i) {
                this.m_pixels.push(0);
            }
        }
    }

    blit(dest: Point, other: Sprite) {
        let otherPixels = other.getPixels();
        for (let p = 0; p < other.getPixelCount(); ++p) {
            let x = toInt(p % other.getWidth());
            let y = toInt(p / other.getWidth());
            let pos = ((dest.y + y) * toInt(this.m_size.width()) + (dest.x + x)) * 4;

            if (otherPixels[p * 4 + 3] != 0) {
                this.m_pixels[pos + 0] = otherPixels[p * 4 + 0];
                this.m_pixels[pos + 1] = otherPixels[p * 4 + 1];
                this.m_pixels[pos + 2] = otherPixels[p * 4 + 2];
                this.m_pixels[pos + 3] = otherPixels[p * 4 + 3];
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

    getPixel(x: number, y: number): number[] {
        return this.m_pixels.slice((y * this.m_size.width() + x) * this.m_bpp, 4);
    }

    getPixelCount(): number {
        return this.m_size.area();
    }

    getPixels() {
        return this.m_pixels;
    }

}