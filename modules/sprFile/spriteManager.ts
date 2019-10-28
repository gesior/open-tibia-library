import {InputFile} from "../fileHandlers/inputFile";
import {Sprite} from "./sprite";
import {g_resources} from "../resources";
import {Log} from "../log";
import {Client} from "../client";
import {GameFeature} from "../constants/const";
import {Size} from "../structures/size";

export class SpriteManager {
    public static SPRITE_SIZE = 32;
    public static SPRITE_DATA_SIZE = SpriteManager.SPRITE_SIZE * SpriteManager.SPRITE_SIZE * 4;

    m_loaded = false;
    m_signature = 0;
    m_spritesCount = 0;
    m_spritesOffset = 0;
    m_spritesFile: InputFile = null;
    m_spriteCache: Sprite[] = [];

    constructor(public m_client: Client) {

    }

    async loadSprFromUrl(url: string): Promise<boolean> {
        let fin: InputFile = await g_resources.openUrl(url);
        return this.loadSpr(fin);
    }

    loadSpr(fin: InputFile): boolean {
        this.m_spritesCount = 0;
        this.m_signature = 0;
        this.m_loaded = false;
        try {
            this.m_spritesFile = fin;

            this.m_signature = this.m_spritesFile.getU32();
            this.m_spritesCount = this.m_client.getFeature(GameFeature.GameSpritesU32) ? this.m_spritesFile.getU32() : this.m_spritesFile.getU16();
            this.m_spritesOffset = this.m_spritesFile.tell();
            this.m_loaded = true;
            return true;
        } catch (e) {
            Log.error("Failed to load sprites: %s", e);
            return false;
        }
    }

    getSpritesCount(): number {
        return this.m_spritesCount;
    }

    getSpriteImage(id: number): Sprite {
        try {
            if (id == 0 || !this.m_spritesFile)
                return null;

            this.m_spritesFile.seek(((id - 1) * 4) + this.m_spritesOffset);

            let spriteAddress = this.m_spritesFile.getU32();

            // no sprite? return an empty texture
            if (spriteAddress == 0)
                return null;

            if (this.m_spriteCache[spriteAddress]) {
                return this.m_spriteCache[spriteAddress];
            }
            this.m_spritesFile.seek(spriteAddress);

            // skip color key
            this.m_spritesFile.getU8();
            this.m_spritesFile.getU8();
            this.m_spritesFile.getU8();

            let pixelDataSize = this.m_spritesFile.getU16();

            let image = new Sprite(new Size(SpriteManager.SPRITE_SIZE, SpriteManager.SPRITE_SIZE));

            let pixels = image.getPixels();
            let writePos = 0;
            let read = 0;
            let useAlpha = this.m_client.getFeature(GameFeature.GameSpritesAlphaChannel);
            let channels = useAlpha ? 4 : 3;

            // decompress pixels
            while (read < pixelDataSize && writePos < SpriteManager.SPRITE_DATA_SIZE) {
                let transparentPixels = this.m_spritesFile.getU16();
                let coloredPixels = this.m_spritesFile.getU16();

                for (let i = 0; i < transparentPixels && writePos < SpriteManager.SPRITE_DATA_SIZE; i++) {
                    pixels[writePos + 0] = 0x00;
                    pixels[writePos + 1] = 0x00;
                    pixels[writePos + 2] = 0x00;
                    pixels[writePos + 3] = 0x00;
                    writePos += 4;
                }

                for (let i = 0; i < coloredPixels && writePos < SpriteManager.SPRITE_DATA_SIZE; i++) {
                    pixels[writePos + 0] = this.m_spritesFile.getU8();
                    pixels[writePos + 1] = this.m_spritesFile.getU8();
                    pixels[writePos + 2] = this.m_spritesFile.getU8();
                    pixels[writePos + 3] = useAlpha ? this.m_spritesFile.getU8() : 0xFF;
                    writePos += 4;
                }

                read += 4 + (channels * coloredPixels);
            }

            // fill remaining pixels with alpha
            while (writePos < SpriteManager.SPRITE_DATA_SIZE) {
                pixels[writePos + 0] = 0x00;
                pixels[writePos + 1] = 0x00;
                pixels[writePos + 2] = 0x00;
                pixels[writePos + 3] = 0x00;
                writePos += 4;
            }
            this.m_spriteCache[spriteAddress] = image;
            return image;
        } catch (e) {
            Log.error("Failed to get sprite id %d: %s", id, e);
            return null;
        }
    }
}
