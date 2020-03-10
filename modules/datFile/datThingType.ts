import {DatThingAttr, DatThingCategory, FrameGroupType, GameFeature} from "../constants/const";
import {Client} from "../client";
import {InputFile} from "../fileHandlers/inputFile";
import {error} from "../log";
import {Animator} from "./animator";
import {Color} from "../structures/color";
import {DatThingTypeAttributes} from "./datThingTypeAttributes";
import {Size} from "../structures/size";
import {Point} from "../structures/point";
import {MarketData} from "../structures/marketData";
import {Light} from "../structures/light";
import {OutputFile} from "../fileHandlers/outputFile";

export class DatThingType {
    static maskColors = [Color.red, Color.green, Color.blue, Color.yellow];

    m_category: DatThingCategory;
    m_id: number = 0;
    m_null: boolean = true;
    m_attribs: DatThingTypeAttributes = new DatThingTypeAttributes();

    m_size: Size = new Size();
    m_displacement: Point = new Point();
    m_animator: Animator = null;
    m_animationPhases: number = 0;
    m_exactSize: number = 0;
    m_realSize: number = 0;
    m_numPatternX: number = 0;
    m_numPatternY: number = 0;
    m_numPatternZ: number = 0;
    m_layers: number = 0;
    m_elevation: number = 0;

    m_spritesIndex: number[] = [];

    serialize(fin: OutputFile, client: Client, clientAttributeTranslator) {
        for (let clientAttrString in clientAttributeTranslator) {
            if (clientAttributeTranslator.hasOwnProperty(clientAttrString)) {
                let clientDatAttr = parseInt(clientAttrString);
                let thingAttr = parseInt(clientAttributeTranslator[clientDatAttr]);
                if (!this.hasAttr(thingAttr))
                    continue;

                fin.addU8(clientDatAttr);
                switch (thingAttr) {
                    case DatThingAttr.ThingAttrDisplacement: {

                        fin.addU16(this.m_displacement.x);
                        fin.addU16(this.m_displacement.y);
                        break;
                    }
                    case DatThingAttr.ThingAttrLight: {
                        const light: Light = this.m_attribs.get(thingAttr);
                        fin.addU16(light.intensity);
                        fin.addU16(light.color);
                        break;
                    }
                    case DatThingAttr.ThingAttrMarket: {
                        const market: MarketData = this.m_attribs.get(thingAttr);
                        fin.addU16(market.category);
                        fin.addU16(market.tradeAs);
                        fin.addU16(market.showAs);
                        fin.addString(market.name);
                        fin.addU16(market.restrictVocation);
                        fin.addU16(market.requiredLevel);
                        break;
                    }
                    case DatThingAttr.ThingAttrUsable:
                    case DatThingAttr.ThingAttrElevation:
                    case DatThingAttr.ThingAttrGround:
                    case DatThingAttr.ThingAttrWritable:
                    case DatThingAttr.ThingAttrWritableOnce:
                    case DatThingAttr.ThingAttrMinimapColor:
                    case DatThingAttr.ThingAttrCloth:
                    case DatThingAttr.ThingAttrLensHelp:
                        fin.addU16(this.m_attribs.get(thingAttr));
                        break;
                    default:
                        break;
                }
            }
        }
        fin.addU8(DatThingAttr.ThingLastAttr);

        fin.addU8(this.m_size.width());
        fin.addU8(this.m_size.height());

        if (this.m_size.width() > 1 || this.m_size.height() > 1)
            fin.addU8(this.m_realSize);

        fin.addU8(this.m_layers);
        fin.addU8(this.m_numPatternX);
        fin.addU8(this.m_numPatternY);
        fin.addU8(this.m_numPatternZ);
        fin.addU8(this.m_animationPhases);

        if (client.getFeature(GameFeature.GameEnhancedAnimations)) {
            if (this.m_animationPhases > 1 && this.m_animator != null) {
                this.m_animator.serialize(fin);
            }
        }

        for (let i2 = 0; i2 < this.m_spritesIndex.length; i2++) {
            if (client.getFeature(GameFeature.GameSpritesU32))
                fin.addU32(this.m_spritesIndex[i2]);
            else
                fin.addU16(this.m_spritesIndex[i2]);
        }
    }

    unserialize(clientId: number, category: DatThingCategory, fin: InputFile, client: Client, clientTranslationArray) {
        this.m_null = false;
        this.m_id = clientId;
        this.m_category = category;

        let count = 0;
        let attr = -1;
        let done = false;
        for (let i = 0; i < DatThingAttr.ThingLastAttr; ++i) {
            count++;
            attr = fin.getU8();
            if (attr == DatThingAttr.ThingLastAttr) {
                done = true;
                break;
            }

            attr = clientTranslationArray[attr];
            switch (attr) {
                case DatThingAttr.ThingAttrDisplacement: {
                    this.m_displacement = new Point(0, 0);
                    if (client.getClientVersion() >= 755) {
                        this.m_displacement.x = fin.getU16();
                        this.m_displacement.y = fin.getU16();
                    } else {
                        this.m_displacement.x = 8;
                        this.m_displacement.y = 8;
                    }
                    this.m_attribs.set(attr, true);
                    break;
                }
                case DatThingAttr.ThingAttrLight: {
                    let light = new Light();
                    light.intensity = fin.getU16();
                    light.color = fin.getU16();
                    this.m_attribs.set(attr, light);
                    break;
                }
                case DatThingAttr.ThingAttrMarket: {
                    let market = new MarketData();
                    market.category = fin.getU16();
                    market.tradeAs = fin.getU16();
                    market.showAs = fin.getU16();
                    market.name = fin.getString();
                    market.restrictVocation = fin.getU16();
                    market.requiredLevel = fin.getU16();
                    this.m_attribs.set(attr, market);
                    break;
                }
                case DatThingAttr.ThingAttrElevation: {
                    this.m_elevation = fin.getU16();
                    this.m_attribs.set(attr, this.m_elevation);
                    break;
                }
                case DatThingAttr.ThingAttrUsable:
                case DatThingAttr.ThingAttrGround:
                case DatThingAttr.ThingAttrWritable:
                case DatThingAttr.ThingAttrWritableOnce:
                case DatThingAttr.ThingAttrMinimapColor:
                case DatThingAttr.ThingAttrCloth:
                case DatThingAttr.ThingAttrLensHelp:
                    this.m_attribs.set(attr, fin.getU16());
                    break;
                default:
                    this.m_attribs.set(attr, true);
                    break;
            }
        }

        if (!done)
            error("corrupt data (id: %d, category: %d, count: %d, lastAttr: %d)", this.m_id, this.m_category, count, attr);

        let hasFrameGroups = (category == DatThingCategory.ThingCategoryCreature && client.getFeature(GameFeature.GameIdleAnimations));
        let groupCount = hasFrameGroups ? fin.getU8() : 1;

        this.m_animationPhases = 0;
        let totalSpritesCount = 0;

        for (let i = 0; i < groupCount; ++i) {
            let frameGroupType = FrameGroupType.FrameGroupDefault;
            if (hasFrameGroups)
                frameGroupType = fin.getU8();

            // TODO: load IDLE and MOVING frames
            if (groupCount == 1 || frameGroupType == FrameGroupType.FrameGroupMoving) {
                let width = fin.getU8();
                let height = fin.getU8();
                this.m_size = new Size(width, height);
                if (width > 1 || height > 1) {
                    this.m_realSize = fin.getU8();
                    this.m_exactSize = Math.min(this.m_realSize, Math.max(width * 32, height * 32));
                } else
                    this.m_exactSize = 32;

                this.m_layers = fin.getU8();
                this.m_numPatternX = fin.getU8();
                this.m_numPatternY = fin.getU8();
                if (client.getClientVersion() >= 755)
                    this.m_numPatternZ = fin.getU8();
                else
                    this.m_numPatternZ = 1;

                let groupAnimationsPhases = fin.getU8();
                this.m_animationPhases = groupAnimationsPhases;

                if (groupAnimationsPhases > 1 && client.getFeature(GameFeature.GameEnhancedAnimations)) {
                    this.m_animator = new Animator();
                    this.m_animator.unserialize(groupAnimationsPhases, fin);
                }

                let totalSprites = this.m_size.area() * this.m_layers * this.m_numPatternX * this.m_numPatternY * this.m_numPatternZ * groupAnimationsPhases;

                if ((totalSpritesCount + totalSprites) > 4096)
                    error("a thing type has more than 4096 sprites", totalSprites, totalSpritesCount, this.m_size.area(), this.m_layers, this.m_numPatternX, this.m_numPatternY, this.m_numPatternZ, groupAnimationsPhases);

                this.m_spritesIndex = [];
                for (let i = totalSpritesCount; i < (totalSpritesCount + totalSprites); i++) {
                    this.m_spritesIndex[i] = client.getFeature(GameFeature.GameSpritesU32) ? fin.getU32() : fin.getU16();
                }

                //console.log('spr', this.m_spritesIndex);
                totalSpritesCount += totalSprites;
            } else {
                let width = fin.getU8();
                let height = fin.getU8();
                let tmpSize = new Size(width, height);
                let tmpExactSize = 32;
                if (width > 1 || height > 1) {
                    let tmpRealSize = fin.getU8();
                    tmpExactSize = Math.min(tmpRealSize, Math.max(width * 32, height * 32));
                }

                let tmpLayers = fin.getU8();
                let tmpNumPatternX = fin.getU8();
                let tmpNumPatternY = fin.getU8();
                let tmpNumPatternZ = 1;
                if (client.getClientVersion() >= 755)
                    tmpNumPatternZ = fin.getU8();

                let groupAnimationsPhases = fin.getU8();

                if (groupAnimationsPhases > 1 && client.getFeature(GameFeature.GameEnhancedAnimations)) {
                    let tmpAnimator = new Animator();
                    tmpAnimator.unserialize(groupAnimationsPhases, fin);
                }

                let totalSprites = tmpSize.area() * tmpLayers * tmpNumPatternX * tmpNumPatternY * tmpNumPatternZ * groupAnimationsPhases;

                if ((totalSpritesCount + totalSprites) > 4096)
                    error("a thing type has more than 4096 sprites", totalSprites, totalSpritesCount, tmpSize.area(), tmpLayers, tmpNumPatternX, tmpNumPatternY, tmpNumPatternZ, groupAnimationsPhases);

                let tmpSpritesIndex = [];
                for (let i = totalSpritesCount; i < (totalSpritesCount + totalSprites); i++) {
                    tmpSpritesIndex[i] = client.getFeature(GameFeature.GameSpritesU32) ? fin.getU32() : fin.getU16();
                }

                //console.log('spr', this.m_spritesIndex);
            }
        }
    }

    getId(): number {
        return this.m_id;
    }

    getCategory(): DatThingCategory {
        return this.m_category;
    }

    isNull(): boolean {
        return this.m_null;
    }

    hasAttr(attr: DatThingAttr): boolean {
        return this.m_attribs.has(attr);
    }

    getSize(): Size {
        return this.m_size;
    }

    getWidth(): number {
        return this.m_size.width();
    }

    getHeight(): number {
        return this.m_size.height();
    }

    getExactSize(layer: number = 0, xPattern: number = 0, yPattern: number = 0, zPattern: number = 0, animationPhase: number = 0): number {
        /* todo */
        return 0;
    }

    getRealSize(): number {
        return this.m_realSize;
    }

    getLayers(): number {
        return this.m_layers;
    }

    getNumPatternX(): number {
        return this.m_numPatternX;
    }

    getNumPatternY(): number {
        return this.m_numPatternY;
    }

    getNumPatternZ(): number {
        return this.m_numPatternZ;
    }

    getAnimationPhases(): number {
        return this.m_animationPhases;
    }

    getAnimator(): Animator {
        return this.m_animator;
    }

    getDisplacement(): Point {
        return this.m_displacement;
    }

    getDisplacementX(): number {
        return this.getDisplacement().x;
    }

    getDisplacementY(): number {
        return this.getDisplacement().y;
    }

    getElevation(): number {
        return this.m_elevation;
    }

    getGroundSpeed(): number {
        return this.m_attribs.get(DatThingAttr.ThingAttrGround);
    }

    getMaxTextLength(): number {
        return this.m_attribs.has(DatThingAttr.ThingAttrWritableOnce) ? this.m_attribs.get(DatThingAttr.ThingAttrWritableOnce) : this.m_attribs.get(DatThingAttr.ThingAttrWritable);
    }

    getLight(): Light {
        return this.m_attribs.get(DatThingAttr.ThingAttrLight);
    }

    getMinimapColor(): number {
        return this.m_attribs.get(DatThingAttr.ThingAttrMinimapColor);
    }

    getLensHelp(): number {
        return this.m_attribs.get(DatThingAttr.ThingAttrLensHelp);
    }

    getClothSlot(): number {
        return this.m_attribs.get(DatThingAttr.ThingAttrCloth);
    }

    getMarketData(): MarketData {
        return this.m_attribs.get(DatThingAttr.ThingAttrMarket);
    }

    isGround(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrGround);
    }

    isGroundBorder(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrGroundBorder);
    }

    isOnBottom(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrOnBottom);
    }

    isOnTop(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrOnTop);
    }

    isContainer(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrContainer);
    }

    isStackable(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrStackable);
    }

    isForceUse(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrForceUse);
    }

    isMultiUse(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrMultiUse);
    }

    isWritable(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrWritable);
    }

    isChargeable(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrChargeable);
    }

    isWritableOnce(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrWritableOnce);
    }

    isFluidContainer(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrFluidContainer);
    }

    isSplash(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrSplash);
    }

    isNotWalkable(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrNotWalkable);
    }

    isNotMoveable(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrNotMoveable);
    }

    blockProjectile(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrBlockProjectile);
    }

    isNotPathable(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrNotPathable);
    }

    isPickupable(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrPickupable);
    }

    isHangable(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrHangable);
    }

    isHookSouth(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrHookSouth);
    }

    isHookEast(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrHookEast);
    }

    isRotateable(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrRotateable);
    }

    hasLight(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrLight);
    }

    isDontHide(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrDontHide);
    }

    isTranslucent(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrTranslucent);
    }

    hasDisplacement(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrDisplacement);
    }

    hasElevation(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrElevation);
    }

    isLyingCorpse(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrLyingCorpse);
    }

    isAnimateAlways(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrAnimateAlways);
    }

    hasMiniMapColor(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrMinimapColor);
    }

    hasLensHelp(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrLensHelp);
    }

    isFullGround(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrFullGround);
    }

    isIgnoreLook(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrLook);
    }

    isCloth(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrCloth);
    }

    isMarketable(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrMarket);
    }

    isUsable(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrUsable);
    }

    isWrapable(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrWrapable);
    }

    isUnwrapable(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrUnwrapable);
    }

    isTopEffect(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrTopEffect);
    }

    getSprites(): number[] {
        return this.m_spritesIndex;
    }

    getSprite(index: number): number {
        return this.m_spritesIndex[index];
    }

    isNotPreWalkable(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrNotPreWalkable);
    }

    setPathable(v: boolean) {
        if (v == true)
            this.m_attribs.remove(DatThingAttr.ThingAttrNotPathable);
        else
            this.m_attribs.set(DatThingAttr.ThingAttrNotPathable, true);
    }

    getBestTextureDimension(w: number, h: number, count: number): Size {
        const MAX = 32;

        let k = 1;
        while (k < w)
            k <<= 1;
        w = k;

        k = 1;
        while (k < h)
            k <<= 1;
        h = k;

        let numSprites = w * h * count;
        /*
        assert(numSprites <= MAX*MAX);
        assert(w <= MAX);
        assert(h <= MAX);
        */
        let bestDimension = new Size(MAX, MAX);
        for (let i = w; i <= MAX; i <<= 1) {
            for (let j = h; j <= MAX; j <<= 1) {
                let candidateDimension = new Size(i, j);
                if (candidateDimension.area() < numSprites)
                    continue;
                if ((candidateDimension.area() < bestDimension.area()) ||
                    (candidateDimension.area() == bestDimension.area() && candidateDimension.width() + candidateDimension.height() < bestDimension.width() + bestDimension.height()))
                    bestDimension = candidateDimension;
            }
        }
        //console.log('dim', this.m_id, bestDimension);
        return bestDimension;
        //return new Size(w, h);
    }

    getSpriteIndex(w: number, h: number, l: number, x: number, y: number, z: number, a: number): number {
        let index =
            ((((((a % this.m_animationPhases)
                * this.m_numPatternZ + z)
                * this.m_numPatternY + y)
                * this.m_numPatternX + x)
                * this.m_layers + l)
                * this.m_size.height() + h)
            * this.m_size.width() + w;
        if (!(index < this.m_spritesIndex.length)) {
            throw new Error('index < this.m_spritesIndex.length');
        }
        return index;
    }

    getTextureIndex(l: number, x: number, y: number, z: number) {
        return ((l * this.m_numPatternZ + z)
            * this.m_numPatternY + y)
            * this.m_numPatternX + x;
    }

    /*
        getTexture(animationPhase: number): Texture {

            let animationPhaseTexture = this.m_textures[animationPhase];
            if (!animationPhaseTexture) {

                // we don't need layers in common items, they will be pre-drawn
                let textureLayers = 1;
                let numLayers = this.m_layers;
                if (this.m_category == ThingCategory.ThingCategoryCreature && numLayers >= 2) {
                    // 5 layers: outfit base, red mask, green mask, blue mask, yellow mask
                    textureLayers = 5;
                    numLayers = 5;
                }

                let indexSize = textureLayers * this.m_numPatternX * this.m_numPatternY * this.m_numPatternZ;
                let textureSize = this.getBestTextureDimension(this.m_size.width(), this.m_size.height(), indexSize);
                //console.log('dim', textureSize, this);
                let fullImage = new Image(textureSize.mul(Otc.TILE_PIXELS));

                //console.log('fi', fullImage.getWidth(), fullImage.getHeight())
                this.m_texturesFramesRects[animationPhase] = [];
                this.m_texturesFramesOriginRects[animationPhase] = [];
                this.m_texturesFramesOffsets[animationPhase] = [];

                for (let z = 0; z < this.m_numPatternZ; ++z) {
                    for (let y = 0; y < this.m_numPatternY; ++y) {
                        for (let x = 0; x < this.m_numPatternX; ++x) {
                            for (let l = 0; l < numLayers; ++l) {
                                let spriteMask = (this.m_category == ThingCategory.ThingCategoryCreature && l > 0);
                                let frameIndex = this.getTextureIndex(l % textureLayers, x, y, z);
                                let framePos = new Point(toInt(frameIndex % toInt(textureSize.width() / this.m_size.width()) * this.m_size.width()) * Otc.TILE_PIXELS,
                                    toInt(frameIndex / toInt(textureSize.width() / this.m_size.width()) * this.m_size.height()) * Otc.TILE_PIXELS);

                                //console.log('blitx', framePos);
                                    for (let h = 0; h < this.m_size.height(); ++h) {
                                        for (let w = 0; w < this.m_size.width(); ++w) {
                                            let spriteIndex = this.getSpriteIndex(w, h, spriteMask ? 1 : l, x, y, z, animationPhase);
                                            let spriteImage = g_sprites.getSpriteImage(this.m_spritesIndex[spriteIndex]);

                                            if (spriteImage) {
                                                if (spriteMask) {
                                                    spriteImage.overwriteMask(ThingType.maskColors[l - 1]);
                                                }
                                                let spritePos = new Point((this.m_size.width() - w - 1) * Otc.TILE_PIXELS,
                                                    (this.m_size.height() - h - 1) * Otc.TILE_PIXELS);

                                                fullImage.blit(framePos.add(spritePos), spriteImage);
                                            } else {
                                                //console.error(this.m_spritesIndex, spriteIndex);
                                            }
                                        }
                                    }

                                let drawRect = new Rect(
                                    framePos.add(new Point(this.m_size.width(), this.m_size.height()))
                                        .mul(Otc.TILE_PIXELS)
                                        .sub(new Point(1, 1)),
                                    framePos);

                                for (let x = framePos.x; x < framePos.x + this.m_size.width() * Otc.TILE_PIXELS; ++x) {
                                    for (let y = framePos.y; y < framePos.y + this.m_size.height() * Otc.TILE_PIXELS; ++y) {

                                        let p = fullImage.getPixel(x, y);
                                        if (p[3] != 0x00) {
                                            drawRect.setTop(Math.min(y, drawRect.top()));
                                            drawRect.setLeft(Math.min(x, drawRect.left()));
                                            drawRect.setBottom(Math.max(y, drawRect.bottom()));
                                            drawRect.setRight(Math.max(x, drawRect.right()));
                                        }

                                    }
                                }
                                //console.log('blit', drawRect);

                                this.m_texturesFramesRects[animationPhase][frameIndex] = drawRect;
                                this.m_texturesFramesOriginRects[animationPhase][frameIndex] = new Rect(framePos, new Size(this.m_size.width(), this.m_size.height()).mul(Otc.TILE_PIXELS));
                                this.m_texturesFramesOffsets[animationPhase][frameIndex] = drawRect.topLeft().sub(framePos);

                            }
                        }
                    }
                }
                animationPhaseTexture = new Texture(fullImage, true);
                //animationPhaseTexture.setSmooth(true);
                //console.log(this.m_id, animationPhase, animationPhaseTexture);
                this.m_textures[animationPhase] = animationPhaseTexture;
            }
            return animationPhaseTexture;
        }
    */
}
