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

    generateOutfitAnimationImages(outfitId: number) {
        if (this.datManager === null) {
            throw new Error("datManager is not set");
        }
        if (this.sprManager === null) {
            throw new Error("sprManager is not set");
        }
        let outfitThingType = this.datManager.getOutfit(outfitId);
        if (!outfitThingType) {
            console.log('missing dat outfit', outfitId);
            return null;
        }

        const sprites = [];

        for(let z = 0; z < outfitThingType.m_numPatternZ; ++z) {
            for(let y = 0; y < outfitThingType.m_numPatternY; ++y) {
                for(let x = 0; x < outfitThingType.m_numPatternX; ++x) {
                    for(let l = 0; l < outfitThingType.m_layers; ++l) {
                        for(let a = 0; a < outfitThingType.m_animationPhases; ++a) {
                            console.log('generate', 'outfits_anim/' + outfitId + '/' + (a+1) + '/' + (z+1) + '/' + (y+1) + '/' +(x+1))
                            const outfitSprite = new Sprite(new Size(SpriteManager.SPRITE_SIZE * outfitThingType.m_size.width(), SpriteManager.SPRITE_SIZE * outfitThingType.m_size.height()));
                            for(let w = 0; w < outfitThingType.m_size.width(); ++w) {
                                for(let h = 0; h < outfitThingType.m_size.height(); ++h) {
                                    const spriteId = outfitThingType.m_spritesIndex[
                                        outfitThingType.getSpriteIndex(w, h, l, x, y, z, a)
                                        ];
                                    const sprite = this.sprManager.getSprite(spriteId);
                                    if (!sprite) {
                                        if (spriteId != 0) {
                                            console.log('missing sprite', spriteId);
                                        }
                                        continue;
                                    }
                                    outfitSprite.blit(
                                        new Point(
                                            SpriteManager.SPRITE_SIZE * (outfitThingType.m_size.width() - w - 1),
                                            SpriteManager.SPRITE_SIZE * (outfitThingType.m_size.height() - h - 1)
                                        ),
                                        sprite
                                    );
                                }
                            }
                            if(l == 1) {
                                sprites.push({file:'outfits_anim/' + outfitId + '/' + (a+1) + '_' + (z+1) + '_' + (y+1) + '_' +(x+1) + '_template', sprite: outfitSprite});
                            } else {
                                sprites.push({file:'outfits_anim/' + outfitId + '/' + (a+1) + '_' + (z+1) + '_' + (y+1) + '_' +(x+1), sprite: outfitSprite});
                            }
                        }
                    }
                }
            }
        }

        return sprites;
    }
}
