import {DatThingType} from "./datThingType";
import {DatThingAttr, DatThingCategory} from "../constants/const";
import {Log} from "../log";
import {InputFile} from "../fileHandlers/inputFile";
import {g_resources} from "../resources";
import {OutputFile} from "../fileHandlers/outputFile";
import {Client} from "../client";
import {SortedDatAttribute} from "../structures/sortedDatAttribute";

export class DatManager {
    private static m_nullThingType = new DatThingType();
    private readonly m_thingTypes: DatThingType[][] = [];
    private m_datSignature: number = 0;
    private m_contentRevision: number = 0;

    constructor(public m_client: Client) {
        for (let i = DatThingCategory.ThingCategoryItem; i < DatThingCategory.ThingLastCategory; ++i) {
            this.m_thingTypes[i] = [];
        }
    }

    getThingType(id: number, category: DatThingCategory): DatThingType {
        if (category >= DatThingCategory.ThingLastCategory || id >= this.m_thingTypes[category].length) {
            Log.error("invalid thing type client id %d in category %d", id, category);
            return DatManager.m_nullThingType;
        }
        return this.m_thingTypes[category][id];
    }

    getThingTypes() {
        return this.m_thingTypes;
    }

    getCategory(category: DatThingCategory) {
        return this.m_thingTypes[category];
    }

    getItem(id: number) {
        return this.getThingType(id, DatThingCategory.ThingCategoryItem);
    }

    getOutfit(id: number) {
        return this.getThingType(id, DatThingCategory.ThingCategoryCreature);
    }

    getEffect(id: number) {
        return this.getThingType(id, DatThingCategory.ThingCategoryEffect);
    }

    getMissile(id: number) {
        return this.getThingType(id, DatThingCategory.ThingCategoryMissile);
    }

    isValidDatId(id: number, category: DatThingCategory): boolean {
        return true;
    }

    getNullThingType(): DatThingType {
        return DatManager.m_nullThingType;
    }

    getDatSignature() {
        throw this.m_datSignature;
    }

    getContentRevision() {
        throw this.m_contentRevision;
    }

    async loadDatFromUrl(url: string): Promise<boolean> {
        let fin: InputFile = await g_resources.openUrl(url);
        return this.loadDat(fin);
    }

    loadDat(fin: InputFile): boolean {
        this.m_datSignature = 0;
        this.m_contentRevision = 0;
        try {
            this.m_datSignature = fin.getU32();
            this.m_contentRevision = this.m_datSignature & 0xFFFF;

            for (let category = DatThingCategory.ThingCategoryItem; category < DatThingCategory.ThingLastCategory; ++category) {
                let count = fin.getU16() + 1;
                this.m_thingTypes[category] = [];
                for (let thingCount = 0; thingCount < count; ++thingCount) {
                    this.m_thingTypes[category][thingCount] = DatManager.m_nullThingType;
                }
            }

            const clientTranslationArray = this.getClientTranslationArray();
            for (let category = 0; category < DatThingCategory.ThingLastCategory; ++category) {
                let firstId = 1;
                if (category == DatThingCategory.ThingCategoryItem)
                    firstId = 100;
                for (let id = firstId; id < this.m_thingTypes[category].length; ++id) {
                    let type = new DatThingType();
                    type.unserialize(id, category, fin, this.m_client, clientTranslationArray);
                    this.m_thingTypes[category][id] = type;
                }
            }

            return true;
        } catch (e) {
            Log.error("Failed to read dat: %s'", e);
            return false;
        }
    }

    saveDat(): OutputFile {
        const fin = new OutputFile();
        fin.addU32(this.m_datSignature);

        for (let category = 0; category < DatThingCategory.ThingLastCategory; ++category) {
            fin.addU16(this.m_thingTypes[category].length - 1);
        }

        const clientTranslationArray = this.getSortedClientTranslationArray();

        for (let category = 0; category < DatThingCategory.ThingLastCategory; ++category) {
            let firstId = 1;
            if (category == DatThingCategory.ThingCategoryItem)
                firstId = 100;

            for (let id = firstId; id < this.m_thingTypes[category].length; ++id)
                this.m_thingTypes[category][id].serialize(fin, category, this.m_client, clientTranslationArray);
        }
        return fin;
    }

    getClientTranslationArray(): any {
        const version = this.m_client.getClientVersion();
        const internalToClient: any = {};

        for (let thingAttr = 0; thingAttr < DatThingAttr.ThingLastAttr; ++thingAttr) {
            if (DatThingAttr[thingAttr] === undefined) {
                continue;
            }
            internalToClient[thingAttr] = thingAttr;
        }

        if (version >= 1010) {
            /* 10.10+: attributes from 16 up were incremented by 1 to make space
             * for 16 as "No Movement Animation". Client 0xFE is USABLE (boolean).
             */
            internalToClient[DatThingAttr.ThingAttrNoMoveAnimation] = 16;
            for (let thingAttr = DatThingAttr.ThingAttrPickupable; thingAttr <= DatThingAttr.ThingAttrBones; ++thingAttr) {
                if (DatThingAttr[thingAttr] === undefined) {
                    continue;
                }
                internalToClient[thingAttr] = thingAttr + 1;
            }
            internalToClient[DatThingAttr.ThingAttrChargeable] = 0xFE;
        } else if (version >= 860) {
            /* 8.60-10.09 follow the 8.6-9.86 client bytes (identity mapping). */
        } else if (version >= 780) {
            /* 7.80-8.54: attributes from 8 up incremented by 1 for "Item Charges". */
            internalToClient[DatThingAttr.ThingAttrChargeable] = 8;
            for (let thingAttr = DatThingAttr.ThingAttrWritable; thingAttr <= DatThingAttr.ThingAttrLook; ++thingAttr) {
                internalToClient[thingAttr] = thingAttr + 1;
            }
            internalToClient[DatThingAttr.ThingAttrFloorChange] = 0x18;
            // IgnoreLook is client 0x20; do not leave Cloth on that byte (Cloth has a u16 payload).
            delete internalToClient[DatThingAttr.ThingAttrCloth];
            delete internalToClient[DatThingAttr.ThingAttrMarket];
            delete internalToClient[DatThingAttr.ThingAttrUsable];
            delete internalToClient[DatThingAttr.ThingAttrWrapable];
            delete internalToClient[DatThingAttr.ThingAttrUnwrapable];
            delete internalToClient[DatThingAttr.ThingAttrTopEffect];
            delete internalToClient[DatThingAttr.ThingAttrBones];
        } else if (version >= 755) {
            /* 7.55-7.72: client 23 is Floor Change. */
            internalToClient[DatThingAttr.ThingAttrFloorChange] = 23;
        } else if (version >= 740) {
            /* 7.40-7.50: no Ground Border; MultiUse/ForceUse swapped vs modern enum. */
            internalToClient[DatThingAttr.ThingAttrGround] = 0x00;
            internalToClient[DatThingAttr.ThingAttrOnBottom] = 0x01;
            internalToClient[DatThingAttr.ThingAttrOnTop] = 0x02;
            internalToClient[DatThingAttr.ThingAttrContainer] = 0x03;
            internalToClient[DatThingAttr.ThingAttrStackable] = 0x04;
            internalToClient[DatThingAttr.ThingAttrMultiUse] = 0x05;
            internalToClient[DatThingAttr.ThingAttrForceUse] = 0x06;
            internalToClient[DatThingAttr.ThingAttrWritable] = 0x07;
            internalToClient[DatThingAttr.ThingAttrWritableOnce] = 0x08;
            internalToClient[DatThingAttr.ThingAttrFluidContainer] = 0x09;
            internalToClient[DatThingAttr.ThingAttrSplash] = 0x0A;
            internalToClient[DatThingAttr.ThingAttrNotWalkable] = 0x0B;
            internalToClient[DatThingAttr.ThingAttrNotMoveable] = 0x0C;
            internalToClient[DatThingAttr.ThingAttrBlockProjectile] = 0x0D;
            internalToClient[DatThingAttr.ThingAttrNotPathable] = 0x0E;
            internalToClient[DatThingAttr.ThingAttrPickupable] = 0x0F;
            internalToClient[DatThingAttr.ThingAttrLight] = 0x10;
            internalToClient[DatThingAttr.ThingAttrFloorChange] = 0x11;
            internalToClient[DatThingAttr.ThingAttrFullGround] = 0x12;
            internalToClient[DatThingAttr.ThingAttrElevation] = 0x13;
            internalToClient[DatThingAttr.ThingAttrDisplacement] = 0x14;
            internalToClient[DatThingAttr.ThingAttrMinimapColor] = 0x16;
            internalToClient[DatThingAttr.ThingAttrRotateable] = 0x17;
            internalToClient[DatThingAttr.ThingAttrLyingCorpse] = 0x18;
            internalToClient[DatThingAttr.ThingAttrHangable] = 0x19;
            internalToClient[DatThingAttr.ThingAttrHookSouth] = 0x1A;
            internalToClient[DatThingAttr.ThingAttrHookEast] = 0x1B;
            internalToClient[DatThingAttr.ThingAttrAnimateAlways] = 0x1C;
            internalToClient[DatThingAttr.ThingAttrLensHelp] = 0x1D;
        } else {
            /* 7.10-7.30: like 7.40 but without hangable / hook flags. */
            internalToClient[DatThingAttr.ThingAttrGround] = 0x00;
            internalToClient[DatThingAttr.ThingAttrOnBottom] = 0x01;
            internalToClient[DatThingAttr.ThingAttrOnTop] = 0x02;
            internalToClient[DatThingAttr.ThingAttrContainer] = 0x03;
            internalToClient[DatThingAttr.ThingAttrStackable] = 0x04;
            internalToClient[DatThingAttr.ThingAttrMultiUse] = 0x05;
            internalToClient[DatThingAttr.ThingAttrForceUse] = 0x06;
            internalToClient[DatThingAttr.ThingAttrWritable] = 0x07;
            internalToClient[DatThingAttr.ThingAttrWritableOnce] = 0x08;
            internalToClient[DatThingAttr.ThingAttrFluidContainer] = 0x09;
            internalToClient[DatThingAttr.ThingAttrSplash] = 0x0A;
            internalToClient[DatThingAttr.ThingAttrNotWalkable] = 0x0B;
            internalToClient[DatThingAttr.ThingAttrNotMoveable] = 0x0C;
            internalToClient[DatThingAttr.ThingAttrBlockProjectile] = 0x0D;
            internalToClient[DatThingAttr.ThingAttrNotPathable] = 0x0E;
            internalToClient[DatThingAttr.ThingAttrPickupable] = 0x0F;
            internalToClient[DatThingAttr.ThingAttrLight] = 0x10;
            internalToClient[DatThingAttr.ThingAttrFloorChange] = 0x11;
            internalToClient[DatThingAttr.ThingAttrFullGround] = 0x12;
            internalToClient[DatThingAttr.ThingAttrElevation] = 0x13;
            internalToClient[DatThingAttr.ThingAttrDisplacement] = 0x14;
            internalToClient[DatThingAttr.ThingAttrMinimapColor] = 0x16;
            internalToClient[DatThingAttr.ThingAttrRotateable] = 0x17;
            internalToClient[DatThingAttr.ThingAttrLyingCorpse] = 0x18;
            internalToClient[DatThingAttr.ThingAttrAnimateAlways] = 0x19;
            internalToClient[DatThingAttr.ThingAttrLensHelp] = 0x1A;
        }

        const clientAttributesTranslator: any = {};
        const internals = Object.keys(internalToClient);
        for (let i = 0; i < internals.length; i++) {
            const internalAttr = Number(internals[i]);
            clientAttributesTranslator[internalToClient[internalAttr]] = internalAttr;
        }
        clientAttributesTranslator[DatThingAttr.ThingLastAttr] = DatThingAttr.ThingLastAttr;

        return clientAttributesTranslator;
    }

    getAttributesSortedAsInOfficialClient(): number[] {
        const version = this.m_client.getClientVersion();
        if (version < 740) {
            return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26];
        } else if (version < 755) {
            return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 28, 29];
        } else if (version < 780) {
            return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 29, 30];
        } else if (version < 860) {
            return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32];
        } else if (version < 1010) {
            return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33];
        }
        return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 254];
    }
    getSortedClientTranslationArray(): SortedDatAttribute[] {
        let sortedAsInOfficialClient = this.getAttributesSortedAsInOfficialClient();

        let sortedDatAttributes = [];
        const clientAttributeTranslator: any = this.getClientTranslationArray();
        for (let sortId of sortedAsInOfficialClient) {
            sortedDatAttributes.push(new SortedDatAttribute(sortId, clientAttributeTranslator[sortId]));
        }

        return sortedDatAttributes;
    }
}
