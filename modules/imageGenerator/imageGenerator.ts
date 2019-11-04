import {DatManager} from "../datFile/datManager";
import {SpriteManager} from "../sprFile/spriteManager";
import {OtbManager} from "../otbFile/otbManager";
import {Sprite} from "../sprFile/sprite";
import {Size} from "../structures/size";
import {Point} from "../structures/point";

export class ImageGenerator {
    constructor(private datManager: DatManager = null, private sprManager: SpriteManager = null, private otbManager: OtbManager = null) {
    }

    generateItemImageByServerId(serverItemId: number): Sprite {
        if (this.otbManager === null) {
            throw new Error("otbManager is not set");
        }
        const clientItemId = this.otbManager.getItem(serverItemId).getClientId();
        return this.generateItemImageByClientId(clientItemId);
    }

    generateItemImageByClientId(clientItemId: number, animationFrame = 0): Sprite {
        if (this.datManager === null) {
            throw new Error("datManager is not set");
        }
        if (this.sprManager === null) {
            throw new Error("sprManager is not set");
        }
        let itemThingType = this.datManager.getItem(clientItemId);

        const itemSprite = new Sprite(new Size(SpriteManager.SPRITE_SIZE * itemThingType.m_size.width(), SpriteManager.SPRITE_SIZE * itemThingType.m_size.height()));

        for (let l = 0; l < itemThingType.m_layers; ++l) {
            for (let w = 0; w < itemThingType.m_size.width(); ++w) {
                for (let h = 0; h < itemThingType.m_size.height(); ++h) {
                    const spriteId = itemThingType.m_spritesIndex[
                        itemThingType.getSpriteIndex(w, h, l, 0, 0, 0, animationFrame)
                        ];
                    itemSprite.blit(
                        new Point(
                            SpriteManager.SPRITE_SIZE * (itemThingType.m_size.width() - w - 1),
                            SpriteManager.SPRITE_SIZE * (itemThingType.m_size.height() - h - 1)
                        ),
                        this.sprManager.getSprite(spriteId)
                    );
                }
            }
        }

        return itemSprite;
    }

}
