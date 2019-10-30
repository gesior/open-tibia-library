import {InputFile} from "../fileHandlers/inputFile";
import {Sprite} from "./sprite";
import {g_resources} from "../resources";
import {Log} from "../log";
import {Client} from "../client";
import {GameFeature} from "../constants/const";
import {Size} from "../structures/size";
import {OutputFile} from "../fileHandlers/outputFile";

export class SpriteManager {
    public static SPRITE_SIZE = 32;
    public static SPRITE_DATA_SIZE = SpriteManager.SPRITE_SIZE * SpriteManager.SPRITE_SIZE * 4;

    private m_signature = 0;
    private m_sprites: Sprite[] = [];

    constructor(public m_client: Client) {

    }

    async loadSprFromUrl(url: string): Promise<boolean> {
        let fin: InputFile = await g_resources.openUrl(url);
        return this.loadSpr(fin);
    }

    loadSpr(spritesFile: InputFile): boolean {
        this.m_signature = 0;
        try {
            this.m_signature = spritesFile.getU32();
            let spritesCount = this.m_client.getFeature(GameFeature.GameSpritesU32) ? spritesFile.getU32() : spritesFile.getU16();
            let spritesOffset = spritesFile.tell();

            for (let id = 1; id <= spritesCount; id++) {
                spritesFile.seek(((id - 1) * 4) + spritesOffset);
                let spriteAddress = spritesFile.getU32();

                if (spriteAddress == 0 || this.m_sprites[id]) {
                    continue;
                }

                spritesFile.seek(spriteAddress);

                let sprite = new Sprite(new Size(SpriteManager.SPRITE_SIZE, SpriteManager.SPRITE_SIZE));
                sprite.readFromSpr(spritesFile, this.m_client);

                this.m_sprites[id] = sprite;
            }

            return true;
        } catch (e) {
            Log.error("Failed to load sprites: %s", e);
            return false;
        }
    }

    saveSpr(): OutputFile {
        const spritesFile = new OutputFile();

        spritesFile.addU32(this.m_signature);
        if (this.m_client.getFeature(GameFeature.GameSpritesU32))
            spritesFile.addU32(this.getSpritesCount());
        else
            spritesFile.addU16(this.getSpritesCount());

        const spritesOffset = spritesFile.tell();
        for(let i = 0; i < this.m_sprites.length; i++) {
            spritesFile.addU32(0);
        }

        for(let i = 0; i < this.m_sprites.length; i++) {
            if (this.m_sprites[i]) {
                const sprite = this.m_sprites[i];

                const spriteAddress = spritesFile.tell();
                spritesFile.setU32(spritesOffset + 4 * i, spriteAddress);

                sprite.writeToSpr(spritesFile, this.m_client);
            }
        }

        return spritesFile;
    }

    getSignature(): number {
        return this.m_signature;
    }

    setSignature(value: number) {
        return this.m_signature = value;
    }

    getSprites(): Sprite[] {
        return this.m_sprites;
    }

    getSprite(index: number): Sprite {
        return this.m_sprites[index];
    }

    getSpritesCount(): number {
        return this.m_sprites.length;
    }

}
