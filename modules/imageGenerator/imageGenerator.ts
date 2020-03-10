import {DatManager} from "../datFile/datManager";
import {SpriteManager} from "../sprFile/spriteManager";
import {OtbManager} from "../otbFile/otbManager";
import {Sprite} from "../sprFile/sprite";
import {Size} from "../structures/size";
import {Point} from "../structures/point";

export class ImageGenerator {
    constructor(private datManager: DatManager = null, private sprManager: SpriteManager = null, private otbManager: OtbManager = null) {
    }

    generateItemImageByServerId(serverItemId: number, animationFrame = 0): Sprite {
        if (this.otbManager === null) {
            throw new Error("otbManager is not set");
        }
        if (!this.otbManager.isValidOtbId(serverItemId)) {
            return null;
        }

        const clientItemId = this.otbManager.getItem(serverItemId).getClientId();
        if (!clientItemId) {
            return null;
        }
        return this.generateItemImageByClientId(clientItemId, animationFrame);
    }

    generateItemImagesByServerId(serverItemId: number): Sprite[] {
        if (this.otbManager === null) {
            throw new Error("otbManager is not set");
        }
        if (!this.otbManager.isValidOtbId(serverItemId)) {
            return null;
        }

        const clientItemId = this.otbManager.getItem(serverItemId).getClientId();
        if (!clientItemId) {
            return null;
        }
        return this.generateItemImagesByClientId(clientItemId);
    }

    generateItemImageByClientId(clientItemId: number, animationFrame = 0): Sprite {
        if (this.datManager === null) {
            throw new Error("datManager is not set");
        }
        if (this.sprManager === null) {
            throw new Error("sprManager is not set");
        }
        let itemThingType = this.datManager.getItem(clientItemId);
        if (!itemThingType) {
            console.log('missing dat item', clientItemId);
            return null;
        }

        const itemSprite = new Sprite(new Size(SpriteManager.SPRITE_SIZE * itemThingType.m_size.width(), SpriteManager.SPRITE_SIZE * itemThingType.m_size.height()));

        for (let l = 0; l < itemThingType.m_layers; ++l) {
            for (let w = 0; w < itemThingType.m_size.width(); ++w) {
                for (let h = 0; h < itemThingType.m_size.height(); ++h) {
                    const spriteId = itemThingType.m_spritesIndex[
                        itemThingType.getSpriteIndex(w, h, l, 0, 0, 0, animationFrame)
                        ];
                    const sprite = this.sprManager.getSprite(spriteId);
                    if (!sprite) {
                        if (spriteId != 0) {
                            console.log('missing sprite', spriteId);
                        }
                        continue;
                    }
                    itemSprite.blit(
                        new Point(
                            SpriteManager.SPRITE_SIZE * (itemThingType.m_size.width() - w - 1),
                            SpriteManager.SPRITE_SIZE * (itemThingType.m_size.height() - h - 1)
                        ),
                        sprite
                    );
                }
            }
        }

        return itemSprite;
    }

    generateItemImagesByClientId(clientItemId: number): Sprite[] {
        if (this.datManager === null) {
            throw new Error("datManager is not set");
        }
        if (this.sprManager === null) {
            throw new Error("sprManager is not set");
        }
        let itemThingType = this.datManager.getItem(clientItemId);
        if (!itemThingType) {
            console.log('missing dat item', clientItemId);
            return null;
        }

        const itemSprites = [];
        for (let a = 0; a < itemThingType.m_animationPhases; ++a) {
            const itemSprite = this.generateItemImageByClientId(clientItemId, a);
            if (itemSprite) {
                itemSprites.push(itemSprite);
            }
        }

        return itemSprites;
    }

}
