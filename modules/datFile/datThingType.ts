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
import {FrameGroup} from "./frameGroup";
import {BonesData} from "../structures/bonesData";
import {SortedDatAttribute} from "../structures/sortedDatAttribute";

export class DatThingType {
    static maskColors = [Color.red, Color.green, Color.blue, Color.yellow];

    private m_category: DatThingCategory;
    private m_id: number = 0;
    private m_null: boolean = true;
    private m_attribs: DatThingTypeAttributes = new DatThingTypeAttributes();

    private m_displacement: Point = new Point();
    private m_elevation: number = 0;

    private m_frameGroups: FrameGroup[] = [];

    serialize(fin: OutputFile, category: DatThingCategory, client: Client, clientAttributeTranslator: SortedDatAttribute[]) {
        for (let sortedDatAttribute of clientAttributeTranslator) {
            let clientDatAttr = sortedDatAttribute.clientDatAttr;
            let thingAttr = sortedDatAttribute.thingAttr;
            if (!this.hasAttr(thingAttr))
                continue;

            fin.addU8(clientDatAttr);
            switch (thingAttr) {
                case DatThingAttr.ThingAttrDisplacement: {
                    if (client.getClientVersion() >= 755) {
                        fin.addU16(this.m_displacement.x);
                        fin.addU16(this.m_displacement.y);
                    }
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
                case DatThingAttr.ThingAttrBones: { // 'Oen44' OTCv8 extra parameter for Wings, 8x U16
                    const bones: BonesData = this.m_attribs.get(thingAttr);
                    fin.addU16(bones.north_x);
                    fin.addU16(bones.north_y);
                    fin.addU16(bones.south_x);
                    fin.addU16(bones.south_y);
                    fin.addU16(bones.east_x);
                    fin.addU16(bones.east_y);
                    fin.addU16(bones.west_x);
                    fin.addU16(bones.west_y);
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
        fin.addU8(DatThingAttr.ThingLastAttr);

        let hasFrameGroups = (category == DatThingCategory.ThingCategoryCreature && client.getFeature(GameFeature.GameIdleAnimations));
        if (hasFrameGroups)
            fin.addU8(this.m_frameGroups.length);

        for (let frameGroupType in this.m_frameGroups) {
            if (hasFrameGroups)
                fin.addU8(Number(frameGroupType));

            const frameGroup = this.m_frameGroups[frameGroupType];
            fin.addU8(frameGroup.m_size.width());
            fin.addU8(frameGroup.m_size.height());

            if (frameGroup.m_size.width() > 1 || frameGroup.m_size.height() > 1)
                fin.addU8(frameGroup.m_realSize);

            fin.addU8(frameGroup.m_layers);
            fin.addU8(frameGroup.m_numPatternX);
            fin.addU8(frameGroup.m_numPatternY);
            if (client.getClientVersion() >= 755)
                fin.addU8(frameGroup.m_numPatternZ);
            fin.addU8(frameGroup.m_animationPhases);

            if (client.getFeature(GameFeature.GameEnhancedAnimations)) {
                if (frameGroup.m_animationPhases > 1 && frameGroup.m_animator != null) {
                    frameGroup.m_animator.serialize(fin);
                }
            }

            for (let i2 = 0; i2 < frameGroup.m_spritesIndex.length; i2++) {
                if (client.getFeature(GameFeature.GameSpritesU32))
                    fin.addU32(frameGroup.m_spritesIndex[i2]);
                else
                    fin.addU16(frameGroup.m_spritesIndex[i2]);
            }
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
                case DatThingAttr.ThingAttrBones: { // 'Oen44' OTCv8 extra parameter for Wings, 8x U16
                    let bones = new BonesData();
                    bones.north_x = fin.getU16();
                    bones.north_y = fin.getU16();
                    bones.south_x = fin.getU16();
                    bones.south_y = fin.getU16();
                    bones.east_x = fin.getU16();
                    bones.east_y = fin.getU16();
                    bones.west_x = fin.getU16();
                    bones.west_y = fin.getU16();
                    this.m_attribs.set(attr, bones);
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

        for (let i = 0; i < groupCount; ++i) {
            let frameGroupType = (category == DatThingCategory.ThingCategoryCreature) ? FrameGroupType.FrameGroupMoving : FrameGroupType.FrameGroupIdle;
            if (hasFrameGroups)
                frameGroupType = fin.getU8();

            const frameGroup = new FrameGroup();

            let width = fin.getU8();
            let height = fin.getU8();
            frameGroup.m_size = new Size(width, height);
            if (width > 1 || height > 1) {
                frameGroup.m_realSize = fin.getU8();
                frameGroup.m_exactSize = Math.min(frameGroup.m_realSize, Math.max(width * 32, height * 32));
            } else
                frameGroup.m_exactSize = 32;

            frameGroup.m_layers = fin.getU8();
            frameGroup.m_numPatternX = fin.getU8();
            frameGroup.m_numPatternY = fin.getU8();
            if (client.getClientVersion() >= 755)
                frameGroup.m_numPatternZ = fin.getU8();
            else
                frameGroup.m_numPatternZ = 1;

            let groupAnimationsPhases = fin.getU8();
            frameGroup.m_animationPhases = groupAnimationsPhases;

            if (groupAnimationsPhases > 1 && client.getFeature(GameFeature.GameEnhancedAnimations)) {
                frameGroup.m_animator = new Animator();
                frameGroup.m_animator.unserialize(groupAnimationsPhases, fin);
            }

            let totalSprites = frameGroup.m_size.area() * frameGroup.m_layers * frameGroup.m_numPatternX * frameGroup.m_numPatternY * frameGroup.m_numPatternZ * groupAnimationsPhases;

            if (totalSprites > 4096)
                error("a thing type has more than 4096 sprites", totalSprites, frameGroup.m_size.area(), frameGroup.m_layers, frameGroup.m_numPatternX, frameGroup.m_numPatternY, frameGroup.m_numPatternZ, groupAnimationsPhases);

            frameGroup.m_spritesIndex = [];
            for (let i = 0; i < totalSprites; i++) {
                frameGroup.m_spritesIndex[i] = client.getFeature(GameFeature.GameSpritesU32) ? fin.getU32() : fin.getU16();
            }

            //console.log('spr', this.m_spritesIndex);

            this.m_frameGroups[frameGroupType] = frameGroup;
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

    getFrameGroups(): FrameGroup[] {
        return this.m_frameGroups;
    }

    getFrameGroup(frameGroupType: FrameGroupType): FrameGroup {
        return this.m_frameGroups[frameGroupType];
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

    getBones(): BonesData {
        return this.m_attribs.get(DatThingAttr.ThingAttrBones);
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

    hasBones(): boolean {
        return this.m_attribs.has(DatThingAttr.ThingAttrBones);
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

        return bestDimension;
    }
}
